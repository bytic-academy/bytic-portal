import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { applySecurityHeaders, handleCors, logRequest } from './middlewares.js';
import { apiRouter } from '../api/_lib/router.js';
import { prisma } from '../api/_lib/prisma.js';

// MIME types dictionary for static file serving
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

function serveStaticFile(res: http.ServerResponse, filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return false;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Caching headers
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    return true;
  } catch (err) {
    console.error('Error serving static file:', err);
    return false;
  }
}

async function requestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  const start = performance.now();
  applySecurityHeaders(res);

  if (handleCors(req, res)) {
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  res.on('finish', () => {
    logRequest(req, res.statusCode, performance.now() - start);
  });

  // 1. API Routes & Health Checks via Unified Router
  if (pathname.startsWith('/api/') || pathname === '/health') {
    const handled = await apiRouter.handle(req, res);
    if (handled) return;
  }

  // 3. Static Assets & SPA Client-Side Routing
  const sanitizedPath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const candidatePath = path.join(DIST_DIR, sanitizedPath);

  if (serveStaticFile(res, candidatePath)) {
    return;
  }

  // SPA Fallback to dist/index.html
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (serveStaticFile(res, indexPath)) {
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

const server = http.createServer(requestHandler);

server.listen(PORT, HOST, () => {
  console.log(`=================================================`);
  console.log(`  Bytic Attendance Production Server Ready`);
  console.log(`  URL: http://${HOST}:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`  Static Assets: ${DIST_DIR}`);
  console.log(`=================================================`);
});

// Graceful Shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database connection closed.');
    } catch (e) {
      console.error('Error disconnecting database:', e);
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Force shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
