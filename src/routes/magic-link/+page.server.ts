import type { PageServerLoad } from './$types';
import { getAuthStatus } from '$lib/auth_middleware';
import { listItems } from '$lib/s3';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not authorised');
  } else if (auth !== 'admin') {
    throw error(403, 'Not authorised');
  }

  const magicLinksS3 = await listItems({
    Prefix: 'magiclinks/',
    Bucket: process.env.S3_BUCKET || ''
  });
  const magicLinks = magicLinksS3.map((el) => {
    if (!el.Key) return;
    const [linkWithPrefix, type] = el.Key.split('-');
    try {
      const link = linkWithPrefix.split('/')[1];
      return {
        link,
        type
      };
    } catch (e) {
      return null;
    }
  });

  return { magicLinks };
};
