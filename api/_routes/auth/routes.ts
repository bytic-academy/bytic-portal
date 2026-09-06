import type { Router } from '../../_lib/router.js';
import { prisma } from '../../_lib/prisma.js';
import { sendJson } from '../../_lib/response.js';
import { parseBody } from '../../_lib/body-parser.js';
import { loginSchema } from '../../_lib/validation.js';
import { getSessionToken, makeSessionCookie, makeClearSessionCookie } from '../../_lib/cookies.js';
import { login, logout } from './service.js';
import { requireAuth, getAuthUser } from '../../_lib/auth.js';

export function registerAuthRoutes(router: Router) {
  // POST /api/auth/login
  router.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = await parseBody(req, loginSchema);
      const result = await login(prisma, email, password);

      if (!result.success || !result.token) {
        sendJson(res, 401, {
          success: false,
          error: result.error || 'Invalid credentials',
        });
        return;
      }

      res.setHeader('Set-Cookie', makeSessionCookie(result.token));
      sendJson(res, 200, {
        success: true,
        data: {
          user: result.user,
        },
      });
    } catch (err) {
      sendJson(res, 400, {
        success: false,
        error: err instanceof Error ? err.message : 'Invalid request',
      });
    }
  });

  // POST /api/auth/logout
  router.post('/api/auth/logout', async (req, res) => {
    const token = getSessionToken(req);
    if (token) {
      await logout(prisma, token);
    }
    res.setHeader('Set-Cookie', makeClearSessionCookie());
    sendJson(res, 200, {
      success: true,
      data: { message: 'Logged out successfully' },
    });
  });

  // GET /api/auth/me
  router.get(
    '/api/auth/me',
    requireAuth(async (req, res) => {
      const user = getAuthUser(req);
      sendJson(res, 200, {
        success: true,
        data: { user },
      });
    })
  );
}
