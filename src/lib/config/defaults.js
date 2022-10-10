import dayjs from 'dayjs';

const calendar = {
	selected: new Date(),
	start: dayjs().add(-100, 'year').toDate(),
	end: dayjs().add(100, 'year').toDate(),
	disabledDates: [],
	format: 'MM/DD/YYYY'
};

export { calendar };
