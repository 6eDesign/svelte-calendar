const getCalendarPage = (month,year,dayProps) => {
  let days = [];
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
    date.setDate(date.getDate() + 1)
  }
  weeks.reverse(); 
  return { month, year, weeks }
}

const getDayPropsHandler = (start,end) => {
  let today = new Date(); 
  today.setHours(0,0,0,0);
  return date => ({
    selectable: date >= start && date <= end,
    isToday: date.getTime() == today.getTime()
  });
};

export function getMonths(start, end) { 
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