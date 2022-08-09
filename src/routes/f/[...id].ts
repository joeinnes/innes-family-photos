import { doesFileExist } from "$lib/s3";

export const GET = async ({ params, request }) => {
  const { headers } = request;
  const cookie = headers.get('cookie');
  let token = '';
  let body = {};
  if (cookie && cookie.substring(0, 6) === 'token=') {
    token = cookie.substring(6);
  }

  if (!token || (token !== process.env.ADMIN_TOKEN && token !== process.env.USER_TOKEN)) {
    return {
      status: 403
    }
  }
  if (token === process.env.ADMIN_TOKEN) {
    body = {
      ...body,
      admin: true
    }
  }


  const fileExists = await doesFileExist(params.id);

  if (!fileExists) {
    return {
      status: 404,
      body: {
        id: null
      }
    }
  }
  body = {
    ...body,
    id: params.id
  }

  return {
    status: 200,
    body
  }


}