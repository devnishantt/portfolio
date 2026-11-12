// Renders site/og.png (1200x630) from the same fonts and palette as the site.
// Usage: node scripts/og.mjs   (needs the `playwright` package and Chromium)
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const font = async (f) => (await readFile(new URL(`../site/fonts/${f}`, import.meta.url))).toString("base64");
const [inter, mono] = await Promise.all([font("inter-var.woff2"), font("jetbrains-mono-var.woff2")]);

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${inter}) format("woff2");font-weight:100 900}
@font-face{font-family:JB;src:url(data:font/woff2;base64,${mono}) format("woff2");font-weight:100 800}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#07080a;color:#f2f3f5;font-family:Inter;position:relative;overflow:hidden;padding:72px 80px}
.glow{position:absolute;inset:0;background:radial-gradient(600px 300px at 30% 0,rgba(90,110,170,.22),transparent 70%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(700px 400px at 30% 10%,#000,transparent)}
.k{position:relative;font:500 25px JB;color:#b4b9c2;display:flex;align-items:center;gap:14px}
.k i{width:16px;height:16px;border-radius:50%;background:#3ee09a;box-shadow:0 0 0 6px rgba(62,224,154,.18)}
h1{position:relative;margin-top:44px;font-size:132px;line-height:.95;letter-spacing:-.055em;font-weight:700}
h1 b{color:#ff5d5d;font-weight:700}
h1 span{display:block;background:linear-gradient(180deg,#8d939d,#4a4f57);-webkit-background-clip:text;color:transparent;padding-bottom:.1em}
.f{position:absolute;left:80px;right:80px;bottom:56px;display:flex;justify-content:space-between;gap:40px;font:500 24px JB;color:#7d838e;white-space:nowrap}
.f b{color:#f2f3f5}
</style><div class="glow"></div><div class="grid"></div>
<p class="k"><i></i>Nishant Kumar Singh / backend engineer</p>
<h1>Try to <b>break</b><span>my backends.</span></h1>
<p class="f"><em style="font-style:normal"><b>5</b> live labs, all breakable</em><em style="font-style:normal">nishant-kumar-singh.vercel.app</em></p>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL("../site/og.png", import.meta.url).pathname });
await browser.close();
console.log("wrote site/og.png");
