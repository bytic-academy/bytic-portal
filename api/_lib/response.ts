import type { IncomingMessage, ServerResponse } from 'node:http';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export function sendJson<T>(
  res: ServerResponse,
  statusCode: number,
  data: ApiResponse<T>
) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export async function parseJsonBody<T = unknown>(req: IncomingMessage): Promise<T> {
  // If already parsed by middleware / framework
  if ((req as unknown as { body?: unknown }).body) {
    const body = (req as unknown as { body: unknown }).body;
    return (typeof body === 'string' ? JSON.parse(body) : body) as T;
  }

  return new Promise<T>((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({} as T);
        return;
      }
      try {
        resolve(JSON.parse(raw) as T);
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

export function getQueryParams(req: IncomingMessage): URLSearchParams {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  return url.searchParams;
}
