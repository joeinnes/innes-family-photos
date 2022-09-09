import { writable } from 'svelte/store';

type Image = {
  fullKey: string;
};
export const collection = writable<Image[]>([]);
