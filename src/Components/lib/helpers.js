const getCalendarPage = (month, year, dayProps) => {
  let date = new Date(year, month, 1);
  date.setDate(date.getDate() - date.getDay());
  let nextMonth = month === 11 ? 0 : month + 1;
  // ensure days starts on Sunday
  // and end on saturday
  let weeks = [];
  while (date.getMonth() !== nextMonth || date.getDay() !== 0 || weeks.length !== 6) {
    if (date.getDay() === 0) weeks.unshift({ days: [], id: `${year}${month}${year}${weeks.length}` });
    const updated = Object.assign({
      partOfMonth: date.getMonth() === month,
      date: new Date(date)
    }, dayProps(date));
    weeks[0].days.push(updated);
    date.setDate(date.getDate() + 1);
  }
  weeks.reverse();
  return { month, year, weeks };
};

const getDayPropsHandler = (start, end, selectableCallback) => {
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  return date => ({
    selectable: date >= start && date <= end
     && (!selectableCallback || selectableCallback(date)),
    isToday: date.getTime() === today.getTime()
  });
};

export function getMonths(start, end, selectableCallback = null) {
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  let endDate = new Date(end.getFullYear(), end.getMonth() + 1, 1);
  let months = [];
  let date = new Date(start.getFullYear(), start.getMonth(), 1);
  let dayPropsHandler = getDayPropsHandler(start, end, selectableCallback);
  while (date < endDate) {
    months.push(getCalendarPage(date.getMonth(), date.getFullYear(), dayPropsHandler));
    date.setMonth(date.getMonth() + 1);
  }
  return months;
}

export const areDatesEquivalent = (a, b) => a.getDate() === b.getDate()
  && a.getMonth() === b.getMonth()
  && a.getFullYear() === b.getFullYear();
