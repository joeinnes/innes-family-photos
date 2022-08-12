import type { RequestHandler, ResponseBody } from '@sveltejs/kit';
import { listItems, uploadFile } from '$lib/s3';
import { getAuthStatus } from '$lib/auth_middleware';
import type { JSONValue } from '@sveltejs/kit/types/private';

export const GET: RequestHandler = async ({ request }) => {
  let body: ResponseBody = {
    status: 200,
    auth: null,
    list: []
  };

  const auth = getAuthStatus(request);

  if (!auth) {
    return {
      status: 401,
      error: {
        message: 'Not authorised'
      }
    }
  }

  body = {
    ...body,
    auth
  }
  try {
    const query = {
      Bucket: process.env.S3_BUCKET || ''
    };
    const res = await listItems(query);
    if (!res?.length) {
      return {
        status: 204
      }
    }
    const list = res.sort((a, b) => a.Key?.localeCompare(b.Key || '') || 0) as JSONValue;
    body = {
      ...body,
      list: list
    }
  } catch (e) {
    console.error(e);
    body = {
      status: 500,
      error: {
        name: 'Server Error',
        message: 'Something went wrong'
      },
      list: []
    }
  }

  return {
    body
  }
}

export const POST: RequestHandler = async ({ request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    return {
      status: 401,
      error: {
        message: 'Not Logged In'
      }
    }
  } else if (auth !== 'admin') {
    return {
      status: 403,
      error: {
        message: 'Upload Not Authorised'
      }
    }
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    for (let i = 0; i < files.length; i++) {
      const type = files[i].type;
      const fileName = files[i].name;
      const arrayBuffer = await files[i].arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      uploadFile(fileBuffer, fileName, type)
    }
    return {
      status: 202
    }
  } catch (e) {
    console.log(e)
    return {
      status: 500,
      error: {
        message: 'Could not upload files.'
      }
    }
  }
}