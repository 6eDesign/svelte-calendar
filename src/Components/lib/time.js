import { internationalize } from 'timeUtils';

export let weekStart = 0;
export let daysOfWeek = [
  ['Sunday', 'Sun'],
  ['Monday', 'Mon'],
  ['Tuesday', 'Tue'],
  ['Wednesday', 'Wed'],
  ['Thursday', 'Thu'],
  ['Friday', 'Fri'],
  ['Saturday', 'Sat']
];
export let monthsOfYear = [
  ['January', 'Jan'],
  ['February', 'Feb'],
  ['March', 'Mar'],
  ['April', 'Apr'],
  ['May', 'May'],
  ['June', 'Jun'],
  ['July', 'Jul'],
  ['August', 'Aug'],
  ['September', 'Sep'],
  ['October', 'Oct'],
  ['November', 'Nov'],
  ['December', 'Dec']
];

internationalize({ daysOfWeek, monthsOfYear });
export let sortedDaysOfWeek = weekStart === 0 ? daysOfWeek : (() => {
  let dow = daysOfWeek.slice();
  dow.push(dow.shift());
  return dow;
})();
