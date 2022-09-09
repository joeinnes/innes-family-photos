import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const lovedInit = browser ? localStorage.getItem('loved') || '[]' : '[]';
export const loved = writable(JSON.parse(lovedInit));

loved.subscribe((val) => {
  if (browser) {
    localStorage.setItem('loved', JSON.stringify(val));
  }
});
