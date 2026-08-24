import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Cargar variables de .env y .env.local en process.env para los handlers locales
const env = loadEnv('', process.cwd(), '');
Object.assign(process.env, env);

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function localApiDevServer() {
  return {
    name: 'local-api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const pathname = urlObj.pathname;

          // Parse query params into req.query
          const query: Record<string, string> = {};
          urlObj.searchParams.forEach((v, k) => {
            query[k] = v;
          });
          req.query = query;
          // Recargar env dinámicamente para reflejar cambios en .env.local sin reiniciar el servidor
          const currentEnv = loadEnv('', process.cwd(), '');
          Object.assign(process.env, currentEnv);

          // Parse JSON body if present
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
            if (!req.body) {
              const buffers: Buffer[] = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const data = Buffer.concat(buffers).toString();
              try {
                req.body = data ? JSON.parse(data) : {};
              } catch {
                req.body = {};
              }
            }
          }

          // Polyfill res.status and res.json for Express/Vercel compatibility
          res.status = function(statusCode: number) {
            res.statusCode = statusCode;
            return res;
          };
          res.json = function(data: any) {
            if (!res.writableEnded) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            }
            return res;
          };

          // Dynamic admin router
          if (pathname.startsWith('/api/admin/')) {
            const sub = pathname.replace('/api/admin/', '').split('/')[0];
            const handlerPath = `/api/admin/_handlers/${sub}.ts`;
            try {
              const { default: handler } = await server.ssrLoadModule(handlerPath);
              return handler(req, res);
            } catch {
              const { default: handler } = await server.ssrLoadModule('/api/admin/[...slug].ts');
              return handler(req, res);
            }
          }
          if (pathname === '/api/send-contact') {
            const { default: handler } = await server.ssrLoadModule('/api/send-contact.ts');
            return handler(req, res);
          }
          if (pathname === '/api/send-booking') {
            const { default: handler } = await server.ssrLoadModule('/api/send-booking.ts');
            return handler(req, res);
          }

          return next();
        } catch (err: any) {
          console.error('[API Dev Error]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'API Dev Server Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    localApiDevServer(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        // Vendor splitting: separate heavy libraries into cacheable chunks.
        // React ecosystem, GSAP, Framer Motion and icons each get their own file.
        // Browsers cache them independently — on repeat visits only changed chunks re-download.
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router'],
          'vendor-motion': ['motion/react'],
          'vendor-gsap':   ['gsap'],
          'vendor-icons':  ['lucide-react'],
        },
      },
    },
  },
})
