import { describe, it, expect } from 'vitest';
import { apiRouter } from '../api/_lib/router.js';
import { prisma } from '../api/_lib/prisma.js';
import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createTestUser } from './helpers.js';

function createMockRequest(method: string, url: string, body?: unknown, cookies?: string): IncomingMessage {
  const chunks = body !== undefined ? [Buffer.from(JSON.stringify(body))] : [];
  const req = Readable.from(chunks) as unknown as IncomingMessage;
  req.method = method;
  req.url = url;
  req.headers = {
    host: 'localhost:3000',
    ...(cookies ? { cookie: cookies } : {}),
    ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
  };
  return req;
}

function createMockResponse(): { res: ServerResponse; getResult: () => Promise<{ statusCode: number; json: any; headers: Record<string, string> }> } {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  let body = '';

  let resolvePromise: (value: any) => void;
  const promise = new Promise<{ statusCode: number; json: any; headers: Record<string, string> }>((resolve) => {
    resolvePromise = resolve;
  });

  const res = {
    statusCode: 200,
    headersSent: false,
    setHeader: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
    },
    writeHead: (code: number, hdrs?: Record<string, string>) => {
      res.statusCode = code;
      if (hdrs) {
        Object.entries(hdrs).forEach(([k, v]) => {
          headers[k.toLowerCase()] = v;
        });
      }
    },
    write: (chunk: string | Buffer) => {
      body += chunk.toString();
    },
    end: (chunk?: string | Buffer) => {
      if (chunk) body += chunk.toString();
      let json = null;
      try {
        json = JSON.parse(body);
      } catch {
        json = body;
      }
      resolvePromise({ statusCode: res.statusCode, json, headers });
    },
  } as unknown as ServerResponse;

  return { res, getResult: () => promise };
}

describe('API Router Integration (E2E API Simulation)', () => {
  it('handles POST /api/auth/login with admin seed credentials and sets cookie', async () => {
    const req = createMockRequest('POST', '/api/auth/login', {
      email: 'admin@bytic.ir',
      password: 'admin123',
    });
    const { res, getResult } = createMockResponse();

    const handled = await apiRouter.handle(req, res);
    expect(handled).toBe(true);

    const result = await getResult();
    expect(result.statusCode).toBe(200);
    expect(result.json.success).toBe(true);
    expect(result.json.data.user.email).toBe('admin@bytic.ir');
    expect(result.json.data.user.role).toBe('ADMIN');
    expect(result.headers['set-cookie']).toBeDefined();
    expect(result.headers['set-cookie']).toContain('session_token=');
  });

  it('handles GET /api/auth/me using the session cookie', async () => {
    // First login to get cookie
    const loginReq = createMockRequest('POST', '/api/auth/login', {
      email: 'admin@bytic.ir',
      password: 'admin123',
    });
    const { res: loginRes, getResult: getLoginResult } = createMockResponse();
    await apiRouter.handle(loginReq, loginRes);
    const loginResult = await getLoginResult();

    const cookieHeader = loginResult.headers['set-cookie'];
    const sessionToken = cookieHeader.match(/session_token=([^;]+)/)?.[1];
    expect(sessionToken).toBeDefined();

    // Now call /api/auth/me
    const meReq = createMockRequest('GET', '/api/auth/me', undefined, `session_token=${sessionToken}`);
    const { res: meRes, getResult: getMeResult } = createMockResponse();

    const handled = await apiRouter.handle(meReq, meRes);
    expect(handled).toBe(true);

    const meResult = await getMeResult();
    expect(meResult.statusCode).toBe(200);
    expect(meResult.json.success).toBe(true);
    expect(meResult.json.data.user.email).toBe('admin@bytic.ir');
  });

  describe('POST /api/users/:id/reset-password Integration', () => {
    async function createAuthenticatedUser(role: 'ADMIN' | 'TEACHER', password = 'Password123') {
      const user = await createTestUser(prisma, {
        role,
        password,
      });
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.authSession.create({
        data: {
          id: crypto.randomUUID(),
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
      return { user, token, cookie: `session_token=${token}` };
    }

    it('allows a teacher to reset their own password with correct current password and keeps session', async () => {
      const { user, token, cookie } = await createAuthenticatedUser('TEACHER', 'OldPass123');

      const req = createMockRequest('POST', `/api/users/${user.id}/reset-password`, {
        currentPassword: 'OldPass123',
        password: 'NewPass456',
      }, cookie);
      const { res, getResult } = createMockResponse();

      const handled = await apiRouter.handle(req, res);
      expect(handled).toBe(true);

      const result = await getResult();
      expect(result.statusCode).toBe(200);
      expect(result.json.success).toBe(true);

      // Session must remain active
      const sessionInDb = await prisma.authSession.findUnique({ where: { token } });
      expect(sessionInDb).not.toBeNull();
    });

    it('rejects self-reset if current password is wrong', async () => {
      const { user, cookie } = await createAuthenticatedUser('TEACHER', 'OldPass123');

      const req = createMockRequest('POST', `/api/users/${user.id}/reset-password`, {
        currentPassword: 'WrongPass999',
        password: 'NewPass456',
      }, cookie);
      const { res, getResult } = createMockResponse();

      await apiRouter.handle(req, res);
      const result = await getResult();
      expect(result.statusCode).toBe(400);
      expect(result.json.success).toBe(false);
      expect(result.json.error).toMatch(/current password/i);
    });

    it('denies a teacher from resetting another user password with 403 Forbidden', async () => {
      const teacher1 = await createAuthenticatedUser('TEACHER', 'TeacherPass1');
      const teacher2 = await createAuthenticatedUser('TEACHER', 'TeacherPass2');

      const req = createMockRequest('POST', `/api/users/${teacher2.user.id}/reset-password`, {
        password: 'HackedPassword123',
      }, teacher1.cookie);
      const { res, getResult } = createMockResponse();

      await apiRouter.handle(req, res);
      const result = await getResult();
      expect(result.statusCode).toBe(403);
      expect(result.json.success).toBe(false);
      expect(result.json.error).toMatch(/permission/i);
    });

    it('allows an admin to reset another user password without current password and invalidates sessions', async () => {
      const admin = await createAuthenticatedUser('ADMIN', 'AdminPass123');
      const teacher = await createAuthenticatedUser('TEACHER', 'TeacherOldPass');

      const req = createMockRequest('POST', `/api/users/${teacher.user.id}/reset-password`, {
        password: 'AdminSetPassword123',
      }, admin.cookie);
      const { res, getResult } = createMockResponse();

      await apiRouter.handle(req, res);
      const result = await getResult();
      expect(result.statusCode).toBe(200);
      expect(result.json.success).toBe(true);

      // Target teacher's session must be invalidated
      const teacherSession = await prisma.authSession.findUnique({ where: { token: teacher.token } });
      expect(teacherSession).toBeNull();
    });
  });
});
