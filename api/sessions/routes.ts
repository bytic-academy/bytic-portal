import type { Router } from '../_lib/router.js';
import { prisma } from '../_lib/prisma.js';
import { sendJson } from '../_lib/response.js';
import { parseBody } from '../_lib/body-parser.js';
import {
  createSessionSchema,
  bulkCreateSessionSchema,
  updateSessionSchema,
} from '../_lib/validation.js';
import { requireAuth, getAuthUser } from '../_lib/auth.js';
import {
  createSession,
  bulkCreateSessions,
  listSessionsByClass,
  getSessionById,
  updateSession,
  deleteSession,
} from './service.js';

export function registerSessionsRoutes(router: Router) {
  // GET /api/sessions?classId=xxx
  router.get(
    '/api/sessions',
    requireAuth(async (req, res) => {
      try {
        const user = getAuthUser(req);
        const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        const classId = parsedUrl.searchParams.get('classId');

        if (!classId) {
          sendJson(res, 400, { success: false, error: 'classId query parameter is required' });
          return;
        }

        const sessions = await listSessionsByClass(prisma, classId, user.id, user.role);
        sendJson(res, 200, { success: true, data: { sessions } });
      } catch (err) {
        sendJson(res, 403, {
          success: false,
          error: err instanceof Error ? err.message : 'Access denied',
        });
      }
    })
  );

  // POST /api/sessions (Create single session)
  router.post(
    '/api/sessions',
    requireAuth(async (req, res) => {
      try {
        const user = getAuthUser(req);
        const body = await parseBody(req, createSessionSchema);
        const session = await createSession(prisma, body, user.id, user.role);
        sendJson(res, 201, { success: true, data: { session } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create session',
        });
      }
    })
  );

  // POST /api/sessions/bulk (Bulk create sessions across multiple dates)
  router.post(
    '/api/sessions/bulk',
    requireAuth(async (req, res) => {
      try {
        const user = getAuthUser(req);
        const body = await parseBody(req, bulkCreateSessionSchema);
        const sessions = await bulkCreateSessions(prisma, body, user.id, user.role);
        sendJson(res, 201, { success: true, data: { sessions } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to bulk create sessions',
        });
      }
    })
  );

  // GET /api/sessions/:id
  router.get(
    '/api/sessions/:id',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        const session = await getSessionById(prisma, params.id, user.id, user.role);
        if (!session) {
          sendJson(res, 404, { success: false, error: 'Session not found' });
          return;
        }
        sendJson(res, 200, { success: true, data: { session } });
      } catch (err) {
        sendJson(res, 403, {
          success: false,
          error: err instanceof Error ? err.message : 'Access denied',
        });
      }
    })
  );

  // PUT /api/sessions/:id
  router.put(
    '/api/sessions/:id',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        const body = await parseBody(req, updateSessionSchema);
        const session = await updateSession(prisma, params.id, body, user.id, user.role);
        sendJson(res, 200, { success: true, data: { session } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update session',
        });
      }
    })
  );

  // DELETE /api/sessions/:id
  router.delete(
    '/api/sessions/:id',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        await deleteSession(prisma, params.id, user.id, user.role);
        sendJson(res, 200, {
          success: true,
          data: { message: 'Session deleted successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete session',
        });
      }
    })
  );
}
