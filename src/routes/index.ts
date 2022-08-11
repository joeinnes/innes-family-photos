import type { RequestHandler, ResponseBody } from '@sveltejs/kit';
import { listItems, uploadFile } from '$lib/s3';
import { getAuthStatus } from '$lib/auth_middleware';

export const GET: RequestHandler = async ({ request, url }) => {
  let body: ResponseBody = {
    status: 200,
    auth: null,
    list: []
  };
  const month = url.searchParams.get('month');
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
    let query = {}
    if (month) {
      query = {
        ...query,
        prefix: month
      }
    } else {
      query = {
        ...query,
        count: 10000
      }
    }
    const { Contents } = await listItems(query);
    const list = Contents.sort((a, b) => b.Key - a.Key);
    body = {
      ...body,
      list
    }
  } catch (e) {
    console.error(e);
    body = {
      ...body,
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
    const files = formData.getAll('files');
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