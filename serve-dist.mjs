/* global URL, console, process */

import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(rootDir, 'dist');
const indexFile = join(distDir, 'index.html');
const port = Number.parseInt(process.env.PORT ?? '8080', 10);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.wasm', 'application/wasm'],
]);

function getContentType(pathname) {
  return contentTypes.get(extname(pathname)) ?? 'application/octet-stream';
}

function getSafeAssetPath(pathname) {
  const relativePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  return join(distDir, relativePath);
}

async function sendFile(response, filePath, contentType, statusCode = 200) {
  const fileStats = await stat(filePath);

  response.writeHead(statusCode, {
    'Content-Length': fileStats.size,
    'Content-Type': contentType,
    'Cache-Control':
      filePath === indexFile ? 'no-cache' : 'public, max-age=31536000, immutable',
  });

  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const pathname = decodeURIComponent(requestUrl.pathname);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Method Not Allowed');
      return;
    }

    const requestedPath =
      pathname === '/' ? indexFile : getSafeAssetPath(pathname.slice(1));
    const isAssetRequest = extname(pathname) !== '';
    const filePath =
      existsSync(requestedPath) && !pathname.endsWith('/')
        ? requestedPath
        : isAssetRequest
          ? null
          : indexFile;

    if (!filePath || !existsSync(filePath)) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not Found');
      return;
    }

    if (request.method === 'HEAD') {
      const fileStats = await stat(filePath);
      response.writeHead(200, {
        'Content-Length': fileStats.size,
        'Content-Type': getContentType(filePath),
      });
      response.end();
      return;
    }

    await sendFile(response, filePath, getContentType(filePath));
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal Server Error');
    console.error('serve-dist error', error);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving dist from ${distDir} on http://0.0.0.0:${port}`);
});
