import { json } from '@sveltejs/kit';
import { deleteFile, getFile } from "$lib/s3";
import { getAuthStatus } from "$lib/auth_middleware";
import type { GetObjectOutput } from "aws-sdk/clients/s3";
import type { RequestHandler } from "@sveltejs/kit";
export const GET: RequestHandler = async ({ params, request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    return new Response(undefined, { status: 401 })
  }

  const { id } = params;
  try {
    const file = await getFile(id) as GetObjectOutput & { code: number, Body: Buffer };
    if (file.code) throw file;
    return new Response(file.Body, {
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