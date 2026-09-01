import type { IncomingMessage, ServerResponse } from 'node:http';
import { sendJson } from './response.js';
import studentsHandler from '../students/index.js';
import attendanceHandler from '../attendance/index.js';
import markAllHandler from '../attendance/mark-all.js';
import statsHandler from '../stats.js';

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  params: Record<string, string>
) => Promise<void | unknown> | void | unknown;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'ALL';

interface RouteEntry {
  method: HttpMethod;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: RouteEntry[] = [];

  private pathToRegexp(path: string): { regexp: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];
    const normalized = path.replace(/\/+$/, '') || '/';
    const pattern = normalized.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    // Match exact path with optional trailing slash
    return {
      regexp: new RegExp(`^${pattern}/?$`),
      paramNames,
    };
  }

  public register(method: HttpMethod, path: string, handler: RouteHandler) {
    const { regexp, paramNames } = this.pathToRegexp(path);
    this.routes.push({ method, pattern: regexp, paramNames, handler });
  }

  public get(path: string, handler: RouteHandler) {
    this.register('GET', path, handler);
  }

  public post(path: string, handler: RouteHandler) {
    this.register('POST', path, handler);
  }

  public put(path: string, handler: RouteHandler) {
    this.register('PUT', path, handler);
  }

  public patch(path: string, handler: RouteHandler) {
    this.register('PATCH', path, handler);
  }

  public delete(path: string, handler: RouteHandler) {
    this.register('DELETE', path, handler);
  }

  public all(path: string, handler: RouteHandler) {
    this.register('ALL', path, handler);
  }

  public async handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const reqMethod = (req.method || 'GET').toUpperCase() as HttpMethod;

    for (const route of this.routes) {
      if (route.method !== 'ALL' && route.method !== reqMethod) {
        continue;
      }

      const match = pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });

        try {
          await route.handler(req, res, params);
          return true;
        } catch (error) {
          console.error(`API Error on [${reqMethod}] ${pathname}:`, error);
          if (!res.headersSent) {
            sendJson(res, 500, {
              success: false,
              error: error instanceof Error ? error.message : 'Internal Server Error',
            });
          }
          return true;
        }
      }
    }

    // If it's an API route but unhandled by registered routes
    if (pathname.startsWith('/api/')) {
      sendJson(res, 404, {
        success: false,
        error: `API route [${reqMethod}] ${pathname} not found`,
      });
      return true;
    }

    return false;
  }
}

export function createDefaultApiRouter(): Router {
  const router = new Router();

  // Health checks
  const healthHandler: RouteHandler = (_req, res) => {
    sendJson(res, 200, {
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  };
  router.get('/health', healthHandler);
  router.get('/api/health', healthHandler);

  // Core API routes
  router.all('/api/students', studentsHandler);
  router.all('/api/attendance', attendanceHandler);
  router.all('/api/attendance/mark-all', markAllHandler);
  router.all('/api/stats', statsHandler);

  return router;
}

export const apiRouter = createDefaultApiRouter();
