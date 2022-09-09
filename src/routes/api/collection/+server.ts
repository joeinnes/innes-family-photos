import type { Action } from '@sveltejs/kit';
import { getAuthStatus } from '$lib/auth_middleware';
import { createCollection, deleteFile } from '$lib/s3';
import { error } from '@sveltejs/kit';

export const POST: Action = async ({ request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not authorised');
  } else if (auth !== 'admin') {
    throw error(403, 'Not authorised');
  }

  const body = await request.json();

  const { name, content } = body;

  await createCollection(JSON.stringify(content), `collections/${name}`);
  return;
};

export const DELETE: Action = async ({ request, url }) => {
  const name = url.searchParams.get('name');
  if (!name) throw error(400, 'No name provided');

  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not authorised');
  } else if (auth !== 'admin') {
    throw error(403, 'Not authorised');
  }

  try {
    await deleteFile(`collections/${name}`);
    return;
  } catch (e) {
    throw error(500, 'Could not delete file.');
  }
};
