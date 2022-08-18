import type { LayoutServerLoad } from './$types';
import { getAuthStatus } from "$lib/auth_middleware";

export const load: LayoutServerLoad = async ({ request }) => {
  const auth = getAuthStatus(request);
  return {
    auth
  }
}