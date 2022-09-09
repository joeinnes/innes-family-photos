import type { Action } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { renameFile } from '$lib/s3';
import { getAuthStatus } from '$lib/auth_middleware';

export const POST: Action = async ({ request }) => {
  try {
    const auth = getAuthStatus(request);
    if (!auth) {
      throw error(401, 'Not Logged In');
    } else if (auth !== 'admin') {
      throw error(403, 'Not Authorised');
    }

    const data = await request.formData();
    const oldKey = data.get('oldKey') as string;
    const newKey = data.get('newKey') as string;
    if (!oldKey || !newKey) throw error(400, 'You did not provide both keys');
    await renameFile(oldKey, newKey);
    return new Response(undefined, { status: 200 })
  } catch (e) {
    console.error(e);
    throw error(500)
  }

}