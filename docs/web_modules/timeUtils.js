/**
 * generic function to inject data into token-laden string
 * @param str {String} Required
 * @param name {String} Required
 * @param value {String|Integer} Required
 * @returns {String}
 *
 * @example
 * injectStringData("The following is a token: #{tokenName}", "tokenName", 123); 
 * @returns {String} "The following is a token: 123"
 *
 */
const injectStringData = (str,name,value) => str
  .replace(new RegExp('#{'+name+'}','g'), value);

/**
 * Generic function to enforce length of string. 
 * 
 * Pass a string or number to this function and specify the desired length.
 * This function will either pad the # with leading 0's (if str.length < length)
 * or remove data from the end (@fromBack==false) or beginning (@fromBack==true)
 * of the string when str.length > length.
 *
 * When length == str.length or typeof length == 'undefined', this function
 * returns the original @str parameter.
 * 
 * @param str {String} Required
 * @param length {Integer} Required
 * @param fromBack {Boolean} Optional
 * @returns {String}
 *
 */
const enforceLength = function(str,length,fromBack) {
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

const daysOfWeek = [ 
  [ 'Sunday', 'Sun' ],
  [ 'Monday', 'Mon' ],
  [ 'Tuesday', 'Tue' ],
  [ 'Wednesday', 'Wed' ],
  [ 'Thursday', 'Thu' ],
  [ 'Friday', 'Fri' ],
  [ 'Saturday', 'Sat' ]
];

const monthsOfYear = [ 
  [ 'January', 'Jan' ],
  [ 'February', 'Feb' ],
  [ 'March', 'Mar' ],
  [ 'April', 'Apr' ],
  [ 'May', 'May' ],
  [ 'June', 'Jun' ],
  [ 'July', 'Jul' ],
  [ 'August', 'Aug' ],
  [ 'September', 'Sep' ],
  [ 'October', 'Oct' ],
  [ 'November', 'Nov' ],
  [ 'December', 'Dec' ]
];

let dictionary = { 
  daysOfWeek, 
  monthsOfYear
};

const extendDictionary = (conf) => 
  Object.keys(conf).forEach(key => {
    if(dictionary[key] && dictionary[key].length == conf[key].length) {
      dictionary[key] = conf[key];
    }
  });

var acceptedDateTokens = [
  { 
    // d: day of the month, 2 digits with leading zeros:
    key: 'd', 
    method: function(date) { return enforceLength(date.getDate(), 2); } 
  }, { 
    // D: textual representation of day, 3 letters: Sun thru Sat
    key: 'D', 
    method: function(date) { return dictionary.daysOfWeek[date.getDay()][1]; } 
  }, { 
    // j: day of month without leading 0's
    key: 'j', 
    method: function(date) { return date.getDate(); } 
  }, { 
    // l: full textual representation of day of week: Sunday thru Saturday
    key: 'l', 
    method: function(date) { return dictionary.daysOfWeek[date.getDay()][0]; } 
  }, { 
    // F: full text month: 'January' thru 'December'
    key: 'F', 
    method: function(date) { return dictionary.monthsOfYear[date.getMonth()][0]; } 
  }, { 
    // m: 2 digit numeric month: '01' - '12':
    key: 'm', 
    method: function(date) { return enforceLength(date.getMonth()+1,2); } 
  }, { 
    // M: a short textual representation of the month, 3 letters: 'Jan' - 'Dec'
    key: 'M', 
    method: function(date) { return dictionary.monthsOfYear[date.getMonth()][1]; } 
  }, { 
    // n: numeric represetation of month w/o leading 0's, '1' - '12':
    key: 'n', 
    method: function(date) { return date.getMonth() + 1; } 
  }, { 
    // Y: Full numeric year, 4 digits
    key: 'Y', 
    method: function(date) { return date.getFullYear(); } 
  }, { 
    // y: 2 digit numeric year:
    key: 'y', 
    method: function(date) { return enforceLength(date.getFullYear(),2,true); }
   }
];

var acceptedTimeTokens = [
  { 
    // a: lowercase ante meridiem and post meridiem 'am' or 'pm'
    key: 'a', 
    method: function(date) { return (date.getHours() > 11) ? 'pm' : 'am'; } 
  }, { 
    // A: uppercase ante merdiiem and post meridiem 'AM' or 'PM'
    key: 'A', 
    method: function(date) { return (date.getHours() > 11) ? 'PM' : 'AM'; } 
  }, { 
    // g: 12-hour format of an hour without leading zeros 1-12
    key: 'g', 
    method: function(date) { return date.getHours() % 12 || 12; } 
  }, { 
    // G: 24-hour format of an hour without leading zeros 0-23
    key: 'G', 
    method: function(date) { return date.getHours(); } 
  }, { 
    // h: 12-hour format of an hour with leading zeros 01-12
    key: 'h', 
    method: function(date) { return enforceLength(date.getHours()%12 || 12,2); } 
  }, { 
    // H: 24-hour format of an hour with leading zeros: 00-23
    key: 'H', 
    method: function(date) { return enforceLength(date.getHours(),2); } 
  }, { 
    // i: Minutes with leading zeros 00-59
    key: 'i', 
    method: function(date) { return enforceLength(date.getMinutes(),2); } 
  }, { 
    // s: Seconds with leading zeros 00-59
    key: 's', 
    method: function(date) { return enforceLength(date.getSeconds(),2); }
   }
];

/**
 * Internationalization object for timeUtils.internationalize().
 * @typedef internationalizeObj
 * @property {Array} [daysOfWeek=[ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]] daysOfWeek Weekday labels as strings, starting with Sunday.
 * @property {Array} [monthsOfYear=[ 'January','February','March','April','May','June','July','August','September','October','November','December' ]] monthsOfYear Month labels as strings, starting with January.
 */

/**
 * This function can be used to support additional languages by passing an object with 
 * `daysOfWeek` and `monthsOfYear` attributes.  Each attribute should be an array of
 * strings (ex: `daysOfWeek: ['monday', 'tuesday', 'wednesday'...]`)
 *
 * @param {internationalizeObj} conf
 */
const internationalize = (conf={}) => { 
  extendDictionary(conf);
};

/**
 * generic formatDate function which accepts dynamic templates
 * @param date {Date} Required
 * @param template {String} Optional
 * @returns {String}
 *
 * @example
 * formatDate(new Date(), '#{M}. #{j}, #{Y}')
 * @returns {Number} Returns a formatted date
 *
 */
const formatDate = (date,template='#{m}/#{d}/#{Y}') => {
  acceptedDateTokens.forEach(token => {
    if(template.indexOf(`#{${token.key}}`) == -1) return; 
    template = injectStringData(template,token.key,token.method(date));
  }); 
  acceptedTimeTokens.forEach(token => {
    if(template.indexOf(`#{${token.key}}`) == -1) return;
    template = injectStringData(template,token.key,token.method(date));
  });
  return template;
};

export { formatDate, internationalize };
