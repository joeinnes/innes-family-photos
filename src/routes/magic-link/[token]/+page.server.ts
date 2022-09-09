import type { PageServerLoad } from './$types';
import { validateMagicLink } from '$lib/auth_middleware';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url, setHeaders, parent }) => {
  const { auth } = await parent();
  if (!auth) {
    const { token } = params;
    const cookieString = await validateMagicLink(token);
    if (!cookieString) {
      throw error(401, 'Not authorised');
    }
    setHeaders({
      'Set-Cookie': cookieString
    });
  }

  const ref = url.searchParams.get('redirect') || '/';
  if (ref) {
    throw redirect(303, ref);
  }
  return;
};
