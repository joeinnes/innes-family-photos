import { generateMagicLink, getAuthStatus } from '$lib/auth_middleware';
import { deleteFile } from '$lib/s3';
import { error } from '@sveltejs/kit';
import type { Action } from '@sveltejs/kit';

export const POST: Action = async ({ url, request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not authorised');
  } else if (auth !== 'admin') {
    throw error(403, 'Not authorised');
  }
  let persistent = false;
  const type = url.searchParams.get('persistent');
  if (type === 'persist') {
    persistent = true;
  }

  await generateMagicLink(persistent);
  return;
};

export const DELETE: Action = async ({ request, url }) => {
  const name = url.searchParams.get('name');
  if (!name) throw error(400, 'No token provided');
  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not authorised');
  } else if (auth !== 'admin') {
    throw error(403, 'Not authorised');
  }
  try {
    await deleteFile(`magiclinks/${name}`);
    return;
  } catch (e) {
    throw error(500, 'Could not delete file.');
  }
};
