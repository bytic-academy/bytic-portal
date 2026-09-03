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
        if (!req.url?.startsWith('/api') && req.url !== '/health') {
          return next();
        }

        try {
          const routerPath = path.resolve(process.cwd(), './api/_lib/router.ts');
          const mod = await server.ssrLoadModule(routerPath);
          if (mod.apiRouter && typeof mod.apiRouter.handle === 'function') {
            const handled = await mod.apiRouter.handle(req, res);
            if (handled) return;
          }
          next();
        } catch (err) {
          console.error('API Dev Server error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: err instanceof Error ? err.message : String(err),
              })
            );
          }
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
  ssr: {
    external: ['bcryptjs', 'better-sqlite3', '@prisma/adapter-libsql', '@libsql/client'],
  },
});
