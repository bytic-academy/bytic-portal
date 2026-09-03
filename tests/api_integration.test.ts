import { describe, it, expect } from 'vitest';
import { apiRouter } from '../api/_lib/router.js';
import { prisma } from '../api/_lib/prisma.js';
import { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';

function createMockRequest(method: string, url: string, body?: unknown, cookies?: string): IncomingMessage {
  const req = new EventEmitter() as unknown as IncomingMessage;
  req.method = method;
  req.url = url;
  req.headers = {
    host: 'localhost:3000',
    ...(cookies ? { cookie: cookies } : {}),
    ...(body ? { 'content-type': 'application/json' } : {}),
  };

  process.nextTick(() => {
    if (body) {
      req.emit('data', Buffer.from(JSON.stringify(body)));
    }
    req.emit('end');
  });

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
      statusCode = code;
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
      resolvePromise({ statusCode, json, headers });
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
});
