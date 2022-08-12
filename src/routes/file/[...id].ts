import { deleteFile, getFile } from "$lib/s3";
import { getAuthStatus } from "$lib/auth_middleware";
import type { GetObjectOutput } from "aws-sdk/clients/s3";
import type { RequestHandler } from "@sveltejs/kit";
export const GET: RequestHandler = async ({ params, request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    return {
      status: 401
    }
  }

  const { id } = params;
  try {
    const file = await getFile(id) as GetObjectOutput & { code: number, Body: Buffer };
    if (file.code) throw file;
    return {
      status: 200,
      headers: {
        "Content-Type": file.ContentType,
        "Content-Disposition": "inline",
        "Cache-Control": 'private,max-age=31536000,immutable'
      },
      body: file.Body
    }
  } catch (e) {
    console.error(e);
    return {
      status: 500,
      body: { auth }
    }
  }
}

export const DELETE: RequestHandler = async ({ params, request }) => {
  const auth = getAuthStatus(request);

  if (!auth) {
    return {
      status: 401
    }
  }

  if (auth !== 'admin') {
    return {
      status: 403
    }
  }

  const { id } = params;
  try {
    await deleteFile(id);
    return {
      status: 200,
    }
  } catch (e) {
    console.error(e);
    return {
      status: 500,
      body: {
        auth
      }
    }
  }
}