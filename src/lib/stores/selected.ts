import { writable } from 'svelte/store';

export const selected = writable('');

type Image = {
  key: string;
  fullKey: string;
  prefix: string;
};
export const gallery = writable<Image[]>([]);