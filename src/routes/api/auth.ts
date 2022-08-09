import type { RequestHandler } from '@sveltejs/kit';
export const POST: RequestHandler = async ({ request }) => {
  const { headers } = request;
  const auth = headers.get('Authorization');
  let token = '';
  const d = new Date();
  if (auth && auth.indexOf(' ') > -1) {
    token = auth.split(' ')[1];
  } else {
    return {
      headers: {
        'Set-Cookie': `token='';expires=${d.toUTCString()};path=/`,
      }
    };
  }
  if (token === process.env.ADMIN_TOKEN || token === process.env.USER_TOKEN) {
    const expiryDays = parseInt(process.env.COOKIE_VALIDITY || '7', 10);
    d.setTime(d.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    return {
      headers: {
        'Set-Cookie': `token=${token};expires=${d.toUTCString()};path=/`,
      }
    };
  } else {
    return {
      status: 401
    }
  }
}