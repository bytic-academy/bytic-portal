import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import path from 'path';

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname;

        try {
          let modulePath = '';
          if (pathname === '/api/students' || pathname === '/api/students/') {
            modulePath = '/api/students/index.ts';
          } else if (pathname === '/api/attendance' || pathname === '/api/attendance/') {
            modulePath = '/api/attendance/index.ts';
          } else if (pathname === '/api/attendance/mark-all' || pathname === '/api/attendance/mark-all/') {
            modulePath = '/api/attendance/mark-all.ts';
          } else if (pathname === '/api/stats' || pathname === '/api/stats/') {
            modulePath = '/api/stats.ts';
          }

          if (modulePath) {
            const absolutePath = path.resolve(process.cwd(), `.${modulePath}`);
            const mod = await server.ssrLoadModule(absolutePath);
            if (mod.default && typeof mod.default === 'function') {
              return await mod.default(req, res);
            }
          }

          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: `API route ${pathname} not found` }));
        } catch (err) {
          console.error('API Dev Server error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    apiDevPlugin(),
    react(),
    tailwindcss(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
