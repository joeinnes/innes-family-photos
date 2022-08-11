import { doesFileExist } from "$lib/s3";
import { getAuthStatus } from "$lib//auth_middleware";

export const GET = async ({ request, params }) => {
  let body = {}
  const auth = getAuthStatus(request);

  if (!auth) {
    return {
      status: 401
    }
  }
  if (auth === "admin") {
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