// Copies ./site to ./dist and fills in everything that depends on the final public URL:
// the __SITE_URL__ placeholder, sitemap.xml, robots.txt and optional search-engine verification tags.
//
// SITE_URL                       explicit origin, e.g. https://nishantkumarsingh.dev (use this for a custom domain)
// VERCEL_PROJECT_PRODUCTION_URL  set by Vercel itself, used when SITE_URL is not
// GOOGLE_SITE_VERIFICATION       content of Google Search Console's HTML-tag verification
// BING_SITE_VERIFICATION         content of Bing Webmaster Tools' msvalidate.01 tag
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const SRC = join(ROOT, "site");
const OUT = join(ROOT, "dist");
export const DEFAULT_URL = "https://nishant-kumar-singh.vercel.app";

export function siteUrl(env = process.env) {
  const raw = env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`) || DEFAULT_URL;
  return raw.replace(/\/+$/, "");
}

export function verificationTags(env = process.env) {
  const esc = (v) => v.replace(/[&"<>]/g, "");
  const tags = [];
  if (env.GOOGLE_SITE_VERIFICATION) tags.push(`  <meta name="google-site-verification" content="${esc(env.GOOGLE_SITE_VERIFICATION)}">`);
  if (env.BING_SITE_VERIFICATION) tags.push(`  <meta name="msvalidate.01" content="${esc(env.BING_SITE_VERIFICATION)}">`);
  return tags.join("\n");
}

export function sitemap(url, lastmod) {
  const entry = (loc, priority) => `  <url>\n    <loc>${url}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entry("/", "1.0")}\n${entry("/resume/", "0.8")}\n</urlset>\n`;
}

export const robots = (url) => `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`;

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) yield* walk(p); else yield p;
  }
}

async function main() {
  const url = siteUrl();
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await cp(SRC, OUT, { recursive: true });
  const verify = verificationTags();
  let replaced = 0;
  for await (const file of walk(OUT)) {
    if (!/\.(html|json|txt|xml|js|css)$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    if (!text.includes("__SITE_URL__") && !(verify && file.endsWith("index.html") && file === join(OUT, "index.html"))) continue;
    let next = text.replaceAll("__SITE_URL__", url);
    if (verify && file === join(OUT, "index.html")) next = next.replace("  <link rel=\"canonical\"", `${verify}\n  <link rel="canonical"`);
    await writeFile(file, next);
    replaced++;
  }
  await writeFile(join(OUT, "sitemap.xml"), sitemap(url, new Date().toISOString().slice(0, 10)));
  await writeFile(join(OUT, "robots.txt"), robots(url));
  console.log(`built dist/ for ${url} (${replaced} files filled in)`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
