import type { Router } from '../_lib/router.js';
import { prisma } from '../_lib/prisma.js';
import { sendJson } from '../_lib/response.js';
import { parseBody } from '../_lib/body-parser.js';
import { createStudentSchema, updateStudentSchema } from '../_lib/validation.js';
import { requireAuth, requireAdmin, getAuthUser } from '../_lib/auth.js';
import {
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from './service.js';

export function registerStudentsRoutes(router: Router) {
  // GET /api/students (Scoped by role: Admin sees all, Teacher sees students in assigned classes)
  router.get(
    '/api/students',
    requireAuth(async (req, res) => {
      const user = getAuthUser(req);
      const students = await listStudents(prisma, user.id, user.role);
      sendJson(res, 200, { success: true, data: { students } });
    })
  );

  // POST /api/students (Authenticated users can create students)
  router.post(
    '/api/students',
    requireAuth(async (req, res) => {
      try {
        const body = await parseBody(req, createStudentSchema);
        const student = await createStudent(prisma, body);
        sendJson(res, 201, { success: true, data: { student } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create student',
        });
      }
    })
  );

  // GET /api/students/:id (Authenticated with permission check)
  router.get(
    '/api/students/:id',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        const student = await getStudentById(prisma, params.id, user.id, user.role);
        if (!student) {
          sendJson(res, 404, { success: false, error: 'Student not found' });
          return;
        }
        sendJson(res, 200, { success: true, data: { student } });
      } catch (err) {
        sendJson(res, 403, {
          success: false,
          error: err instanceof Error ? err.message : 'Access denied',
        });
      }
    })
  );

  // PUT /api/students/:id (Admin or assigned teacher)
  router.put(
    '/api/students/:id',
    requireAuth(async (req, res, params) => {
      try {
        const user = getAuthUser(req);
        await getStudentById(prisma, params.id, user.id, user.role);

        const body = await parseBody(req, updateStudentSchema);
        const student = await updateStudent(prisma, params.id, body);
        sendJson(res, 200, { success: true, data: { student } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update student',
        });
      }
    })
  );

  // DELETE /api/students/:id (Admin only)
  router.delete(
    '/api/students/:id',
    requireAdmin(async (_req, res, params) => {
      try {
        await deleteStudent(prisma, params.id);
        sendJson(res, 200, {
          success: true,
          data: { message: 'Student deleted successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete student',
        });
      }
    })
  );
}
