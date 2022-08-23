import type { PageServerLoad } from './$types';
import { getAuthStatus } from "$lib/auth_middleware"
import { createCollection, getFile, listItems } from "$lib/s3";
import type { Action } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not authorised');
  } else if (auth !== 'admin') {
    throw error(403, 'Not authorised');
  }

  const collectionsS3 = await listItems({ Prefix: 'collections/', Bucket: process.env.S3_BUCKET || '' });
  const collections = []
  for (let i = 0; i < collectionsS3.length; i++) {
    const el = collectionsS3[i];
    if (!el.Key) return;
    try {
      const name = el.Key.split('/')[1];
      const fileListBuffer = await getFile(el.Key);
      const imageList = JSON.parse(fileListBuffer.Body.toString());
      const images = imageList.map(el => ({
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
  return { collections }
}

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
}