# marketing-site

Custom front end for useambler.io (Squarespace 7.1). Spec and plan live in the
Ambler workspace: `product/decisions/2026-10-14_marketing-site-v2-*.md`.

- `npm run build` → `dist/` (committed; jsDelivr serves it) + `preview/index.html`
- `npm test` unit · `npm run e2e` layout/contrast/motion (needs network for Squarespace CSS in fixtures)
- Preview on the live site: open any page with `?v2=1` (remembered per browser; `?v2=0` turns it off)

## Release
1. Bump `version` in package.json → `npm run build` → commit.
2. `git tag v<version> && git push --tags`, then `node scripts/warm-cdn.mjs` — waits until jsDelivr serves every file (it answers 503 for about a minute after a new tag).
3. Paste `dist/head-injection.html` into Squarespace › Website › Pages › Custom Code › Code Injection › Header
   (replacing the previous Ambler v2 loader block). Only with Alexander's yes.
4. Rollback: paste the previous tag's `dist/head-injection.html`.

## Squarespace homepage blocks
Each file in `sections/` is one Code Block on `/home-v2` (order = filename).
The calculator block between 02 and 03 is the unchanged widget from
`ambler-internal-tools/website/time-back-calculator/calculator.html`.
