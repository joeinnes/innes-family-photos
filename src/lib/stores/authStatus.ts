import { writable } from "svelte/store";

export type AuthStatus = 'admin' | 'user' | null;
export const authStatus = writable<AuthStatus>(null);