import type { Router } from '../_lib/router.js';
import { prisma } from '../_lib/prisma.js';
import { sendJson } from '../_lib/response.js';
import { parseBody } from '../_lib/body-parser.js';
import { toggleAttendanceSchema } from '../_lib/validation.js';
import { requireAuth, getAuthUser } from '../_lib/auth.js';
import { getAttendanceSheet, toggleAttendance } from './service.js';

export function registerAttendanceRoutes(router: Router) {
  // GET /api/sessions/:sessionId/attendance
  router.get(
    '/api/sessions/:sessionId/attendance',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        const sheet = await getAttendanceSheet(
          prisma,
          params.sessionId,
          user.id,
          user.role
        );
        sendJson(res, 200, { success: true, data: sheet });
      } catch (err) {
        sendJson(res, 403, {
          success: false,
          error: err instanceof Error ? err.message : 'Access denied',
        });
      }
    })
  );

  // POST /api/sessions/:sessionId/attendance (Toggle student attendance)
  router.post(
    '/api/sessions/:sessionId/attendance',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        const { studentId, present } = await parseBody(
          req,
          toggleAttendanceSchema
        );
        const record = await toggleAttendance(
          prisma,
          params.sessionId,
          studentId,
          present,
          user.id,
          user.role
        );
        sendJson(res, 200, {
          success: true,
          data: {
            record: {
              ...record,
              present: Boolean(record.present),
            },
          },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update attendance',
        });
      }
    })
  );
}
