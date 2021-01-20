import { writable } from 'svelte/store';

export const createDatepickerStore = () => {
  const { subscribe, set, update } = writable({});

  return {
    subscribe,
    reset: () => set(0),
  };
};
