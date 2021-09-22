<script>
	export let value;

	$: arr = [value];
</script>

{#each arr as value (value)}
	<slot {value} />
{/each}
