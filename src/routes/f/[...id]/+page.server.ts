import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import { doesFileExist } from "$lib/s3";
import { getAuthStatus } from "$lib/auth_middleware";

export const load: PageServerLoad = async ({ request, params }) => {
  const auth = getAuthStatus(request);

  if (!auth) {
    throw error(401, 'Not authorised');
  }

  const fileExists = await doesFileExist(params.id);

  if (!fileExists) {
    throw error(404, 'No such photo. Maybe it was deleted?');
  }

  return {
    id: params.id || ''
  }
}