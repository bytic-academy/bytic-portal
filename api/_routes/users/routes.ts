import type { Router } from '../../_lib/router.js';
import { prisma } from '../../_lib/prisma.js';
import { sendJson } from '../../_lib/response.js';
import { parseBody } from '../../_lib/body-parser.js';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from '../../_lib/validation.js';
import { requireAuth, requireAdmin, getAuthUser } from '../../_lib/auth.js';
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  resetPassword,
  deleteUser,
} from './service.js';

export function registerUsersRoutes(router: Router) {
  // GET /api/users (Admin only)
  router.get(
    '/api/users',
    requireAdmin(async (_req, res) => {
      const users = await listUsers(prisma);
      sendJson(res, 200, { success: true, data: { users } });
    })
  );

  // POST /api/users (Admin only)
  router.post(
    '/api/users',
    requireAdmin(async (req, res) => {
      try {
        const body = await parseBody(req, createUserSchema);
        const user = await createUser(prisma, body);
        sendJson(res, 201, { success: true, data: { user } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to create user',
        });
      }
    })
  );

  // GET /api/users/:id (Admin only)
  router.get(
    '/api/users/:id',
    requireAdmin(async (_req, res, params) => {
      const user = await getUserById(prisma, params.id);
      if (!user) {
        sendJson(res, 404, { success: false, error: 'User not found' });
        return;
      }
      sendJson(res, 200, { success: true, data: { user } });
    })
  );

  // PUT /api/users/:id (Admin only)
  router.put(
    '/api/users/:id',
    requireAdmin(async (req, res, params) => {
      try {
        const body = await parseBody(req, updateUserSchema);
        const user = await updateUser(prisma, params.id, body);
        sendJson(res, 200, { success: true, data: { user } });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update user',
        });
      }
    })
  );

  // POST /api/users/:id/reset-password (Admin or Self)
  router.post(
    '/api/users/:id/reset-password',
    requireAuth(async (req, res, params) => {
      try {
        const currentUser = getAuthUser(req);
        const isSelf = currentUser.id === params.id;
        const isAdmin = currentUser.role === 'ADMIN';

        if (!isAdmin && !isSelf) {
          sendJson(res, 403, {
            success: false,
            error: 'You do not have permission to reset this user password',
          });
          return;
        }

        const body = await parseBody(req, resetPasswordSchema);

        if (isSelf && !body.currentPassword) {
          sendJson(res, 400, {
            success: false,
            error: 'Current password is required',
          });
          return;
        }

        await resetPassword(prisma, params.id, body.password, {
          currentPassword: isSelf ? body.currentPassword : undefined,
          invalidateSessions: !isSelf,
        });

        sendJson(res, 200, {
          success: true,
          data: { message: 'Password reset successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to reset password',
        });
      }
    })
  );

  // DELETE /api/users/:id (Admin only)
  router.delete(
    '/api/users/:id',
    requireAdmin(async (req, res, params) => {
      try {
        const currentUser = getAuthUser(req);
        await deleteUser(prisma, params.id, currentUser.id);
        sendJson(res, 200, {
          success: true,
          data: { message: 'User deleted successfully' },
        });
      } catch (err) {
        sendJson(res, 400, {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to delete user',
        });
      }
    })
  );
}
