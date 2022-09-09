import type { PageServerLoad } from './$types';
import type { Object as S3Object } from 'aws-sdk/clients/s3';
import { error } from '@sveltejs/kit';
import { listItems } from '$lib/s3';
import { getAuthStatus } from '$lib/auth_middleware';

export const load: PageServerLoad = async ({ request }) => {
  const auth = getAuthStatus(request);
  let list: S3Object[] = [];
  if (!auth) {
    throw error(401, 'Not authorised');
  }

  try {
    const query = {
      Bucket: process.env.S3_BUCKET || ''
    };

    const res = await listItems(query);

    let unsortedList: S3Object[] = [];

    if (res.length) {
      // TODO: If a file has the keyword 'sizes' in the name, then there will be a problem.
      unsortedList = res.filter((el) => {
        if (
          el &&
          el.Key &&
          el.Key.substring(0, 11) !== 'magiclinks/' &&
          el.Key.substring(0, 12) !== 'collections/' &&
          el.Key.substring(0, 14) !== 'subscriptions/' &&
          !el.Key.match('sizes')
        ) {
          return true;
        }
        return false;
      });
    }

    if (!unsortedList?.length) {
      return {
        list: []
      };
    }
    list = unsortedList.sort((a, b) => a.Key?.localeCompare(b.Key || '') || 0);

    return { list };
  } catch (e) {
    console.error(e);
    throw error(500, 'Something went wrong');
  }
};
