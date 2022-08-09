import type { RequestHandler } from '@sveltejs/kit';
import { listItems, uploadFile } from '$lib/s3';
import type { ObjectList } from 'aws-sdk/clients/s3';

type Body = {
  list: ObjectList | [];
  auth: boolean;
  admin: boolean;
}

export const GET: RequestHandler = async ({ request, url }) => {
  const { headers } = request;
  const month = url.searchParams.get('month');
  const cookie = headers.get('cookie');
  let token = '';
  if (cookie && cookie.substring(0, 6) === 'token=') {
    token = cookie.substring(6);
  }

  let body: Body = {
    list: [],
    auth: false,
    admin: false
  };

  if (!token) {
    body = { ...body, auth: false }
  }

  if (token === process.env.ADMIN_TOKEN) {
    body = {
      ...body,
      auth: true,
      admin: true
    }
  } else if (token === process.env.USER_TOKEN) {
    body = {
      ...body,
      auth: true,
    }
  }

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
  if (token) {
    try {
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
        list: []
      }
    }
  }

  return {
    body
  }
}

export const POST: RequestHandler = async ({ request }) => {
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
      status: 500
    }
  }
}