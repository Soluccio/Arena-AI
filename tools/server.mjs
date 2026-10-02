// =============================================================================
// tools/server.mjs — Servidor estático ZERO dependências (só node:http).
// Serve o jogo com o MIME correto para ES Modules. Uso: npm start
// (ou `node tools/server.mjs`). Porta via env PORT (padrão 3000), em 0.0.0.0.
// =============================================================================

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json',
};

http.createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '') p = '/index.html';
  const file = normalize(join(root, p));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('404');
  }
}).listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Belisco servido em http://0.0.0.0:${process.env.PORT || 3000}/`);
});
