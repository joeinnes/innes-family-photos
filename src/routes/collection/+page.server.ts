import type { PageServerLoad } from './$types';
import { getAuthStatus } from '$lib/auth_middleware';
import { getFile, listItems } from '$lib/s3';
import { error } from '@sveltejs/kit';

import type { GetObjectOutput, Object as S3Object } from 'aws-sdk/clients/s3';

interface Collection {
  name: string;
  images: {
    fullKey: string;
  }[];
}

export const load: PageServerLoad = async ({ request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not authorised');
  } else if (auth !== 'admin') {
    throw error(403, 'Not authorised');
  }

  const collectionsS3 = await listItems({
    Prefix: 'collections/',
    Bucket: process.env.S3_BUCKET || ''
  });
  const collections: Collection[] = [];
  for (let i = 0; i < collectionsS3.length; i++) {
    const el = collectionsS3[i];
    if (!el.Key) return;
    try {
      const name = el.Key.split('/')[1];
      const fileListBuffer = (await getFile(el.Key)) as GetObjectOutput;
      if (!fileListBuffer || !fileListBuffer.Body) throw 'No file content';
      const imageList = JSON.parse(fileListBuffer.Body.toString());
      const images = imageList.map((el: S3Object) => ({
        fullKey: el
      }));
      collections.push({
        name,
        images
      });
    } catch (e) {
      continue;
    }
  }
  return { collections };
};
