# MCJ Visual Regression (Chrome vs Edge)

Chrome (Chromium) screenshots are the **baseline**. Microsoft Edge captures are **compared** with pixel diffs.

## Prerequisites

1. Local dev servers for all four apps. Defaults match `.route-audit` (3010/3011); if you use other ports (e.g. admin **3001**, customer **3000**), set env vars — see `.visual-regression/.env.example`.
   - admin-web → `VISUAL_ADMIN_URL` (default `http://localhost:3010`)
   - customer-web → `VISUAL_CUSTOMER_URL` (default `http://localhost:3011`)
   - branch-web → `http://localhost:3012`
   - student-web → `http://localhost:3002`
2. Playwright browsers: `pnpm exec playwright install chromium msedge`
3. Optional auth: export `VISUAL_*_STORAGE_STATE` to a Playwright storage JSON (see `auth/README.md`).

## Commands (from repo root)

```bash
pnpm visual:test          # full audit: baseline → edge → diff → report
pnpm visual:test:report   # regenerate HTML from results.json
pnpm visual:discover      # list Next.js page routes (helper)
```

## Outputs

- `.visual-regression/output/baseline/chrome/` — Chrome PNGs
- `.visual-regression/output/actual/edge/` — Edge PNGs
- `.visual-regression/output/diff/` — diff PNGs
- `.visual-regression/output/results.json`
- `.visual-regression/output/report.html`

## Route list

Edit `src/routes.manifest.ts`. Stable audit slugs match `.route-audit/run-stability-audit.ps1`.
