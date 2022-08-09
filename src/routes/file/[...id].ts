import { deleteFile, getFile } from "$lib/s3";

export const GET = async ({ params, request }) => {
  const { headers } = request;
  const cookie = headers.get('cookie');
  let token = '';
  if (cookie && cookie.substring(0, 6) === 'token=') {
    token = cookie.substring(6);
  }

  if (!token || (token !== process.env.ADMIN_TOKEN && token !== process.env.USER_TOKEN)) {
    return {
      status: 403
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
  const { headers } = request;
  const cookie = headers.get('cookie');
  let token = '';
  if (cookie && cookie.substring(0, 6) === 'token=') {
    token = cookie.substring(6);
  }

  if (!token || (token !== process.env.ADMIN_TOKEN && token !== process.env.USER_TOKEN)) {
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