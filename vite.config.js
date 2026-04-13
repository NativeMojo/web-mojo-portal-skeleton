import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Read or generate dev_server.conf ────────────────────────────────────────
const CONF_PATH = path.resolve(__dirname, 'config/dev_server.conf');

function parseConf(content) {
  const conf = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    conf[key.trim()] = rest.join('=').trim();
  }
  return conf;
}

function readDevServerConf() {
  if (!fs.existsSync(CONF_PATH)) {
    // First run: generate with a random port to avoid collisions
    const port = 5000 + Math.floor(Math.random() * 4800);
    const content = [
      '# Portal dev server configuration',
      '# Auto-generated on first run. Safe to edit.',
      'host=127.0.0.1',
      `port=${port}`,
      'api_port=9009',
      '',
    ].join('\n');
    fs.mkdirSync(path.dirname(CONF_PATH), { recursive: true });
    fs.writeFileSync(CONF_PATH, content);
    console.log(`\n  Generated config/dev_server.conf (port ${port})\n`);
  }
  return parseConf(fs.readFileSync(CONF_PATH, 'utf-8'));
}

function isSetupComplete() {
  return fs.existsSync(CONF_PATH) && parseConf(fs.readFileSync(CONF_PATH, 'utf-8')).setup === 'true';
}

/**
 * Check if a backend is reachable at a given URL or localhost port.
 * Tries GET {base}/api/ with a 3s timeout.
 */
function checkBackend(target) {
  const checkUrl = target.startsWith('http') ? `${target}/api/` : `http://localhost:${target}/api/`;
  const mod = checkUrl.startsWith('https') ? https : http;

  return new Promise((resolve) => {
    const req = mod.get(checkUrl, { timeout: 3000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ reachable: true, status: res.statusCode, server: 'django-mojo' });
      });
    });
    req.on('error', () => resolve({ reachable: false }));
    req.on('timeout', () => { req.destroy(); resolve({ reachable: false }); });
  });
}

const devConf = readDevServerConf();
const DEV_HOST = devConf.host || '127.0.0.1';
const DEV_PORT = parseInt(devConf.port, 10) || 8088;
const API_PORT = parseInt(devConf.api_port, 10) || 9009;
const API_URL = devConf.api_url || '';  // Empty = local mode, URL = remote mode

// ── Vite Config ─────────────────────────────────────────────────────────────

export default defineConfig({
  root: '.',
  base: './',
  appType: 'mpa',

  publicDir: 'public',

  plugins: [
    {
      name: 'portal-dev-setup',
      configureServer(server) {

        // ── Setup API endpoints ───────────────────────────────────────

        // Check if a backend is reachable (local port or remote URL)
        server.middlewares.use('/__setup/check', async (req, res) => {
          const url = new URL(req.url, 'http://localhost');
          const remoteUrl = url.searchParams.get('url');
          const port = url.searchParams.get('port');
          const target = remoteUrl || port || '9009';
          const result = await checkBackend(target);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        });

        // Save config and mark setup complete
        server.middlewares.use('/__setup/save', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }

          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const apiPort = parseInt(data.api_port, 10) || 9009;
              const apiUrl = (data.api_url || '').trim();
              const currentConf = readDevServerConf();

              const lines = [
                '# Portal dev server configuration',
                '# Auto-generated. Safe to edit. Delete this file to re-run setup.',
                `host=${currentConf.host || '127.0.0.1'}`,
                `port=${currentConf.port || DEV_PORT}`,
                `api_port=${apiPort}`,
              ];
              if (apiUrl) {
                lines.push(`api_url=${apiUrl}`);
              }
              lines.push('setup=true', '');

              fs.writeFileSync(CONF_PATH, lines.join('\n'));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });

        // ── Redirect logic ────────────────────────────────────────────

        // If setup is not complete, redirect /portal/ to /setup/
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/portal') && !isSetupComplete()) {
            res.statusCode = 302;
            res.setHeader('Location', '/setup/');
            res.end();
            return;
          }
          next();
        });

        // Auth is served locally from /auth/index.html (same origin as portal).
        // This avoids cross-origin localStorage issues in dev.
        // The auth page uses mojo-auth.js to call the backend API directly.
      }
    }
  ],

  // Expose config to portal's config.js at dev time
  define: {
    '__DEV_API_PORT__': JSON.stringify(API_PORT),
    '__DEV_API_URL__': JSON.stringify(API_URL),
  },

  server: {
    port: DEV_PORT,
    host: DEV_HOST,
    open: isSetupComplete() ? '/portal/' : '/setup/',
  },

  optimizeDeps: {
    exclude: ['web-mojo']
  },

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        portal: path.resolve(__dirname, 'portal/index.html'),
        auth: path.resolve(__dirname, 'auth/index.html'),
      },
      output: {
        entryFileNames: 'portal/[name]-[hash].js',
        chunkFileNames: 'portal/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = (assetInfo.name || '').split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/css/i.test(extType)) {
            return 'portal/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
