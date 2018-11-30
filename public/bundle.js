var app = (function () {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function callAfter(fn, i) {
		if (i === 0) fn();
		return () => {
			if (!--i) fn();
		};
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		fn();
	}

	function append(target, node) {
		target.appendChild(node);
	}

	function insert(target, node, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function reinsertChildren(parent, target) {
		while (parent.firstChild) target.appendChild(parent.firstChild);
	}

	function destroyEach(iterations, detach) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detach);
		}
	}

	function createFragment() {
		return document.createDocumentFragment();
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function addListener(node, event, handler, options) {
		node.addEventListener(event, handler, options);
	}

	function removeListener(node, event, handler, options) {
		node.removeEventListener(event, handler, options);
	}

	function setAttribute(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else node.setAttribute(attribute, value);
	}

	function setData(text, data) {
		text.data = '' + data;
	}

	function setStyle(node, key, value) {
		node.style.setProperty(key, value);
	}

	function toggleClass(element, name, toggle) {
		element.classList.toggle(name, !!toggle);
	}

	function linear(t) {
		return t;
	}

	function generateRule({ a, b, delta, duration }, ease, fn) {
		const step = 16.666 / duration;
		let keyframes = '{\n';

		for (let p = 0; p <= 1; p += step) {
			const t = a + delta * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}

		return keyframes + `100% {${fn(b, 1 - b)}}\n}`;
	}

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
		let hash = 5381;
		let i = str.length;

		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	function wrapTransition(component, node, fn, params, intro) {
		let obj = fn.call(component, node, params);
		let duration;
		let ease;
		let cssText;

		let initialised = false;

		return {
			t: intro ? 0 : 1,
			running: false,
			program: null,
			pending: null,

			run(b, callback) {
				if (typeof obj === 'function') {
					transitionManager.wait().then(() => {
						obj = obj();
						this._run(b, callback);
					});
				} else {
					this._run(b, callback);
				}
			},

			_run(b, callback) {
				duration = obj.duration || 300;
				ease = obj.easing || linear;

				const program = {
					start: window.performance.now() + (obj.delay || 0),
					b,
					callback: callback || noop
				};

				if (intro && !initialised) {
					if (obj.css && obj.delay) {
						cssText = node.style.cssText;
						node.style.cssText += obj.css(0, 1);
					}

					if (obj.tick) obj.tick(0, 1);
					initialised = true;
				}

				if (!b) {
					program.group = outros.current;
					outros.current.remaining += 1;
				}

				if (obj.delay) {
					this.pending = program;
				} else {
					this.start(program);
				}

				if (!this.running) {
					this.running = true;
					transitionManager.add(this);
				}
			},

			start(program) {
				component.fire(`${program.b ? 'intro' : 'outro'}.start`, { node });

				program.a = this.t;
				program.delta = program.b - program.a;
				program.duration = duration * Math.abs(program.b - program.a);
				program.end = program.start + program.duration;

				if (obj.css) {
					if (obj.delay) node.style.cssText = cssText;

					const rule = generateRule(program, ease, obj.css);
					transitionManager.addRule(rule, program.name = '__svelte_' + hash(rule));

					node.style.animation = (node.style.animation || '')
						.split(', ')
						.filter(anim => anim && (program.delta < 0 || !/__svelte/.test(anim)))
						.concat(`${program.name} ${program.duration}ms linear 1 forwards`)
						.join(', ');
				}

				this.program = program;
				this.pending = null;
			},

			update(now) {
				const program = this.program;
				if (!program) return;

				const p = now - program.start;
				this.t = program.a + program.delta * ease(p / program.duration);
				if (obj.tick) obj.tick(this.t, 1 - this.t);
			},

			done() {
				const program = this.program;
				this.t = program.b;

				if (obj.tick) obj.tick(this.t, 1 - this.t);

				component.fire(`${program.b ? 'intro' : 'outro'}.end`, { node });

				if (!program.b && !program.invalidated) {
					program.group.callbacks.push(() => {
						program.callback();
						if (obj.css) transitionManager.deleteRule(node, program.name);
					});

					if (--program.group.remaining === 0) {
						program.group.callbacks.forEach(run);
					}
				} else {
					if (obj.css) transitionManager.deleteRule(node, program.name);
				}

				this.running = !!this.pending;
			},

			abort(reset) {
				if (this.program) {
					if (reset && obj.tick) obj.tick(1, 0);
					if (obj.css) transitionManager.deleteRule(node, this.program.name);
					this.program = this.pending = null;
					this.running = false;
				}
			},

			invalidate() {
				if (this.program) {
					this.program.invalidated = true;
				}
			}
		};
	}

	let outros = {};

	function groupOutros() {
		outros.current = {
			remaining: 0,
			callbacks: []
		};
	}

	var transitionManager = {
		running: false,
		transitions: [],
		bound: null,
		stylesheet: null,
		activeRules: {},
		promise: null,

		add(transition) {
			this.transitions.push(transition);

			if (!this.running) {
				this.running = true;
				requestAnimationFrame(this.bound || (this.bound = this.next.bind(this)));
			}
		},

		addRule(rule, name) {
			if (!this.stylesheet) {
				const style = createElement('style');
				document.head.appendChild(style);
				transitionManager.stylesheet = style.sheet;
			}

			if (!this.activeRules[name]) {
				this.activeRules[name] = true;
				this.stylesheet.insertRule(`@keyframes ${name} ${rule}`, this.stylesheet.cssRules.length);
			}
		},

		next() {
			this.running = false;

			const now = window.performance.now();
			let i = this.transitions.length;

			while (i--) {
				const transition = this.transitions[i];

				if (transition.program && now >= transition.program.end) {
					transition.done();
				}

				if (transition.pending && now >= transition.pending.start) {
					transition.start(transition.pending);
				}

				if (transition.running) {
					transition.update(now);
					this.running = true;
				} else if (!transition.pending) {
					this.transitions.splice(i, 1);
				}
			}

			if (this.running) {
				requestAnimationFrame(this.bound);
			} else if (this.stylesheet) {
				let i = this.stylesheet.cssRules.length;
				while (i--) this.stylesheet.deleteRule(i);
				this.activeRules = {};
			}
		},

		deleteRule(node, name) {
			node.style.animation = node.style.animation
				.split(', ')
				.filter(anim => anim && anim.indexOf(name) === -1)
				.join(', ');
		},

		wait() {
			if (!transitionManager.promise) {
				transitionManager.promise = Promise.resolve();
				transitionManager.promise.then(() => {
					transitionManager.promise = null;
				});
			}

			return transitionManager.promise;
		}
	};

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = noop;

		this._fragment.d(detach !== false);
		this._fragment = null;
		this._state = {};
	}

	function destroyDev(detach) {
		destroy.call(this, detach);
		this.destroy = function() {
			console.warn('Component was already destroyed');
		};
	}

	function _differs(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function fire(eventName, data) {
		var handlers =
			eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			var handler = handlers[i];

			if (!handler.__calling) {
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function flush(component) {
		component._lock = true;
		callAll(component._beforecreate);
		callAll(component._oncreate);
		callAll(component._aftercreate);
		component._lock = false;
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._slots = blankObject();
		component._bind = options._bind;
		component._staged = {};

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;

		if (!options.root) {
			component._beforecreate = [];
			component._oncreate = [];
			component._aftercreate = [];
		}
	}

	function on(eventName, handler) {
		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		flush(this.root);
	}

	function _set(newState) {
		var oldState = this._state,
			changed = {},
			dirty = false;

		newState = assign(this._staged, newState);
		this._staged = {};

		for (var key in newState) {
			if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(assign({}, oldState), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			this.fire("state", { changed: changed, current: this._state, previous: oldState });
			this._fragment.p(changed, this._state);
			this.fire("update", { changed: changed, current: this._state, previous: oldState });
		}
	}

	function _stage(newState) {
		assign(this._staged, newState);
	}

	function setDev(newState) {
		if (typeof newState !== 'object') {
			throw new Error(
				this._debugName + '.set was called without an object of data key-values to update.'
			);
		}

		this._checkReadOnly(newState);
		set.call(this, newState);
	}

	function callAll(fns) {
		while (fns && fns.length) fns.shift()();
	}

	function _mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	var protoDev = {
		destroy: destroyDev,
		get,
		fire,
		on,
		set: setDev,
		_recompute: noop,
		_set,
		_stage,
		_mount,
		_differs
	};

	const monthDict = [
	  {name: 'January', abbrev: 'Jan' },
	  {name: 'February', abbrev: 'Feb' },
	  {name: 'March', abbrev: 'Mar' },
	  {name: 'April', abbrev: 'Apr' },
	  {name: 'May', abbrev: 'May' },
	  {name: 'June', abbrev: 'Jun' },
	  {name: 'July', abbrev: 'Jul' },
	  {name: 'August', abbrev: 'Aug' },
	  {name: 'September', abbrev: 'Sep' },
	  {name: 'October', abbrev: 'Oct' },
	  {name: 'November', abbrev: 'Nov' },
	  {name: 'December', abbrev: 'Dec' }
	]; 

	const dayDict = [
	  {name: 'Sunday', abbrev: 'Sun'}, 
	  {name: 'Monday', abbrev: 'Mon'}, 
	  {name: 'Tuesday', abbrev: 'Tue'}, 
	  {name: 'Wednesday', abbrev: 'Wed'}, 
	  {name: 'Thursday', abbrev: 'Thu'}, 
	  {name: 'Friday', abbrev: 'Fri'}, 
	  {name: 'Saturday', abbrev: 'Sat'}
	];

	const getCalendarPage = (month,year,dayProps) => {
	  let date = new Date(year,month,1);
	  date.setDate(date.getDate() - date.getDay());
	  let nextMonth = month == 11 ? 0 : month + 1; 
	  // ensure days starts on Sunday
	  // and end on saturday
	  let weeks = []; 
	  while(date.getMonth() != nextMonth || date.getDay() != 0 || weeks.length != 6) { 
	    if(date.getDay() == 0) weeks.unshift({days: []});
	    weeks[0].days.push({
	      partOfMonth: date.getMonth() == month,
	      date: new Date(date), 
	      ...dayProps(date)
	    }); 
	    date.setDate(date.getDate() + 1);
	  }
	  weeks.reverse(); 
	  return { month, year, weeks }
	};

	const getDayPropsHandler = (start,end) => {
	  let today = new Date(); 
	  today.setHours(0,0,0,0);
	  return date => ({
	    selectable: date >= start && date <= end,
	    isToday: date.getTime() == today.getTime()
	  });
	};

	function getMonths(start, end) { 
	  start.setHours(0,0,0,0);
	  end.setHours(0,0,0,0);
	  let endDate = new Date(end.getFullYear(), end.getMonth() + 1, 1); 
	  let months = [ ]; 
	  let date = new Date(start.getFullYear(),start.getMonth(),1);
	  let dayPropsHandler = getDayPropsHandler(start,end);
	  while(date < endDate) { 
	    months.push(getCalendarPage(date.getMonth(),date.getFullYear(),dayPropsHandler)); 
	    date.setMonth(date.getMonth() + 1); 
	  }
	  return months;
	}

	/**
	 * generic function to inject data into token-laden string
	 * @param str {String} Required
	 * @param name {String} Required
	 * @param value {String|Integer} Required
	 * @returns {String}
	 *
	 * Pass this function a string with encoded tokens, example: 
	 *    injectStringData("The following is a token: #{tokenName}", "tokenName", 123); 
	 *   
	 *    Returns: "The following is a token: 123"
	 *
	 */
	var injectStringData = function(str,name,value) {
	  return str.replace(new RegExp('#{'+name+'}','g'),value);
	};

	/**
	 * generic function to enforce length of string
	 * @param str {String} Required
	 * @param length {Integer} Required
	 * @param fromBack {Boolean} Optional
	 * @returns {String}
	 *
	 * Pass a string or number to this function and specify the desired length.
	 * This function will either pad the # with leading 0's (if str.length < length)
	 * or remove data from the end (@fromBack==false) or beginning (@fromBack==true)
	 * of the string when str.length > length.
	 *
	 * When length == str.length or typeof length == 'undefined', this function
	 * returns the original @str parameter.
	 *
	 */
	var enforceLength = function(str,length,fromBack) {
	  str = str.toString();
	  if(typeof length == 'undefined') return str;
	  if(str.length == length) return str;
	  fromBack = (typeof fromBack == 'undefined') ? false : fromBack;
	  if(str.length < length) {
	    // pad the beginning of the string w/ enough 0's to reach desired length:
	    while(length - str.length > 0) str = '0' + str;
	  } else if(str.length > length) {
	    if(fromBack) {
	      // grab the desired #/chars from end of string: ex: '2015' -> '15'
	      str = str.substring(str.length-length);
	    } else {
	      // grab the desired #/chars from beginning of string: ex: '2015' -> '20'
	      str = str.substring(0,length);
	    }
	  }
	  return str;
	};

	// Internal variables for storing days of week, months of year: 
	var daysOfWeek = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
	var monthsOfYear = [ 'January','February','March','April','May','June','July','August','September','October','November','December'];

	var acceptedDateTokens = [
	  // d: day of the month, 2 digits with leading zeros:
	  { key: 'd', method: function(date) { return enforceLength(date.getDate(), 2); } },
	  // D: textual representation of day, 3 letters: Sun thru Sat
	  { key: 'D', method: function(date) { return enforceLength(daysOfWeek[date.getDay()],3); } },
	  // j: day of month without leading 0's
	  { key: 'j', method: function(date) { return date.getDate(); } },
	  // l: full textual representation of day of week: Sunday thru Saturday
	  { key: 'l', method: function(date) { return daysOfWeek[date.getDay()]; } },
	  // F: full text month: 'January' thru 'December'
	  { key: 'F', method: function(date) { return monthsOfYear[date.getMonth()]; } },
	  // m: 2 digit numeric month: '01' - '12':
	  { key: 'm', method: function(date) { return enforceLength(date.getMonth()+1,2); } },
	  // M: a short textual representation of the month, 3 letters: 'Jan' - 'Dec'
	  { key: 'M', method: function(date) { return enforceLength(monthsOfYear[date.getMonth()],3); } },
	  // n: numeric represetation of month w/o leading 0's, '1' - '12':
	  { key: 'n', method: function(date) { return date.getMonth() + 1; } },
	  // Y: Full numeric year, 4 digits
	  { key: 'Y', method: function(date) { return date.getFullYear(); } },
	  // y: 2 digit numeric year:
	  { key: 'y', method: function(date) { return enforceLength(date.getFullYear(),2,true); } }
	];

	var acceptedTimeTokens = [
	  // a: lowercase ante meridiem and post meridiem 'am' or 'pm'
	  { key: 'a', method: function(date) { return (date.getHours() > 11) ? 'pm' : 'am'; } },
	  // A: uppercase ante merdiiem and post meridiem 'AM' or 'PM'
	  { key: 'A', method: function(date) { return (date.getHours() > 11) ? 'PM' : 'AM'; } },
	  // g: 12-hour format of an hour without leading zeros 1-12
	  { key: 'g', method: function(date) { return date.getHours() % 12 || 12; } },
	  // G: 24-hour format of an hour without leading zeros 0-23
	  { key: 'G', method: function(date) { return date.getHours(); } },
	  // h: 12-hour format of an hour with leading zeros 01-12
	  { key: 'h', method: function(date) { return enforceLength(date.getHours()%12 || 12,2); } },
	  // H: 24-hour format of an hour with leading zeros: 00-23
	  { key: 'H', method: function(date) { return enforceLength(date.getHours(),2); } },
	  // i: Minutes with leading zeros 00-59
	  { key: 'i', method: function(date) { return enforceLength(date.getMinutes(),2); } },
	  // s: Seconds with leading zeros 00-59
	  { key: 's', method: function(date) { return enforceLength(date.getSeconds(),2); } }
	  // // T: Timezone abbreviation "EST", "MDT", ...
	  // { key: 'T', method: function(date) { return date.getTimezone(); } },
	  // O: Difference to Greenwich time (GMT) in hours  +0200, -0200
	  // { key: 'O', method: function(date) { return date.getGMTOffset(); } },
	  // 'P': Difference to Greenwich time (GMT) w/ semicolon between hours:minutes +02:00
	  // { key: 'P', method: function(date) { var offset = date.getGMTOffset(); return offset.slice(0,3)+':'+offset.slice(3); } }
	];

	/**
	 * generic formatDate function which accepts dynamic templates
	 * @param date {Date} Required
	 * @param template {String} Optional
	 * @returns {String}
	 *
	 * pass a date and a template, such as:
	 *
	 *    formatDate(new Date(), '#{M}. #{j}, #{Y}')
	 *
	 */
	function formatDate(date,template) {
	  template = (typeof template == 'undefined') ? '#{m}/#{d}/#{Y}' : template;
	  for(var i=0; i < acceptedDateTokens.length; ++i) {
	    if(template.indexOf('#{'+acceptedDateTokens[i].key+'}') > -1) {
	      template = injectStringData(template,acceptedDateTokens[i].key,acceptedDateTokens[i].method(date));
	    }
	  }
	  for(var i=0; i < acceptedTimeTokens.length; ++i) {
	    if(template.indexOf('#{'+acceptedTimeTokens[i].key+'}') > -1) {
	      template = injectStringData(template,acceptedTimeTokens[i].key,acceptedTimeTokens[i].method(date));
	    }
	  }
	  return template;
	}

	function fade ( node, ref ) {
		var delay = ref.delay; if ( delay === void 0 ) delay = 0;
		var duration = ref.duration; if ( duration === void 0 ) duration = 400;

		var o = +getComputedStyle( node ).opacity;

		return {
			delay: delay,
			duration: duration,
			css: function (t) { return ("opacity: " + (t * o)); }
		};
	}

	/* src/Components/Week.html generated by Svelte v2.15.3 */



	const file = "src/Components/Week.html";

	function click_handler(event) {
		const { component, ctx } = this._svelte;

		component.fire('dateSelected',ctx.day);
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.day = list[i];
		return child_ctx;
	}

	function create_main_fragment(component, ctx) {
		var div, current;

		var each_value = ctx.days;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
		}

		function outroBlock(i, detach, fn) {
			if (each_blocks[i]) {
				each_blocks[i].o(() => {
					if (detach) {
						each_blocks[i].d(detach);
						each_blocks[i] = null;
					}
					if (fn) fn();
				});
			}
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "week svelte-1m0vas8";
				addLoc(div, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].i(div, null);
				}

				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.days) {
					each_value = ctx.days;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block(component, child_ctx);
							each_blocks[i].c();
						}
						each_blocks[i].i(div, null);
					}

					groupOutros();
					for (; i < each_blocks.length; i += 1) outroBlock(i, 1);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				each_blocks = each_blocks.filter(Boolean);
				const countdown = callAfter(outrocallback, each_blocks.length);
				for (let i = 0; i < each_blocks.length; i += 1) outroBlock(i, 0, countdown);

				current = false;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (2:2) {#each days as day}
	function create_each_block(component, ctx) {
		var div1, div0, text0_value = ctx.day.date.getDate(), text0, text1, div1_transition, current;

		return {
			c: function create() {
				div1 = createElement("div");
				div0 = createElement("div");
				text0 = createText(text0_value);
				text1 = createText("\n    ");
				div0._svelte = { component, ctx };

				addListener(div0, "click", click_handler);
				div0.className = "day--label svelte-1m0vas8";
				addLoc(div0, file, 7, 6, 179);
				div1.className = "day svelte-1m0vas8";
				toggleClass(div1, "outside-month", !ctx.day.partOfMonth);
				toggleClass(div1, "is-today", ctx.day.isToday);
				addLoc(div1, file, 2, 4, 45);
			},

			m: function mount(target, anchor) {
				insert(target, div1, anchor);
				append(div1, div0);
				append(div0, text0);
				append(div1, text1);
				current = true;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((!current || changed.days) && text0_value !== (text0_value = ctx.day.date.getDate())) {
					setData(text0, text0_value);
				}

				div0._svelte.ctx = ctx;
				if (changed.days) {
					toggleClass(div1, "outside-month", !ctx.day.partOfMonth);
					toggleClass(div1, "is-today", ctx.day.isToday);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;
				if (component.root._intro) {
					if (div1_transition) div1_transition.invalidate();

					component.root._aftercreate.push(() => {
						if (!div1_transition) div1_transition = wrapTransition(component, div1, fade, {}, true);
						div1_transition.run(1);
					});
				}
				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (!div1_transition) div1_transition = wrapTransition(component, div1, fade, {}, false);
				div1_transition.run(0, () => {
					outrocallback();
					div1_transition = null;
				});

				current = false;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div1);
				}

				removeListener(div0, "click", click_handler);
				if (detach) {
					if (div1_transition) div1_transition.abort();
				}
			}
		};
	}

	function Week(options) {
		this._debugName = '<Week>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign({}, options.data);
		if (!('days' in this._state)) console.warn("<Week> was created without expected data property 'days'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Week.prototype, protoDev);

	Week.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src/Components/Months.html generated by Svelte v2.15.3 */

	function currentMonth({monthIndex,months}) {
		return months[monthIndex];
	}

	function data() { 
	  return { 
	    monthDict
	  }
	}
	const file$1 = "src/Components/Months.html";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.week = list[i];
		return child_ctx;
	}

	function create_main_fragment$1(component, ctx) {
		var div, current;

		var each_value = ctx.currentMonth.weeks;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
		}

		function outroBlock(i, detach, fn) {
			if (each_blocks[i]) {
				each_blocks[i].o(() => {
					if (detach) {
						each_blocks[i].d(detach);
						each_blocks[i] = null;
					}
					if (fn) fn();
				});
			}
		}

		return {
			c: function create() {
				div = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				div.className = "months-container svelte-nt8v0l";
				addLoc(div, file$1, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].i(div, null);
				}

				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.currentMonth) {
					each_value = ctx.currentMonth.weeks;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$1(component, child_ctx);
							each_blocks[i].c();
						}
						each_blocks[i].i(div, null);
					}

					groupOutros();
					for (; i < each_blocks.length; i += 1) outroBlock(i, 1);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				each_blocks = each_blocks.filter(Boolean);
				const countdown = callAfter(outrocallback, each_blocks.length);
				for (let i = 0; i < each_blocks.length; i += 1) outroBlock(i, 0, countdown);

				current = false;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div);
				}

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (2:2) {#each currentMonth.weeks as week}
	function create_each_block$1(component, ctx) {
		var current;

		var week_initial_data = { days: ctx.week.days };
		var week = new Week({
			root: component.root,
			store: component.store,
			data: week_initial_data
		});

		week.on("dateSelected", function(event) {
			component.fire("dateSelected", event);
		});

		return {
			c: function create() {
				week._fragment.c();
			},

			m: function mount(target, anchor) {
				week._mount(target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var week_changes = {};
				if (changed.currentMonth) week_changes.days = ctx.week.days;
				week._set(week_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				if (week) week._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy$$1(detach) {
				week.destroy(detach);
			}
		};
	}

	function Months(options) {
		this._debugName = '<Months>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data(), options.data);

		this._recompute({ monthIndex: 1, months: 1 }, this._state);
		if (!('monthIndex' in this._state)) console.warn("<Months> was created without expected data property 'monthIndex'");
		if (!('months' in this._state)) console.warn("<Months> was created without expected data property 'months'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$1(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Months.prototype, protoDev);

	Months.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('currentMonth' in newState && !this._updatingReadonlyProperty) throw new Error("<Months>: Cannot set read-only property 'currentMonth'");
	};

	Months.prototype._recompute = function _recompute(changed, state) {
		if (changed.monthIndex || changed.months) {
			if (this._differs(state.currentMonth, (state.currentMonth = currentMonth(state)))) changed.currentMonth = true;
		}
	};

	/* src/Components/NavBar.html generated by Svelte v2.15.3 */

	function data$1() { 
	  return { 
	    monthDict, 
	    monthSelectorOpen: false
	  }
	}
	var methods = { 
	  toggleMonthSelectorOpen() { 
	    let {monthSelectorOpen} = this.get(); 
	    monthSelectorOpen = !monthSelectorOpen;
	    this.set({monthSelectorOpen});
	  }, 
	  monthSelected(event,month) { 
	    event.stopPropagation(); 
	    this.fire('monthSelected', month);
	    this.toggleMonthSelectorOpen();
	  }
	};

	const file$2 = "src/Components/NavBar.html";

	function click_handler$1(event) {
		const { component, ctx } = this._svelte;

		component.monthSelected(event,ctx.index);
	}

	function get_each_context$2(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.monthDefinition = list[i];
		child_ctx.index = i;
		return child_ctx;
	}

	function create_main_fragment$2(component, ctx) {
		var div5, div3, div0, i0, text0, div1, text1_value = ctx.monthDict[ctx.month].name, text1, text2, text3, text4, div2, i1, text5, div4, current;

		function click_handler(event) {
			component.fire('incrementMonth', -1);
		}

		function click_handler_1(event) {
			component.toggleMonthSelectorOpen();
		}

		function click_handler_2(event) {
			component.fire('incrementMonth', 1);
		}

		var each_value = ctx.monthDict;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context$2(ctx, each_value, i));
		}

		return {
			c: function create() {
				div5 = createElement("div");
				div3 = createElement("div");
				div0 = createElement("div");
				i0 = createElement("i");
				text0 = createText("\n    ");
				div1 = createElement("div");
				text1 = createText(text1_value);
				text2 = createText(" ");
				text3 = createText(ctx.year);
				text4 = createText(" \n    ");
				div2 = createElement("div");
				i1 = createElement("i");
				text5 = createText("\n  ");
				div4 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				i0.className = "arrow left svelte-w64iwt";
				addLoc(i0, file$2, 5, 6, 169);
				addListener(div0, "click", click_handler);
				div0.className = "control svelte-w64iwt";
				toggleClass(div0, "enabled", ctx.canDecrementMonth);
				addLoc(div0, file$2, 2, 4, 56);
				addListener(div1, "click", click_handler_1);
				div1.className = "label svelte-w64iwt";
				addLoc(div1, file$2, 7, 4, 211);
				i1.className = "arrow right svelte-w64iwt";
				addLoc(i1, file$2, 13, 6, 432);
				addListener(div2, "click", click_handler_2);
				div2.className = "control svelte-w64iwt";
				toggleClass(div2, "enabled", ctx.canIncrementMonth);
				addLoc(div2, file$2, 10, 4, 321);
				div3.className = "heading-section svelte-w64iwt";
				addLoc(div3, file$2, 1, 2, 22);
				div4.className = "month-selector svelte-w64iwt";
				toggleClass(div4, "open", ctx.monthSelectorOpen);
				addLoc(div4, file$2, 16, 2, 482);
				div5.className = "title";
				addLoc(div5, file$2, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div5, anchor);
				append(div5, div3);
				append(div3, div0);
				append(div0, i0);
				append(div3, text0);
				append(div3, div1);
				append(div1, text1);
				append(div1, text2);
				append(div1, text3);
				append(div3, text4);
				append(div3, div2);
				append(div2, i1);
				append(div5, text5);
				append(div5, div4);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div4, null);
				}

				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.canDecrementMonth) {
					toggleClass(div0, "enabled", ctx.canDecrementMonth);
				}

				if ((changed.monthDict || changed.month) && text1_value !== (text1_value = ctx.monthDict[ctx.month].name)) {
					setData(text1, text1_value);
				}

				if (changed.year) {
					setData(text3, ctx.year);
				}

				if (changed.canIncrementMonth) {
					toggleClass(div2, "enabled", ctx.canIncrementMonth);
				}

				if (changed.month || changed.monthDict) {
					each_value = ctx.monthDict;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$2(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div4, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				if (changed.monthSelectorOpen) {
					toggleClass(div4, "open", ctx.monthSelectorOpen);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div5);
				}

				removeListener(div0, "click", click_handler);
				removeListener(div1, "click", click_handler_1);
				removeListener(div2, "click", click_handler_2);

				destroyEach(each_blocks, detach);
			}
		};
	}

	// (18:4) {#each monthDict as monthDefinition, index}
	function create_each_block$2(component, ctx) {
		var div, span, text0_value = ctx.monthDefinition.abbrev, text0, text1;

		return {
			c: function create() {
				div = createElement("div");
				span = createElement("span");
				text0 = createText(text0_value);
				text1 = createText("\n      ");
				span.className = "svelte-w64iwt";
				addLoc(span, file$2, 23, 8, 741);

				div._svelte = { component, ctx };

				addListener(div, "click", click_handler$1);
				div.className = "month-selector--month svelte-w64iwt";
				toggleClass(div, "selected", ctx.index==ctx.month);
				addLoc(div, file$2, 18, 6, 596);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				append(span, text0);
				append(div, text1);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if ((changed.monthDict) && text0_value !== (text0_value = ctx.monthDefinition.abbrev)) {
					setData(text0, text0_value);
				}

				div._svelte.ctx = ctx;
				if (changed.month) {
					toggleClass(div, "selected", ctx.index==ctx.month);
				}
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div);
				}

				removeListener(div, "click", click_handler$1);
			}
		};
	}

	function NavBar(options) {
		this._debugName = '<NavBar>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$1(), options.data);
		if (!('canDecrementMonth' in this._state)) console.warn("<NavBar> was created without expected data property 'canDecrementMonth'");
		if (!('monthDict' in this._state)) console.warn("<NavBar> was created without expected data property 'monthDict'");
		if (!('month' in this._state)) console.warn("<NavBar> was created without expected data property 'month'");
		if (!('year' in this._state)) console.warn("<NavBar> was created without expected data property 'year'");
		if (!('canIncrementMonth' in this._state)) console.warn("<NavBar> was created without expected data property 'canIncrementMonth'");
		if (!('monthSelectorOpen' in this._state)) console.warn("<NavBar> was created without expected data property 'monthSelectorOpen'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$2(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}

		this._intro = true;
	}

	assign(NavBar.prototype, protoDev);
	assign(NavBar.prototype, methods);

	NavBar.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src/Components/Popover.html generated by Svelte v2.15.3 */

	function checkIfFocusLost(evt) { 
	  let { open } = this.get(); 
	  if(!open) return;
	  let el = evt.target;
	  do {
	    if(el == this.refs.popover) return false;
	  } while(el = el.parentNode)
	  this.set({open: false});
	}
	function something({w,h}) {
		return console.log(w,h);
	}

	function data$2() { 
	  return { 
	    open: false,
	    translateY: 0,
	    translateX: 0
	  }
	}
	var methods$1 = { 
	  getTranslate() { 
	    let { contents } = this.refs;
	    let { translateX, translateY } = this.get(); 
	    let boundingRect = contents.getBoundingClientRect();
	    let distToTop = boundingRect.top - translateY; 
	    let wWidth = window.innerWidth;
	    let wHeight = window.innerHeight;
	    let width = contents.offsetWidth; 
	    let height = contents.offsetHeight;
	    translateY = distToTop < 0 ? Math.abs(distToTop) : 0;
	    return { translateX, translateY }  
	  },
	  open() { 
	    let translate = this.getTranslate();
	    this.set({open: true, ...translate});
	  },
	  close() { 
	    this.set({open:false});
	  }
	};

	function oncreate() { 
	  document.addEventListener('click',checkIfFocusLost.bind(this)); 
	}
	function ondestroy() { 
	  document.removeEventListener('click', checkIfFocusLost);
	}
	const file$3 = "src/Components/Popover.html";

	function create_main_fragment$3(component, ctx) {
		var div4, div0, slot_content_trigger = component._slotted.trigger, text, div3, div2, div1, slot_content_contents = component._slotted.contents, current;

		function onwindowresize(event) {
			component._updatingReadonlyProperty = true;

			component.set({
				innerWidth: this.innerWidth
			});

			component._updatingReadonlyProperty = false;
		}
		window.addEventListener("resize", onwindowresize);

		function click_handler(event) {
			component.open();
		}

		return {
			c: function create() {
				div4 = createElement("div");
				div0 = createElement("div");
				text = createText("\n  ");
				div3 = createElement("div");
				div2 = createElement("div");
				div1 = createElement("div");
				addListener(div0, "click", click_handler);
				div0.className = "trigger svelte-cnyx91";
				addLoc(div0, file$3, 2, 2, 70);
				div1.className = "contents-inner svelte-cnyx91";
				addLoc(div1, file$3, 12, 6, 358);
				div2.className = "contents svelte-cnyx91";
				addLoc(div2, file$3, 11, 4, 329);
				div3.className = "contents-wrapper svelte-cnyx91";
				setStyle(div3, "transform", "translate(-50%,-50%) translate(" + ctx.translateX + "px, " + ctx.translateY + "px)");
				toggleClass(div3, "visible", ctx.open);
				addLoc(div3, file$3, 6, 2, 159);
				div4.className = "popover svelte-cnyx91";
				addLoc(div4, file$3, 1, 0, 34);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div0);

				if (slot_content_trigger) {
					append(div0, slot_content_trigger);
				}

				append(div4, text);
				append(div4, div3);
				append(div3, div2);
				append(div2, div1);

				if (slot_content_contents) {
					append(div1, slot_content_contents);
				}

				component.refs.contents = div3;
				component.refs.popover = div4;
				current = true;
			},

			p: function update(changed, ctx) {
				if (changed.translateX || changed.translateY) {
					setStyle(div3, "transform", "translate(-50%,-50%) translate(" + ctx.translateX + "px, " + ctx.translateY + "px)");
				}

				if (changed.open) {
					toggleClass(div3, "visible", ctx.open);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: run,

			d: function destroy$$1(detach) {
				window.removeEventListener("resize", onwindowresize);

				if (detach) {
					detachNode(div4);
				}

				if (slot_content_trigger) {
					reinsertChildren(div0, slot_content_trigger);
				}

				removeListener(div0, "click", click_handler);

				if (slot_content_contents) {
					reinsertChildren(div1, slot_content_contents);
				}

				if (component.refs.contents === div3) component.refs.contents = null;
				if (component.refs.popover === div4) component.refs.popover = null;
			}
		};
	}

	function Popover(options) {
		this._debugName = '<Popover>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$2(), options.data);
		this._state.innerWidth = window.innerWidth;
		this._recompute({ w: 1, h: 1 }, this._state);
		if (!('w' in this._state)) console.warn("<Popover> was created without expected data property 'w'");
		if (!('h' in this._state)) console.warn("<Popover> was created without expected data property 'h'");
		if (!('innerWidth' in this._state)) console.warn("<Popover> was created without expected data property 'innerWidth'");
		if (!('open' in this._state)) console.warn("<Popover> was created without expected data property 'open'");
		if (!('translateX' in this._state)) console.warn("<Popover> was created without expected data property 'translateX'");
		if (!('translateY' in this._state)) console.warn("<Popover> was created without expected data property 'translateY'");
		this._intro = !!options.intro;

		this._handlers.destroy = [ondestroy];

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$3(this, this._state);

		this.root._oncreate.push(() => {
			oncreate.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Popover.prototype, protoDev);
	assign(Popover.prototype, methods$1);

	Popover.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('innerWidth' in newState && !this._updatingReadonlyProperty) throw new Error("<Popover>: Cannot set read-only property 'innerWidth'");
		if ('something' in newState && !this._updatingReadonlyProperty) throw new Error("<Popover>: Cannot set read-only property 'something'");
	};

	Popover.prototype._recompute = function _recompute(changed, state) {
		if (changed.w || changed.h) {
			if (this._differs(state.something, (state.something = something(state)))) changed.something = true;
		}
	};

	/* src/Components/Datepicker.html generated by Svelte v2.15.3 */
	function months({start, end}) {
		return getMonths(start,end);
	}

	function monthIndex({month,year,months}) { 
	  for(let i = 0; i < months.length; ++i) { 
	    if(months[i].month == month && months[i].year == year) return i
	  }
	  return 0; 
	}

	function canIncrementMonth({monthIndex,months}) {
		return monthIndex < months.length -1;
	}

	function canDecrementMonth({monthIndex,months}) {
		return monthIndex > 0;
	}

	function formattedSelected({selected,format}) {
		return formatDate(selected,format);
	}

	function data$3() { 
	  let today = new Date(); 
	  return { 
	    today,
	    dayDict,
	    format: '#{m}/#{d}/#{Y}',
	    start: new Date(1987, 9, 29), 
	    end: new Date(2020, 9, 29),
	    selected: today, 
	    month: today.getMonth(), 
	    year: today.getFullYear()
	  }
	}
	var methods$2 = { 
	  changeMonth(month) { 
	    this.set({month});
	  },
	  incrementMonth(direction) {
	    let { canIncrementMonth, canDecrementMonth, month, year } = this.get(); 
	    if(direction == 1 && !canIncrementMonth) return;
	    if(direction == -1 && !canDecrementMonth) return;
	    let current = new Date(year,month,1); 
	    current.setMonth(current.getMonth() + direction); 
	    this.set({
	      month: current.getMonth(),
	      year: current.getFullYear()
	    });
	  },
	  registerSelection(selection) { 
	    this.refs.popover.close(); 
	    this.set({selected: selection.date});
	  }
	};

	function oncreate$1() { 
	  let { selected } = this.get(); 
	  this.set({
	    month: selected.getMonth(), 
	    year: selected.getFullYear()
	  });
	}
	const file$4 = "src/Components/Datepicker.html";

	function get_each_context$3(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.day = list[i];
		return child_ctx;
	}

	function create_main_fragment$4(component, ctx) {
		var div4, div0, slot_content_default = component._slotted.default, a, text0, text1, div3, div2, text2, div1, text3, popover_updating = {}, current;

		var navbar_initial_data = {
		 	month: ctx.month,
		 	year: ctx.year,
		 	canIncrementMonth: ctx.canIncrementMonth,
		 	canDecrementMonth: ctx.canDecrementMonth
		 };
		var navbar = new NavBar({
			root: component.root,
			store: component.store,
			data: navbar_initial_data
		});

		navbar.on("monthSelected", function(event) {
			component.changeMonth(event);
		});
		navbar.on("incrementMonth", function(event) {
			component.incrementMonth(event);
		});

		var each_value = ctx.dayDict;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(component, get_each_context$3(ctx, each_value, i));
		}

		var months_1_initial_data = {
		 	months: ctx.months,
		 	month: ctx.month,
		 	year: ctx.year,
		 	monthIndex: ctx.monthIndex
		 };
		var months_1 = new Months({
			root: component.root,
			store: component.store,
			data: months_1_initial_data
		});

		months_1.on("dateSelected", function(event) {
			component.registerSelection(event);
		});

		var popover_initial_data = {};
		if (ctx.isOpen !== void 0) {
			popover_initial_data.open = ctx.isOpen;
			popover_updating.open = true;
		}
		var popover = new Popover({
			root: component.root,
			store: component.store,
			slots: { default: createFragment(), contents: createFragment(), trigger: createFragment() },
			data: popover_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!popover_updating.open && changed.open) {
					newState.isOpen = childState.open;
				}
				component._set(newState);
				popover_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			popover._bind({ open: 1 }, popover.get());
		});

		component.refs.popover = popover;

		return {
			c: function create() {
				div4 = createElement("div");
				div0 = createElement("div");
				if (!slot_content_default) {
					a = createElement("a");
					text0 = createText(ctx.formattedSelected);
				}
				text1 = createText("\n    ");
				div3 = createElement("div");
				div2 = createElement("div");
				navbar._fragment.c();
				text2 = createText("\n        ");
				div1 = createElement("div");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text3 = createText("\n        ");
				months_1._fragment.c();
				popover._fragment.c();
				if (!slot_content_default) {
					a.href = "#open-calendar";
					a.className = "calendar-button svelte-1uvtqlc";
					addLoc(a, file$4, 4, 8, 134);
				}
				setAttribute(div0, "slot", "trigger");
				div0.className = "svelte-1uvtqlc";
				addLoc(div0, file$4, 2, 4, 92);
				div1.className = "legend svelte-1uvtqlc";
				addLoc(div1, file$4, 19, 8, 540);
				div2.className = "calendar svelte-1uvtqlc";
				addLoc(div2, file$4, 10, 6, 284);
				setAttribute(div3, "slot", "contents");
				div3.className = "svelte-1uvtqlc";
				addLoc(div3, file$4, 9, 4, 256);
				div4.className = "datepicker svelte-1uvtqlc";
				toggleClass(div4, "open", ctx.isOpen);
				addLoc(div4, file$4, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div4, anchor);
				append(popover._slotted.trigger, div0);
				if (!slot_content_default) {
					append(div0, a);
					append(a, text0);
				}

				else {
					append(div0, slot_content_default);
				}

				append(popover._slotted.default, text1);
				append(popover._slotted.contents, div3);
				append(div3, div2);
				navbar._mount(div2, null);
				append(div2, text2);
				append(div2, div1);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div1, null);
				}

				append(div2, text3);
				months_1._mount(div2, null);
				popover._mount(div4, null);
				current = true;
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (!slot_content_default) {
					if (!current || changed.formattedSelected) {
						setData(text0, ctx.formattedSelected);
				}

				}

				var navbar_changes = {};
				if (changed.month) navbar_changes.month = ctx.month;
				if (changed.year) navbar_changes.year = ctx.year;
				if (changed.canIncrementMonth) navbar_changes.canIncrementMonth = ctx.canIncrementMonth;
				if (changed.canDecrementMonth) navbar_changes.canDecrementMonth = ctx.canDecrementMonth;
				navbar._set(navbar_changes);

				if (changed.dayDict) {
					each_value = ctx.dayDict;

					for (var i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block$3(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div1, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}

				var months_1_changes = {};
				if (changed.months) months_1_changes.months = ctx.months;
				if (changed.month) months_1_changes.month = ctx.month;
				if (changed.year) months_1_changes.year = ctx.year;
				if (changed.monthIndex) months_1_changes.monthIndex = ctx.monthIndex;
				months_1._set(months_1_changes);

				var popover_changes = {};
				if (!popover_updating.open && changed.isOpen) {
					popover_changes.open = ctx.isOpen;
					popover_updating.open = ctx.isOpen !== void 0;
				}
				popover._set(popover_changes);
				popover_updating = {};

				if (changed.isOpen) {
					toggleClass(div4, "open", ctx.isOpen);
				}
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 3);

				if (navbar) navbar._fragment.o(outrocallback);
				if (months_1) months_1._fragment.o(outrocallback);
				if (popover) popover._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div4);
				}

				if (slot_content_default) {
					reinsertChildren(div0, slot_content_default);
				}

				navbar.destroy();

				destroyEach(each_blocks, detach);

				months_1.destroy();
				popover.destroy();
				if (component.refs.popover === popover) component.refs.popover = null;
			}
		};
	}

	// (21:10) {#each dayDict as day}
	function create_each_block$3(component, ctx) {
		var span, text_value = ctx.day.abbrev, text;

		return {
			c: function create() {
				span = createElement("span");
				text = createText(text_value);
				span.className = "svelte-1uvtqlc";
				addLoc(span, file$4, 21, 12, 606);
			},

			m: function mount(target, anchor) {
				insert(target, span, anchor);
				append(span, text);
			},

			p: function update(changed, ctx) {
				if ((changed.dayDict) && text_value !== (text_value = ctx.day.abbrev)) {
					setData(text, text_value);
				}
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(span);
				}
			}
		};
	}

	function Datepicker(options) {
		this._debugName = '<Datepicker>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this.refs = {};
		this._state = assign(data$3(), options.data);

		this._recompute({ start: 1, end: 1, month: 1, year: 1, months: 1, monthIndex: 1, selected: 1, format: 1 }, this._state);
		if (!('start' in this._state)) console.warn("<Datepicker> was created without expected data property 'start'");
		if (!('end' in this._state)) console.warn("<Datepicker> was created without expected data property 'end'");
		if (!('month' in this._state)) console.warn("<Datepicker> was created without expected data property 'month'");
		if (!('year' in this._state)) console.warn("<Datepicker> was created without expected data property 'year'");


		if (!('selected' in this._state)) console.warn("<Datepicker> was created without expected data property 'selected'");
		if (!('format' in this._state)) console.warn("<Datepicker> was created without expected data property 'format'");
		if (!('isOpen' in this._state)) console.warn("<Datepicker> was created without expected data property 'isOpen'");



		if (!('dayDict' in this._state)) console.warn("<Datepicker> was created without expected data property 'dayDict'");
		this._intro = !!options.intro;

		this._slotted = options.slots || {};

		this._fragment = create_main_fragment$4(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$1.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(Datepicker.prototype, protoDev);
	assign(Datepicker.prototype, methods$2);

	Datepicker.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('months' in newState && !this._updatingReadonlyProperty) throw new Error("<Datepicker>: Cannot set read-only property 'months'");
		if ('monthIndex' in newState && !this._updatingReadonlyProperty) throw new Error("<Datepicker>: Cannot set read-only property 'monthIndex'");
		if ('canIncrementMonth' in newState && !this._updatingReadonlyProperty) throw new Error("<Datepicker>: Cannot set read-only property 'canIncrementMonth'");
		if ('canDecrementMonth' in newState && !this._updatingReadonlyProperty) throw new Error("<Datepicker>: Cannot set read-only property 'canDecrementMonth'");
		if ('formattedSelected' in newState && !this._updatingReadonlyProperty) throw new Error("<Datepicker>: Cannot set read-only property 'formattedSelected'");
	};

	Datepicker.prototype._recompute = function _recompute(changed, state) {
		if (changed.start || changed.end) {
			if (this._differs(state.months, (state.months = months(state)))) changed.months = true;
		}

		if (changed.month || changed.year || changed.months) {
			if (this._differs(state.monthIndex, (state.monthIndex = monthIndex(state)))) changed.monthIndex = true;
		}

		if (changed.monthIndex || changed.months) {
			if (this._differs(state.canIncrementMonth, (state.canIncrementMonth = canIncrementMonth(state)))) changed.canIncrementMonth = true;
			if (this._differs(state.canDecrementMonth, (state.canDecrementMonth = canDecrementMonth(state)))) changed.canDecrementMonth = true;
		}

		if (changed.selected || changed.format) {
			if (this._differs(state.formattedSelected, (state.formattedSelected = formattedSelected(state)))) changed.formattedSelected = true;
		}
	};

	/* src/App.html generated by Svelte v2.15.3 */

	function end({start}) {
		return new Date(start.getTime() + (1000 * 3600 * 24 * 720));
	}

	function data$4() { 
		return { 
	        start: new Date(), 
	        dateFormat: '#{l}, #{F} #{j}, #{Y}'
		}
	}
	const file$5 = "src/App.html";

	function create_main_fragment$5(component, ctx) {
		var h1, text1, p0, text3, text4, p1, text6, p2, text8, text9, p3, text11, p4, text13, p5, text15, current;

		var datepicker0_initial_data = { format: ctx.dateFormat };
		var datepicker0 = new Datepicker({
			root: component.root,
			store: component.store,
			data: datepicker0_initial_data
		});

		var datepicker1 = new Datepicker({
			root: component.root,
			store: component.store
		});

		var datepicker2 = new Datepicker({
			root: component.root,
			store: component.store
		});

		return {
			c: function create() {
				h1 = createElement("h1");
				h1.textContent = "Date Picker";
				text1 = createText("\n");
				p0 = createElement("p");
				p0.textContent = "Get your dates here, hot off the presses.";
				text3 = createText("\n");
				datepicker0._fragment.c();
				text4 = createText("\n\n\n");
				p1 = createElement("p");
				p1.textContent = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit mollitia fugiat praesentium, beatae possimus vero ullam voluptatibus numquam nostrum magni enim expedita commodi doloribus assumenda fuga? Veniam pariatur laudantium amet?";
				text6 = createText("\n");
				p2 = createElement("p");
				p2.textContent = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit mollitia fugiat praesentium, beatae possimus vero ullam voluptatibus numquam nostrum magni enim expedita commodi doloribus assumenda fuga? Veniam pariatur laudantium amet?";
				text8 = createText("\n\n");
				datepicker1._fragment.c();
				text9 = createText("\n\n");
				p3 = createElement("p");
				p3.textContent = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit mollitia fugiat praesentium, beatae possimus vero ullam voluptatibus numquam nostrum magni enim expedita commodi doloribus assumenda fuga? Veniam pariatur laudantium amet?";
				text11 = createText("\n");
				p4 = createElement("p");
				p4.textContent = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit mollitia fugiat praesentium, beatae possimus vero ullam voluptatibus numquam nostrum magni enim expedita commodi doloribus assumenda fuga? Veniam pariatur laudantium amet?";
				text13 = createText("\n");
				p5 = createElement("p");
				p5.textContent = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit mollitia fugiat praesentium, beatae possimus vero ullam voluptatibus numquam nostrum magni enim expedita commodi doloribus assumenda fuga? Veniam pariatur laudantium amet?";
				text15 = createText("\n\n");
				datepicker2._fragment.c();
				addLoc(h1, file$5, 0, 0, 0);
				addLoc(p0, file$5, 1, 0, 21);
				addLoc(p1, file$5, 5, 0, 174);
				addLoc(p2, file$5, 6, 0, 417);
				addLoc(p3, file$5, 10, 0, 677);
				addLoc(p4, file$5, 11, 0, 920);
				addLoc(p5, file$5, 12, 0, 1163);
			},

			m: function mount(target, anchor) {
				insert(target, h1, anchor);
				insert(target, text1, anchor);
				insert(target, p0, anchor);
				insert(target, text3, anchor);
				datepicker0._mount(target, anchor);
				insert(target, text4, anchor);
				insert(target, p1, anchor);
				insert(target, text6, anchor);
				insert(target, p2, anchor);
				insert(target, text8, anchor);
				datepicker1._mount(target, anchor);
				insert(target, text9, anchor);
				insert(target, p3, anchor);
				insert(target, text11, anchor);
				insert(target, p4, anchor);
				insert(target, text13, anchor);
				insert(target, p5, anchor);
				insert(target, text15, anchor);
				datepicker2._mount(target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var datepicker0_changes = {};
				if (changed.dateFormat) datepicker0_changes.format = ctx.dateFormat;
				datepicker0._set(datepicker0_changes);
			},

			i: function intro(target, anchor) {
				if (current) return;

				this.m(target, anchor);
			},

			o: function outro(outrocallback) {
				if (!current) return;

				outrocallback = callAfter(outrocallback, 3);

				if (datepicker0) datepicker0._fragment.o(outrocallback);
				if (datepicker1) datepicker1._fragment.o(outrocallback);
				if (datepicker2) datepicker2._fragment.o(outrocallback);
				current = false;
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(h1);
					detachNode(text1);
					detachNode(p0);
					detachNode(text3);
				}

				datepicker0.destroy(detach);
				if (detach) {
					detachNode(text4);
					detachNode(p1);
					detachNode(text6);
					detachNode(p2);
					detachNode(text8);
				}

				datepicker1.destroy(detach);
				if (detach) {
					detachNode(text9);
					detachNode(p3);
					detachNode(text11);
					detachNode(p4);
					detachNode(text13);
					detachNode(p5);
					detachNode(text15);
				}

				datepicker2.destroy(detach);
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) {
			throw new Error("'target' is a required option");
		}

		init(this, options);
		this._state = assign(data$4(), options.data);

		this._recompute({ start: 1 }, this._state);
		if (!('start' in this._state)) console.warn("<App> was created without expected data property 'start'");
		if (!('dateFormat' in this._state)) console.warn("<App> was created without expected data property 'dateFormat'");
		this._intro = !!options.intro;

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}

		this._intro = true;
	}

	assign(App.prototype, protoDev);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('end' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'end'");
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.start) {
			if (this._differs(state.end, (state.end = end(state)))) changed.end = true;
		}
	};

	const app = new App({
		target: document.body,
		data: {
			// name: 'world'
		}
	});

	return app;

}());
//# sourceMappingURL=bundle.js.map
