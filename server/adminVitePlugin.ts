// ==============================================================================
// SAFRO ADMIN BACKEND — VITE PLUGIN INTEGRATION
// Connects Node.js Admin API Middleware directly into Vite Dev & Preview Servers
// ==============================================================================

import type { Plugin, ViteDevServer, PreviewServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { bootstrapAdmin } from './auth.ts';
import { handleAdminApi } from './adminApiHandler.ts';

/**
 * Manually parse .env to populate backend process.env variables (ADMIN_EMAIL, ADMIN_PASSWORD, etc.)
 * without relying on client-side prefix rules.
 */
function loadBackendEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        const key = line.substring(0, eqIdx).trim();
        const value = line.substring(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

/**
 * Helper to safely read JSON request body stream
 */
function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return resolve({});
    }

    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      // Protect against oversized payloads (> 1MB)
      if (raw.length > 1024 * 1024) {
        req.destroy();
        resolve({});
      }
    });

    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });

    req.on('error', () => {
      resolve({});
    });
  });
}

function setupMiddleware(server: ViteDevServer | PreviewServer) {
  loadBackendEnv();
  bootstrapAdmin();

  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';
    const pathname = url.split('?')[0];

    if (pathname.startsWith('/api/admin')) {
      try {
        const body = await readJsonBody(req);
        await handleAdminApi(req, res, pathname, body);
      } catch (err: any) {
        console.error('[SAFRO Admin API Error]', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal administrative server error.' }));
        }
      }
      return;
    }

    next();
  });
}

export function adminAuthPlugin(): Plugin {
  return {
    name: 'safro-admin-auth-plugin',
    configureServer(server: ViteDevServer) {
      setupMiddleware(server);
    },
    configurePreviewServer(server: PreviewServer) {
      setupMiddleware(server);
    },
  };
}
