import fs from "node:fs";
import path from "node:path";

import { reportHtmlPath, resultsJsonPath, outputRoot } from "./config.js";
import type { VisualCompareResult } from "./compare-screenshots.js";

function rel(p: string): string {
  return path.relative(path.dirname(reportHtmlPath), p).split(path.sep).join("/");
}

function statusIcon(status: VisualCompareResult["status"]): string {
  switch (status) {
    case "pass":
      return "✅";
    case "fail":
      return "❌";
    default:
      return "⚠️";
  }
}

function groupByApp(results: VisualCompareResult[]): Map<string, VisualCompareResult[]> {
  const map = new Map<string, VisualCompareResult[]>();
  for (const row of results) {
    const list = map.get(row.app) ?? [];
    list.push(row);
    map.set(row.app, list);
  }
  return map;
}

export function generateReport(): void {
  if (!fs.existsSync(resultsJsonPath)) {
    throw new Error(`Missing ${resultsJsonPath}. Run compare phase first.`);
  }

  const results = JSON.parse(
    fs.readFileSync(resultsJsonPath, "utf8"),
  ) as VisualCompareResult[];

  const total = results.length;
  const chromePass = results.filter((r) => r.status === "pass").length;
  const edgePass = chromePass;
  const visualDiffs = results.filter((r) => r.status === "fail").length;
  const failedRoutes = results.filter((r) => r.status !== "pass");

  const byApp = groupByApp(results);
  const appSections: string[] = [];

  for (const [app, rows] of [...byApp.entries()].sort()) {
    const lines = rows
      .sort((a, b) => a.path.localeCompare(b.path) || a.viewport.localeCompare(b.viewport))
      .map((row) => {
        const label = `${row.path} @ ${row.viewport}px`;
        const icon = statusIcon(row.status);
        const detail =
          row.status === "fail"
            ? ` — diff ${(row.diffRatio * 100).toFixed(2)}% (${row.diffPixels} px)`
            : row.status !== "pass"
              ? ` — ${row.status}`
              : "";
        return `<tr><td>${icon}</td><td><code>${label}</code></td><td>${row.status}${detail}</td></tr>`;
      })
      .join("\n");

    appSections.push(`
      <section>
        <h2>${app}</h2>
        <table>
          <thead><tr><th></th><th>Route</th><th>Result</th></tr></thead>
          <tbody>${lines}</tbody>
        </table>
      </section>`);
  }

  const diffCards = failedRoutes
    .filter((r) => r.status === "fail" && r.baselinePath && r.actualPath)
    .map((row) => {
      const diffImg = row.diffPath && fs.existsSync(row.diffPath) ? rel(row.diffPath) : "";
      return `
        <article class="card">
          <h3>${row.app} <code>${row.path}</code> @ ${row.viewport}px</h3>
          <p>Diff ratio: <strong>${(row.diffRatio * 100).toFixed(2)}%</strong> (${row.diffPixels} pixels)</p>
          <div class="shots">
            <figure><figcaption>Chrome (baseline)</figcaption><img src="${rel(row.baselinePath!)}" alt="baseline" loading="lazy" /></figure>
            <figure><figcaption>Edge (actual)</figcaption><img src="${rel(row.actualPath!)}" alt="actual" loading="lazy" /></figure>
            ${diffImg ? `<figure><figcaption>Diff</figcaption><img src="${diffImg}" alt="diff" loading="lazy" /></figure>` : ""}
          </div>
        </article>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>MCJ Visual Regression — Chrome vs Edge</title>
  <style>
    body { font-family: system-ui, Segoe UI, sans-serif; margin: 0; background: #f6f9fd; color: #102a56; }
    header { background: #102a56; color: #fff; padding: 1.5rem 2rem; }
    main { padding: 1.5rem 2rem 3rem; max-width: 1400px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; margin-bottom: 2rem; }
    th, td { padding: 0.65rem 1rem; border-bottom: 1px solid #e1ebf5; text-align: left; vertical-align: top; }
    th { background: #eef4ff; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; }
    code { font-size: 0.9em; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 1.5rem 0 2rem; }
    .summary div { background: #fff; border: 1px solid #e1ebf5; border-radius: 12px; padding: 1rem; }
    .summary strong { display: block; font-size: 1.5rem; margin-top: 0.25rem; }
    .card { background: #fff; border: 1px solid #e1ebf5; border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; }
    .shots { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
    .shots img { width: 100%; height: auto; border: 1px solid #dce8f5; border-radius: 8px; background: #fff; }
    figcaption { font-size: 0.8rem; color: #647a9b; margin-bottom: 0.35rem; }
  </style>
</head>
<body>
  <header>
    <h1>Visual Regression Report</h1>
    <p>Chrome (Chromium) baseline vs Microsoft Edge — audit only, no UI fixes applied.</p>
  </header>
  <main>
    <div class="summary">
      <div>Total comparisons<strong>${total}</strong></div>
      <div>Matched (within threshold)<strong>${chromePass}</strong></div>
      <div>Visual differences<strong>${visualDiffs}</strong></div>
      <div>Non-pass (incl. missing)<strong>${failedRoutes.length}</strong></div>
    </div>
    ${appSections.join("\n")}
    <h2>Visual diffs</h2>
    ${diffCards || "<p>No pixel diffs above threshold (or missing captures).</p>"}
    <p style="margin-top:2rem;color:#647a9b;font-size:0.9rem">Artifacts: <code>${outputRoot.replace(/\\/g, "/")}</code></p>
  </main>
</body>
</html>`;

  fs.mkdirSync(path.dirname(reportHtmlPath), { recursive: true });
  fs.writeFileSync(reportHtmlPath, html, "utf8");
  console.log(`Report written to ${reportHtmlPath}`);
}

const executed = path.resolve(process.argv[1] ?? "");
if (executed.endsWith(`${path.sep}generate-report.ts`)) {
  generateReport();
}
