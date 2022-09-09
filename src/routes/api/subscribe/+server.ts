import type { Action } from './$types';
import { error } from '@sveltejs/kit';
import { uploadFile } from '$lib/s3';
import { notifyAll } from '$lib/webpush';

export const POST: Action = async ({ request }) => {
  try {
    const sub = await request.json();
    const uuid = crypto.randomUUID();
    await uploadFile(JSON.stringify(sub), `subscriptions/${uuid}`, 'text/plain');
    return new Response();
  } catch (e) {
    error(400, 'No endpoint supplied');
  }
};
