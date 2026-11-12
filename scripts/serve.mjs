// Tiny static server for local preview of ./dist (run `npm run build` first; Vercel serves the same files in production).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(new URL("../dist", import.meta.url).pathname);
// Apply the same site-wide headers Vercel will send (vercel.json), so the browser tests run under the real CSP.
const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const SITE_HEADERS = Object.fromEntries((vercel.headers.find((h) => h.source === "/(.*)")?.headers || []).map((h) => [h.key, h.value]));
const PORT = Number(process.env.PORT || 3000);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf", ".woff2": "font/woff2" };

createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end("forbidden"); return; }
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-cache", ...SITE_HEADERS }).end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("not found");
  }
}).listen(PORT, "0.0.0.0", () => console.log(`serving ${ROOT} on :${PORT}`));
