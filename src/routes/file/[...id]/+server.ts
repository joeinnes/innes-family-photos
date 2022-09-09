import { error } from '@sveltejs/kit';
import Jimp from 'jimp';

import { deleteFile, getFile, doesFileExist, uploadFile } from '$lib/s3';
import { getAuthStatus } from '$lib/auth_middleware';
import type { GetObjectOutput } from 'aws-sdk/clients/s3';
import type { RequestHandler } from '@sveltejs/kit';
export const GET: RequestHandler = async ({ params, request, url }) => {
  const resizeTo = parseInt(url.searchParams.get('size') || '', 10);
  const auth = getAuthStatus(request);
  if (!auth) {
    return new Response(undefined, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(undefined, { status: 400 });
  }
  let responseBody;
  if (resizeTo && !isNaN(resizeTo)) {
    try {
      const thumbSize = 100 * Math.ceil(resizeTo / 100);
      const doesThumbExist = await doesFileExist(`${id}/sizes/${thumbSize}`);
      if (doesThumbExist) {
        const file = (await getFile(`${id}/sizes/${thumbSize}`)) as GetObjectOutput & {
          code: number;
          Body: Buffer;
        };
        if (file.code) throw file;
        responseBody = file.Body;
      } else {
        const file = (await getFile(id)) as GetObjectOutput & { code: number; Body: Buffer };
        if (file.code) throw file;
        const image = await Jimp.read(file.Body);
        const resizedImageBuffer = await image
          .resize(resizeTo, Jimp.AUTO)
          .getBufferAsync('image/jpeg');
        await uploadFile(resizedImageBuffer, `${id}/sizes/${thumbSize}`, 'image/jpeg');
        responseBody = resizedImageBuffer;
      }
    } catch (e) {
      console.error(e);
      throw 500;
    }
  } else {
    const file = (await getFile(id)) as GetObjectOutput & { code: number; Body: Buffer };
    if (file.code) throw file;
    responseBody = file.Body;
  }

  return new Response(responseBody, {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg' || '',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private,max-age=31536000,immutable'
    }
  });
};

export const DELETE: RequestHandler = async ({ params, request }) => {
  const auth = getAuthStatus(request);

  if (!auth) {
    return new Response(undefined, { status: 401 });
  }

  if (auth !== 'admin') {
    return new Response(undefined, { status: 403 });
  }

  const { id } = params;
  if (!id) throw error(400);
  try {
    await deleteFile(id);
    return new Response(undefined);
  } catch (e) {
    console.error(e);
    throw error(500);
  }
};
