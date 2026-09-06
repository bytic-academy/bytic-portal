import type { Router } from '../../_lib/router.js';
import { prisma } from '../../_lib/prisma.js';
import { sendJson } from '../../_lib/response.js';
import { parseBody } from '../../_lib/body-parser.js';
import {
  createClassSchema,
  updateClassSchema,
  assignTeacherSchema,
  enrollStudentSchema,
} from '../../_lib/validation.js';
import { requireAuth, requireAdmin, getAuthUser } from '../../_lib/auth.js';
import {
  createClass,
  listClasses,
  getClassById,
  updateClass,
  deleteClass,
  assignTeacher,
  removeTeacher,
  enrollStudent,
  unenrollStudent,
} from './service.js';

export function registerClassesRoutes(router: Router) {
  // GET /api/classes (Role scoped: Admin sees all, Teacher sees assigned)
  router.get(
    '/api/classes',
    requireAuth(async (req, res) => {
      const user = getAuthUser(req);
      const classes = await listClasses(prisma, user.id, user.role);
      sendJson(res, 200, { success: true, data: { classes } });
    })
  );

  // POST /api/classes (Admin only)
  router.post(
    '/api/classes',
    requireAdmin(async (req, res) => {
      try {
        const body = await parseBody(req, createClassSchema);
        const cls = await createClass(prisma, body);
        sendJson(res, 201, { success: true, data: { class: cls } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create class',
        });
      }
    })
  );

  // GET /api/classes/:id (Authenticated with permission check)
  router.get(
    '/api/classes/:id',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        const cls = await getClassById(prisma, params.id, user.id, user.role);
        if (!cls) {
          sendJson(res, 404, { success: false, error: 'Class not found' });
          return;
        }
        sendJson(res, 200, { success: true, data: { class: cls } });
      } catch (err) {
        sendJson(res, 403, {
          success: false,
          error: err instanceof Error ? err.message : 'Access denied',
        });
      }
    })
  );

  // PUT /api/classes/:id (Admin or assigned teacher)
  router.put(
    '/api/classes/:id',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        // Verify access first
        await getClassById(prisma, params.id, user.id, user.role);

        const body = await parseBody(req, updateClassSchema);
        const cls = await updateClass(prisma, params.id, body);
        sendJson(res, 200, { success: true, data: { class: cls } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update class',
        });
      }
    })
  );

  // DELETE /api/classes/:id (Admin only)
  router.delete(
    '/api/classes/:id',
    requireAdmin(async (_req, res, params) => {
      try {
        await deleteClass(prisma, params.id);
        sendJson(res, 200, {
          success: true,
          data: { message: 'Class deleted successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete class',
        });
      }
    })
  );

  // POST /api/classes/:id/teachers (Admin only)
  router.post(
    '/api/classes/:id/teachers',
    requireAdmin(async (req, res, params) => {
      try {
        const { userId } = await parseBody(req, assignTeacherSchema);
        await assignTeacher(prisma, params.id, userId);
        sendJson(res, 200, {
          success: true,
          data: { message: 'Teacher assigned successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to assign teacher',
        });
      }
    })
  );

  // DELETE /api/classes/:id/teachers/:userId (Admin only)
  router.delete(
    '/api/classes/:id/teachers/:userId',
    requireAdmin(async (_req, res, params) => {
      try {
        await removeTeacher(prisma, params.id, params.userId);
        sendJson(res, 200, {
          success: true,
          data: { message: 'Teacher removed successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to remove teacher',
        });
      }
    })
  );

  // POST /api/classes/:id/students (Admin or assigned teacher)
  router.post(
    '/api/classes/:id/students',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        await getClassById(prisma, params.id, user.id, user.role);

        const { studentId } = await parseBody(req, enrollStudentSchema);
        await enrollStudent(prisma, params.id, studentId);
        sendJson(res, 200, {
          success: true,
          data: { message: 'Student enrolled successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to enroll student',
        });
      }
    })
  );

  // DELETE /api/classes/:id/students/:studentId (Admin or assigned teacher)
  router.delete(
    '/api/classes/:id/students/:studentId',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        await getClassById(prisma, params.id, user.id, user.role);

        await unenrollStudent(prisma, params.id, params.studentId);
        sendJson(res, 200, {
          success: true,
          data: { message: 'Student unenrolled successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to unenroll student',
        });
      }
    })
  );
}
