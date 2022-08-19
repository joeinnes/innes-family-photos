<script lang="ts">
  import { parse, differenceInMonths, subMonths, format } from 'date-fns';

  import { LinkedChart, LinkedLabel } from 'svelte-tiny-linked-charts';

  export let images: { [month: string]: string[] };

  let monthList = Object.keys(images).sort();

  export let start = monthList[0];
  export let end = monthList[monthList.length - 1];
  let startDate = parse(start, 'yyyy-MM', new Date());
  const endDate = parse(end, 'yyyy-MM', new Date());

  let months = differenceInMonths(endDate, startDate);

  if (months < 6) {
    startDate = subMonths(startDate, 6);
    months = 6;
  }
  let data: { [key: string]: number } = {};
  let i = 0;
  while (i < months + 1) {
    const date = subMonths(endDate, i);
    const dateText = format(date, 'yyyy-MM');
    const countImages = images[dateText]?.length || 0;
    console.log(date);
    data[dateText] = countImages;
    i++;
  }
  let width = 0;

  // KNOWN ISSUE:
  // If there width is less than minBarWidth + 2 * count of months, the chart will overflow the SVG viewbox. On most desktop resolutions, this should be between 10-15 years. I'm hoping that by the time the issue is actual, svg overflow should be working, although it's not currently implemented.
</script>

<div bind:clientWidth={width} />
<h2>Photos from {format(endDate, 'MMM yyyy')} - {format(startDate, 'MMM yyyy')}</h2>
{#key width}
  <span>
    <LinkedLabel linked="link" />
  </span>
  <div class="chart-container">
    <LinkedChart
      dispatchEvents={true}
      {width}
      height={width / 10}
      {data}
      grow={true}
      fill="currentColor"
      linked="link"
      showValue={true}
      valuePosition="floating"
      clickHandler={(key, i) => console.log('handling', key, i)}
      align="left"
    />
  </div>
{/key}

<style lang="scss">
  :global(.chart-container svg) {
    @apply h-32 text-neutral-300 focus:outline-none;
    overflow: auto;
  }
  :global(.chart-container svg rect) {
    @apply hover:text-neutral-500;
  }
</style>
