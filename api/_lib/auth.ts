import type { IncomingMessage, ServerResponse } from 'node:http';
import type { RouteHandler } from './router.js';
import { prisma } from './prisma.js';
import { getSessionToken } from './cookies.js';
import { sendJson } from './response.js';

/** User info attached to authenticated requests */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string; // 'ADMIN' | 'TEACHER'
}

/** Extended request with auth user */
export interface AuthenticatedRequest extends IncomingMessage {
  user?: AuthUser;
}

/**
 * Auth middleware: validates session token from cookie and attaches user to request.
 * Wraps a route handler to require authentication.
 */
export function requireAuth(handler: RouteHandler): RouteHandler {
  return async (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => {
    const token = getSessionToken(req);
    if (!token) {
      sendJson(res, 401, { success: false, error: 'Authentication required' });
      return;
    }

    const session = await prisma.authSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clear invalid/expired cookie
      res.setHeader('Set-Cookie', 'session_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
      sendJson(res, 401, { success: false, error: 'Session expired or invalid' });
      return;
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };

    return handler(req, res, params);
  };
}

/**
 * Admin guard: requires authenticated user with ADMIN role.
 */
export function requireAdmin(handler: RouteHandler): RouteHandler {
  return requireAuth(async (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || user.role !== 'ADMIN') {
      sendJson(res, 403, { success: false, error: 'Admin access required' });
      return;
    }
    return handler(req, res, params);
  });
}

/**
 * Get the authenticated user from the request.
 * Must be called after requireAuth middleware.
 */
export function getAuthUser(req: IncomingMessage): AuthUser {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new Error('getAuthUser called without auth middleware');
  }
  return user;
}
