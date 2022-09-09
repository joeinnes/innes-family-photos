import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

interface Notification {
  icon?: typeof SvelteComponent;
  heading?: string;
  message?: string;
  active: boolean;
  colour: string;
  callback?: () => void;
}
const blank: Notification = {
  active: false,
  colour: 'primary'
};

export const notify = writable(blank);

notify.subscribe((value) => {
  if (value.active) {
    setTimeout(() => {
      if (value.callback && typeof value.callback === 'function') {
        value.callback();
      }
      notify.set(blank);
    }, 5000);
  }
});
