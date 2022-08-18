import { getAuthStatus } from '$lib/auth_middleware';
import type { LayoutServerLoad } from '../../.svelte-kit/types/src/routes/$types';

export const load: LayoutServerLoad = async ({ request }) => {
  const auth = getAuthStatus(request)
  return {
    auth
  }
}