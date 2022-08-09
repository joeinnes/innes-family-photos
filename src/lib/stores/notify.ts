import { writable } from 'svelte/store';

const blank = {
  icon: null,
  heading: '',
  message: '',
  active: false,
  colour: 'primary',
  callback() { return }

};

export const notify = writable(blank);

notify.subscribe(value => {
  if (value.active) {
    setTimeout(() => {
      value.callback();
      notify.set(blank);
    }, 5000)
  }
});