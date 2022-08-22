import { writable } from 'svelte/store';

export const selected = writable('');

type Image = {
  fullKey: string;
};
export const gallery = writable<Image[]>([]);