<script>
	import Datepicker from './Components/Datepicker.svelte';
	import { onMount } from 'svelte';

	const today = new Date();
	let start = new Date();
	let dateFormat = '#{l}, #{F} #{j}, #{Y}';
	let noWeekendsSelectableCallback = (date) => date.getDay() !== 0 && date.getDay() !== 6;
	let formattedSelected;
	let dateChosen = false;
	let exampleFormatted = false;
	let exampleChosen = false;
	
	$: end = new Date(start.getTime() + 1000 * 3600 * 24 * 720);
	
	let threeDaysInPast;
	$: {
	  const date = new Date(today);
	  date.setDate(date.getDate() - 3);
	  threeDaysInPast = date;
	}

	let tomorrow;
	$: {
	  const date = new Date(today);
	  date.setDate(date.getDate() + 1);
	  tomorrow = date;
	}

	let inThirtyDays;
	$: {
	  const date = new Date(start);
	  date.setDate(date.getDate() + 30);
	  inThirtyDays = date;
	}

	function logChoice(date) {
	  // eslint-disable-next-line
	  console.log(`User chose ${date}.`);
	}

	onMount(() => {
	  // eslint-disable-next-line
	  hljs.initHighlightingOnLoad();
	});
</script>

<h1>SvelteCalendar</h1>
<div class='container'>
	<p>A lightweight date picker written with Svelte. Here is an example: </p>

	<Datepicker format='{dateFormat}' />
	<!-- <Datepicker ref:cal {start} {end} format='mm/dd/yyyy' /> -->

	<p>This component can be used with or without the Svelte compiler.</p>
	<ul>
		<li>Lightweight (~8KB)</li>
		<li>IE11+ Compatible</li>
		<li>Usable as a Svelte component</li>
		<li>Usable with Vanilla JS / &lt;Your Framework Here&gt;</li>
		<li>Can be compiled to a native web component / custom element</li>
		<li>Mobile/thumb friendly</li>
		<li>Keyboard navigation (arrows, pgup/pgdown, tab, esc)</li>
	</ul>

	<p>Above you can see the default styling of this component.  This will be created for you by default when using the component but you can also pass in your own calendar 'trigger' either as a slot (custom element or svelte) or as a DOM node reference (use as vanilla JS).  Here are some examples:</p>

	<h4>With Svelte:</h4>
	<pre><code class='html'>
&lt;Datepicker format={dateFormat} bind:formattedSelected bind:dateChosen&gt;
  &lt;button class='custom-button'&gt;
    &#123;#if dateChosen} Chosen: &#123;formattedSelected} &#123;:else} Pick a date &#123;/if}
  &lt;/button&gt;
&lt;/Datepicker&gt;
	</code></pre>

	<div class='text-center'>
		<Datepicker format={dateFormat} bind:formattedSelected bind:dateChosen>
			<button class='custom-button'>
				{#if dateChosen} Chosen: {formattedSelected} {:else} Pick a date {/if}
			</button>
		</Datepicker>
	</div>

	<h4>Without Svelte HTML:</h4>
	<pre><code class='html'>
&lt;div class='button-container'&gt;
  &lt;button id='test'&gt;My Custom Button&lt;/button&gt;
&lt;/div&gt;
	</code></pre>

	<h4>Without Svelte JS:</h4>
	<pre><code class='js'>
var trigger = document.getElementById('test');
var cal = new SvelteCalendar(&#123; 
  target: document.querySelector('.button-container'),
  anchor: trigger, 
  props: &#123;
    trigger: trigger
  }
});
	</code></pre>

	<div class='text-center'>
		<Datepicker bind:formattedSelected={exampleFormatted} bind:dateChosen={exampleChosen}>
			<button id='test'>
				{#if exampleChosen} {exampleFormatted} {:else}  Custom Button {/if}
			</button>
		</Datepicker>
	</div>

	<p>You can confine the date selection range with start and end:</p>

	<div class='text-center'>
		<Datepicker format={dateFormat} start={threeDaysInPast} end={inThirtyDays} selectableCallback={noWeekendsSelectableCallback} />
	</div>

	<p class='note'>Note: The calendar will only generate dates up until the end date, so it is recommended to set this value to whatever is useful for you.</p>

	<p>You can also provide a `selectableCallback` prop which can be used to mark individual days between `start` and `end` as selectable.  This callback should accept a single date as an argument and return true (if selectable) or false (if unavailable).</p>

	<div class='text-center'>
		<Datepicker format={dateFormat} start={tomorrow} end={inThirtyDays} selectableCallback={noWeekendsSelectableCallback} />
	</div>

	<p>You can bind to the `dateSelected` event, which has a data property `date`:</p>
	
	<div class='text-center'>
		<Datepicker format={dateFormat} on:dateSelected={e => logChoice(e.detail.date)} />
	</div>
</div>

<style>
	h1 { 
		text-align: center;
		margin: 100px 0;
	}
	.container {
	  background: #eee;
		padding: 15px;
		max-width: 100%; 
		width: 800px;
		margin: 0 auto;
	}
	.custom-button {
	  display: inline-block;
	  background: rgb(0, 120, 255);
	  color: #eee;
	  border: 1px solid rgb(0, 100, 255);
	  text-align: center;
	  padding: 15px 30px;
	  cursor: pointer;
	}
	.text-center {
	  text-align: center;
	}
	.note {
		color: tomato;
	}
</style>
