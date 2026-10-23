// Zero-dependency static server for local preview: `npm start` → http://localhost:5173
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const port = Number(process.env.PORT) || 5173;
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json", ".md": "text/markdown; charset=utf-8",
};
const compressible = new Set([".html", ".css", ".js", ".svg", ".json", ".md"]);

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = normalize(join(root, p));
    if (!file.startsWith(root)) throw Object.assign(new Error("forbidden"), { code: 403 });
    if (!(await stat(file)).isFile()) throw new Error("not a file");
    let body = await readFile(file);
    const ext = extname(file), headers = { "Content-Type": types[ext] || "application/octet-stream", "Cache-Control": "no-cache" };
    if (compressible.has(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
      body = gzipSync(body); headers["Content-Encoding"] = "gzip";
    }
    res.writeHead(200, headers).end(body);
  } catch (e) {
    res.writeHead(e.code === 403 ? 403 : 404, { "Content-Type": "text/plain" }).end(e.code === 403 ? "Forbidden" : "Not found");
  }
}).listen(port, () => console.log(`MNE site → http://localhost:${port}`));
