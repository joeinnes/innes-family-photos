import { validateMagicLink } from "$lib/auth_middleware";
import { deleteFile } from "$lib/s3";
import type { RequestHandler, ResponseBody } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, url }) => {
  const { token } = params;
  const cookieString = await validateMagicLink(token);
  if (!cookieString) {
    return {
      status: 401
    }
  }
  let response: ResponseBody = {
    headers: {
      'Set-Cookie': cookieString
    }
  }
  const ref = url.searchParams.get('redirect') || '/';
  response = {
    ...response,
    status: 303,
    redirect: ref
  }
  return response;

}

export const DELETE: RequestHandler = async ({ locals, params }) => {
  const { auth
  } = locals;
  if (!auth) {
    return {
      status: 401
    }
  } else if (auth !== 'admin') {
    return {
      status: 403
    }
  }

  try {
    const { token } = params;

    await deleteFile(`magiclinks/${token}`);
    return {
      status: 200
    }
  } catch (e) {
    return {
      status: 500
    }
  }
}