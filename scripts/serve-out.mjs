// Serves the static export in out/ the way GitHub Pages does: under the base
// path, with folder URLs mapped to index.html and 404.html for misses.
// Usage: npm run build && node scripts/serve-out.mjs  (http://localhost:4000)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'out');
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const port = Number(process.env.PORT ?? 4000);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

async function file(path) {
  try {
    const s = await stat(path);
    if (s.isDirectory()) return file(join(path, 'index.html'));
    return path;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/' && base) {
    res.writeHead(302, { Location: `${base}/` }).end();
    return;
  }
  const rel = base && url.startsWith(base) ? url.slice(base.length) : url;
  const target = normalize(join(root, rel));
  const found = target.startsWith(root) ? await file(target) : null;
  const path = found ?? join(root, '404.html');
  res.writeHead(found ? 200 : 404, {
    'Content-Type': types[extname(path)] ?? 'application/octet-stream',
  });
  res.end(await readFile(path).catch(() => 'Not found'));
}).listen(port, () => console.log(`http://localhost:${port}${base}/`));
