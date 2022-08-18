import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

import jwt from 'jsonwebtoken'
import { encrypt } from '$lib/auth_middleware';

export const POST: RequestHandler = async ({ request }) => {
  const { headers } = request;
  const auth = headers.get('Authorization');
  let password = '';
  const d = new Date();
  if (auth && auth.indexOf(' ') > -1) {
    password = auth.split(' ')[1];
  } else {
    // TODO: Status 205 is 'reset content'. I think this is broadly appropriate as I'm using the lack of a proper header to reset the password in the most common use case. Technically 401 is probably better as there was no valid authentication, but we don't know if that was intentional. I should probably create a separate endpoint for logging out.

    return new Response(undefined, {
      status: 205,
      headers: {
        'Set-Cookie': `token='';expires=${d.toUTCString()};path=/; Secure; HttpOnly;SameSite=Strict`
      }
    });
  }
  if (password === process.env.ADMIN_PASSWORD || password === process.env.USER_PASSWORD) {
    const encryptedPass = encrypt(Buffer.from(password));
    const token = jwt.sign({ password: encryptedPass }, process.env.ENCRYPTION_SECRET, { expiresIn: '1 year' })
    const expiryDays = parseInt(process.env.COOKIE_VALIDITY || '7', 10);
    d.setTime(d.getTime() + (expiryDays * 24 * 60 * 60 * 1000));

    return new Response(undefined, {
      status: 204,
      headers: {
        'Set-Cookie': `token=${token};expires=${d.toUTCString()};path=/;${process.env.NODE_ENV === 'production' ? 'Secure; HttpOnly;SameSite=Strict' : ''}`,
      }
    });
  } else {
    throw error(401, 'Invalid password');
  }
}