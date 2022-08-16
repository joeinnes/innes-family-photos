import jwt from 'jsonwebtoken'
import { encrypt } from '$lib/auth_middleware';

import type { RequestHandler } from '@sveltejs/kit';
export const POST: RequestHandler = async ({ request }) => {
  const { headers } = request;
  const auth = headers.get('Authorization');
  let password = '';
  const d = new Date();
  if (auth && auth.indexOf(' ') > -1) {
    password = auth.split(' ')[1];
  } else {
    return {
      headers: {
        'Set-Cookie': `token='';expires=${d.toUTCString()};path=/; Secure; HttpOnly;SameSite=Strict`,
      }
    };
  }
  if (password === process.env.ADMIN_PASSWORD || password === process.env.USER_PASSWORD) {
    const encryptedPass = encrypt(Buffer.from(password));
    const token = jwt.sign({ password: encryptedPass }, process.env.ENCRYPTION_SECRET, { expiresIn: '1 year' })
    const expiryDays = parseInt(process.env.COOKIE_VALIDITY || '7', 10);
    d.setTime(d.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    return {
      headers: {
        'Set-Cookie': `token=${token};expires=${d.toUTCString()};path=/;Secure; HttpOnly;SameSite=Strict`,
      }
    };
  } else {
    return {
      status: 401,
      message: 'Couldn\'t verify your credentials'
    }
  }
}