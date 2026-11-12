# portfolio

[![CI](https://github.com/devnishantt/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/devnishantt/portfolio/actions/workflows/ci.yml)

Portfolio of **Nishant Kumar Singh**, backend engineer (GitHub: [devnishantt](https://github.com/devnishantt)),
built for Vercel. A portfolio you attack instead of read: five live labs where you try to break the
invariants my backends enforce (races, retried payments, money precision, audit trails, two-person approvals).

It is the Vercel twin of [devnishantt.github.io](https://devnishantt.github.io), with search-focused markup,
an About section, security headers and a build step that fills in the final URL.

## Deploy to Vercel

1. Vercel dashboard, **Add New, Project**, import this repository. Framework preset: **Other**. Nothing else to configure,
   `vercel.json` sets the build command and output directory.
2. The first URL Vercel gives you is used automatically (`VERCEL_PROJECT_PRODUCTION_URL`). To pin it, or to use a
   custom domain, set the environment variable **`SITE_URL`** (for example `https://nishantkumarsingh.dev`) and redeploy.
   Canonical URLs, Open Graph tags, JSON-LD, `sitemap.xml` and `robots.txt` all follow it.
3. The live address is `devnishantt.vercel.app`, which is what the committed resume QR code and the OG image point to. If it ever changes, run
   `SITE_URL=https://your-url npm run build` and update the QR in `site/resume/index.html` and the text in `scripts/og.mjs`.

## SEO checklist (the part that is not code)

The markup here makes the site easy to index and unambiguous about who it is about. It cannot, on its own, outrank
other people called Nishant Kumar or Nishant Singh, which are very common names. What moves rankings is time and
links:

1. **Google Search Console**: add the property, verify with the HTML tag by setting `GOOGLE_SITE_VERIFICATION` in Vercel,
   submit `/sitemap.xml`, then use *URL inspection, Request indexing* on `/`.
2. **Bing Webmaster Tools**: same with `BING_SITE_VERIFICATION`. Bing also feeds DuckDuckGo and others.
3. **Link to the site from places you control**: GitHub profile website field, GitHub profile README, each pinned repo's
   website field, LinkedIn, and the github.io twin. The site already declares `rel="me"` back to GitHub.
4. **Use the same name everywhere** (Nishant Kumar Singh + `devnishantt`). Consistent naming is how search engines merge
   profiles into one entity.
5. For short queries like "nishant k", no site can be guaranteed a position. Long-tail queries such as
   "nishant kumar singh backend engineer" are realistic targets.

## Develop

```sh
npm ci
npm test            # 24 lab unit tests + build/SEO tests
npm run build       # site/ -> dist/ (fills in URL, sitemap, robots)
npm run serve       # serves dist/ on :3000
npm run test:e2e    # drives every lab in Chromium (needs: npx playwright install chromium)
npm run og          # re-renders site/og.png
npm run resume:pdf  # re-renders the resume PDF from /resume/ (must fit one A4 page)
```

`site/` is the source of truth and contains the `__SITE_URL__` placeholder; `dist/` is generated and ignored by git.

## Status data

`scripts/fetch_status.py` reads recent main-branch CI runs for the featured repositories from the GitHub Actions API and
writes `site/data/status.json`. The CI workflow runs it daily and commits the result, which makes Vercel redeploy.
