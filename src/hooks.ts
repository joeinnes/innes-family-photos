import { getAuthStatus } from "$lib/auth_middleware";
import type { Handle, GetSession } from "@sveltejs/kit";

export const handle: Handle = ({ event, resolve }) => {
  const { request } = event
  const authStatus = getAuthStatus(request);
  event.locals.auth = authStatus;
  const response = resolve(event);
  return response;
}


export const getSession: GetSession = (event) => {
  return { auth: event.locals.auth };
}