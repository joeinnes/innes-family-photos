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
</script>

<div bind:clientWidth={width} />
{#key width}
  <LinkedLabel linked="link" />

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
  />
{/key}

<style lang="scss">
  svg {
    @apply h-32 text-neutral-300;
  }
</style>
