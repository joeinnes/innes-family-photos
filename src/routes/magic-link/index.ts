import { generateMagicLink } from "$lib/auth_middleware"
import { listItems } from "$lib/s3";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals }) => {
  const { auth } = locals;
  if (!auth) {
    return {
      status: 401
    }
  } else if (auth !== 'admin') {
    return {
      status: 403
    }
  }

  const magicLinksS3 = await listItems({ Prefix: 'magiclinks/', Bucket: process.env.S3_BUCKET || '' });
  const magicLinks = magicLinksS3.map(el => {
    if (!el.Key) return;

    const [linkWithPrefix, type] = el.Key.split('-');
    const [_, link] = linkWithPrefix.split('/')

    return {
      link,
      type
    }
  })

  return {
    status: 200,
    body: { magicLinks }
  }
}

export const POST: RequestHandler = async ({ url, locals }) => {
  const { auth } = locals;
  if (!auth) {
    return {
      status: 401
    }
  } else if (auth !== 'admin') {
    return {
      status: 403
    }
  }
  let persistent = false
  const type = url.searchParams.get('persistent')
  if (type === 'persist') {
    persistent = true
  }
  const magicLink = await generateMagicLink(persistent);

  return {
    status: 200,
    body: { link: magicLink, type: persistent ? 'persist' : 'temp' }
  }
}