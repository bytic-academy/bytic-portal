import type { Router } from '../_lib/router.js';
import { prisma } from '../_lib/prisma.js';
import { sendJson } from '../_lib/response.js';
import { parseBody } from '../_lib/body-parser.js';
import { createCourseSchema, updateCourseSchema } from '../_lib/validation.js';
import { requireAuth, requireAdmin } from '../_lib/auth.js';
import {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from './service.js';

export function registerCoursesRoutes(router: Router) {
  // GET /api/courses (Authenticated)
  router.get(
    '/api/courses',
    requireAuth(async (_req, res) => {
      const courses = await listCourses(prisma);
      sendJson(res, 200, { success: true, data: { courses } });
    })
  );

  // POST /api/courses (Admin only)
  router.post(
    '/api/courses',
    requireAdmin(async (req, res) => {
      try {
        const body = await parseBody(req, createCourseSchema);
        const course = await createCourse(prisma, body);
        sendJson(res, 201, { success: true, data: { course } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create course',
        });
      }
    })
  );

  // GET /api/courses/:id (Authenticated)
  router.get(
    '/api/courses/:id',
    requireAuth(async (_req, res, params) => {
      const course = await getCourseById(prisma, params.id);
      if (!course) {
        sendJson(res, 404, { success: false, error: 'Course not found' });
        return;
      }
      sendJson(res, 200, { success: true, data: { course } });
    })
  );

  // PUT /api/courses/:id (Admin only)
  router.put(
    '/api/courses/:id',
    requireAdmin(async (req, res, params) => {
      try {
        const body = await parseBody(req, updateCourseSchema);
        const course = await updateCourse(prisma, params.id, body);
        sendJson(res, 200, { success: true, data: { course } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update course',
        });
      }
    })
  );

  // DELETE /api/courses/:id (Admin only)
  router.delete(
    '/api/courses/:id',
    requireAdmin(async (_req, res, params) => {
      try {
        await deleteCourse(prisma, params.id);
        sendJson(res, 200, {
          success: true,
          data: { message: 'Course deleted successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete course',
        });
      }
    })
  );
}
