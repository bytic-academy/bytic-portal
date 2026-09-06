import type { IncomingMessage, ServerResponse } from 'node:http';
import { apiRouter } from './_lib/router.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Support Vercel rewrite headers if URL was rewritten to /api
  const vercelUrl =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-forwarded-uri'] as string);

  if (vercelUrl && (req.url === '/api' || req.url === '/api/')) {
    req.url = vercelUrl;
  }

  const handled = await apiRouter.handle(req, res);

  if (!handled && !res.headersSent) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: `Route not found: ${req.url || '/'}`,
      })
    );
  }
}
