// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types


declare namespace App {
	type AuthStatus = 'admin' | 'user' | null
	interface Locals {
		auth: AuthStatus
	}
	// interface Platform {}
	// interface PrivateEnv {}
	// interface PublicEnv {}
	interface Session {
		auth: AuthStatus
	}
	// interface Stuff {}
}