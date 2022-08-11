import { deleteFile, getFile } from "$lib/s3";
import { getAuthStatus } from "$lib/auth_middleware";

export const GET = async ({ params, request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    return {
      status: 401
    }
  }

  const { id } = params;
  try {
    const file = await getFile(id);
    if (file.statusCode) {
      throw file;
    }
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
      status: e.statusCode
    }
  }
}

export const DELETE = async ({ params, request }) => {
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
    const file = await deleteFile(id);
    return {
      status: 200,
    }
  } catch (e) {
    console.error(e);
    return {
      status: 500
    }
  }
}