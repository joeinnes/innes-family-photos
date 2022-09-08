import { json } from '@sveltejs/kit';
import Jimp from 'jimp';

import { deleteFile, getFile } from "$lib/s3";
import { getAuthStatus } from "$lib/auth_middleware";
import type { GetObjectOutput } from "aws-sdk/clients/s3";
import type { RequestHandler } from "@sveltejs/kit";
export const GET: RequestHandler = async ({ params, request, url }) => {
  const resizeTo = parseInt(url.searchParams.get('size'), 10);
  const auth = getAuthStatus(request);
  if (!auth) {
    return new Response(undefined, { status: 401 })
  }

  const { id } = params;
  try {
    const file = await getFile(id) as GetObjectOutput & { code: number, Body: Buffer };
    if (file.code) throw file;
    let responseBody;
    if (resizeTo && !isNaN(resizeTo)) {
      const image = await Jimp.read(file.Body);
      responseBody = await image.resize(resizeTo, Jimp.AUTO).getBufferAsync('image/jpeg');
    } else {
      responseBody = file.Body
    }

    return new Response(responseBody, {
      status: 200,
      headers: {
        "Content-Type": file.ContentType || '',
        "Content-Disposition": "inline",
        "Cache-Control": 'private,max-age=31536000,immutable'
      }
    });
  } catch (e) {
    console.error(e);
    return json({ auth }, {
      status: 500
    })
  }
}

export const DELETE: RequestHandler = async ({ params, request }) => {
  const auth = getAuthStatus(request);

  if (!auth) {
    return new Response(undefined, { status: 401 })
  }

  if (auth !== 'admin') {
    return new Response(undefined, { status: 403 })
  }

  const { id } = params;
  try {
    await deleteFile(id);
    return new Response(undefined)
  } catch (e) {
    console.error(e);
    return json({
      auth
    }, {
      status: 500
    })
  }
}