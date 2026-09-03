import type { IncomingMessage } from 'node:http';

/**
 * Parse cookies from the Cookie header of an HTTP request.
 */
export function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};

  const cookies: Record<string, string> = {};
  header.split(';').forEach((pair) => {
    const [key, ...rest] = pair.trim().split('=');
    if (key) {
      cookies[key.trim()] = decodeURIComponent(rest.join('=').trim());
    }
  });
  return cookies;
}

/**
 * Get the session token from the request cookies.
 */
export function getSessionToken(req: IncomingMessage): string | undefined {
  const cookies = parseCookies(req);
  return cookies['session_token'];
}

/**
 * Generate Set-Cookie header value for a session token.
 * 90 days = 7776000 seconds
 */
export function makeSessionCookie(token: string): string {
  return `session_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=7776000`;
}

/**
 * Generate Set-Cookie header value that clears the session cookie.
 */
export function makeClearSessionCookie(): string {
  return `session_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
