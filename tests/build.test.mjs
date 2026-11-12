// Tests for the Vercel build step: URL resolution, sitemap/robots output and the SEO markup of the built pages.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { siteUrl, sitemap, robots, verificationTags, DEFAULT_URL } from "../scripts/build.mjs";

test("siteUrl prefers SITE_URL, then Vercel's production URL, then the default; trailing slash is stripped", () => {
  assert.equal(siteUrl({ SITE_URL: "https://example.dev/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }), "https://example.dev");
  assert.equal(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }), "https://x.vercel.app");
  assert.equal(siteUrl({}), DEFAULT_URL);
});

test("sitemap lists the portfolio and the resume with absolute URLs", () => {
  const xml = sitemap("https://a.dev", "2026-11-12");
  assert.match(xml, /<loc>https:\/\/a\.dev\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/a\.dev\/resume\/<\/loc>/);
  assert.match(xml, /<lastmod>2026-11-12<\/lastmod>/);
});

test("robots.txt allows everything and points at the sitemap", () => {
  assert.equal(robots("https://a.dev"), "User-agent: *\nAllow: /\n\nSitemap: https://a.dev/sitemap.xml\n");
});

test("verification tags only appear when configured, and are attribute-safe", () => {
  assert.equal(verificationTags({}), "");
  const t = verificationTags({ GOOGLE_SITE_VERIFICATION: 'abc"><script>', BING_SITE_VERIFICATION: "bing123" });
  assert.match(t, /name="google-site-verification" content="abcscript"/);
  assert.ok(!t.includes('"><script>'));
  assert.match(t, /msvalidate\.01" content="bing123"/);
});

test("built pages carry canonical, JSON-LD Person with name variants, and no leftover placeholder", () => {
  execFileSync("node", ["scripts/build.mjs"], { env: { ...process.env, SITE_URL: "https://t.example" }, stdio: "pipe" });
  for (const page of ["dist/index.html", "dist/resume/index.html"]) {
    assert.ok(!readFileSync(page, "utf8").includes("__SITE_URL__"), `${page} still has the placeholder`);
  }
  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /<link rel="canonical" href="https:\/\/t\.example\/">/);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const person = ld["@graph"].find((n) => n["@type"] === "Person");
  assert.equal(person.name, "Nishant Kumar Singh");
  assert.deepEqual(person.alternateName.slice(0, 2), ["Nishant Kumar", "Nishant Singh"]);
  assert.ok(person.sameAs.includes("https://github.com/devnishantt"));
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, "exactly one h1");
  assert.match(readFileSync("dist/sitemap.xml", "utf8"), /https:\/\/t\.example\/resume\//);
  assert.match(readFileSync("dist/robots.txt", "utf8"), /Sitemap: https:\/\/t\.example\/sitemap\.xml/);
});
