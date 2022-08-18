import type { PageServerLoad } from './$types';
import { validateMagicLink } from "$lib/auth_middleware";
import { deleteFile } from "$lib/s3";
import { error, redirect } from "@sveltejs/kit";
import type { Action } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
  const { token } = params;
  const cookieString = await validateMagicLink(token);
  if (!cookieString) {
    throw error(401, 'Not authorised');
  }
  setHeaders({
    'Set-Cookie': cookieString
  })

  const ref = url.searchParams.get('redirect') || '/';
  if (ref) {
    throw redirect(303, ref);
  }
  return;
}

export const DELETE: Action = async ({ locals, params }) => {
  const { auth
  } = locals;
  if (!auth) {
    throw error(401, 'Not authorised');
  } else if (auth !== 'admin') {
    throw error(403, 'Not authorised');
  }
  try {
    const { token } = params;
    await deleteFile(`magiclinks/${token}`);
    return;
  } catch (e) {
    throw error(500, 'Could not delete file.')
  }
}