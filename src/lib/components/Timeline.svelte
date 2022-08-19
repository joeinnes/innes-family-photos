<script lang="ts">
  import { parse, differenceInMonths, subMonths, format, addMonths } from 'date-fns';

  export let images = {};
  let monthList = Object.keys(images).sort();

  export let start = monthList[0];
  export let end = monthList[monthList.length - 1];
  let startDate = parse(start, 'yyyy/MM', new Date());
  const endDate = parse(end, 'yyyy/MM', new Date());

  let months = differenceInMonths(endDate, startDate);

  if (months < 12) {
    startDate = subMonths(startDate, 12);
    months = 12;
  }
  let data: { [key: string]: number } = {};
  let i = 0;
  while (i < months + 1) {
    const date = subMonths(endDate, i);
    const dateText = format(date, 'yyyy/MM');
    const countImages = images[dateText]?.length || 0;
    data[dateText] = countImages;
    i++;
  }
  let width = 0;
  const max = Math.max(...Object.values(data));

  const scrollTo = (month: string) => {
    let elementID = '';
    if (data[month]) {
      elementID = encodeURIComponent(format(parse(month, 'yyyy-MM', new Date()), 'MMMM yyyy'));
    } else {
      while (!data[month] && month !== start) {
        let monthAsDate = parse(month, 'yyyy-MM', new Date());
        let checkAgainst = addMonths(monthAsDate, 1);
        month = format(checkAgainst, 'yyyy-MM');
      }
      elementID = encodeURIComponent(format(parse(month, 'yyyy-MM', new Date()), 'MMMM yyyy'));
    }
    if (!elementID) return;
    const header = document.getElementById(elementID);
    header?.scrollIntoView({ behavior: 'smooth' });
  };

  // KNOWN ISSUE:
  // If there are so many bars that the browser window is not wide enough to show them all, there's no special handling. Hopefully this should not be a major issue for most users, so not fixing right now.
</script>

<div bind:clientWidth={width} class="my-4">
  <div id="chart" />
  <h2>Photos from {format(endDate, 'MMM yyyy')} - {format(startDate, 'MMM yyyy')}</h2>
  {#key width}
    <div class="timeline flex h-24 justify-between gap-1 my-8">
      {#each Object.keys(data) as month}
        <div
          class="h-full w-full relative flex flex-col items-center justify-between group border-b border-neutral-300 hover:border-neutral-400"
          on:click={() => scrollTo(month)}
        >
          <div
            class="translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-visible whitespace-nowrap  w-0 -translate-x-full"
          >
            <span class="absolute left-0 top-0 transform -translate-x-1/2 -translate-y-full">
              {data[month]}
            </span>
          </div>
          <div
            class="translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-visible whitespace-nowrap  w-0 -translate-x-full"
          >
            <span class="absolute left-0 transform -translate-x-1/2">
              {format(parse(month, 'yyyy/MM', new Date()), 'MMM yyyy')}
            </span>
          </div>
          <div
            class="absolute bottom-0 w-full bg-neutral-300 group-hover:bg-neutral-400 transition-colors duration-200"
            style="height: {100 * (data[month] / max)}%"
          />
        </div>
      {/each}
    </div>
  {/key}
</div>

<style lang="scss">
  :global(.chart-container svg) {
    @apply text-neutral-300 focus:outline-none;
    overflow: auto;
  }
  :global(.chart-container svg rect) {
    @apply hover:text-neutral-500;
  }
</style>
