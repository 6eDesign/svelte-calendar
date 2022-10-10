<script>
	import dayjs from 'dayjs';
	import { Datepicker } from '../../index';

	const today = new Date();
	const tomorrow = dayjs().add(7, 'day').toDate();

	// the format must be specified, it's used in the store to format and compare the dates to be excluded
	const format = 'YYYY-MM-DD';
	const disabled = [ dayjs().add(2, 'day').format(format), dayjs().add(4, 'day').format(format) ];

</script>

<Datepicker start={today} end={tomorrow} {format} disabledDates={disabled} />
