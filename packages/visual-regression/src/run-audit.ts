import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compareAll } from "./compare-screenshots.js";
import { getAppConfigs, reportHtmlPath, resultsJsonPath } from "./config.js";
import { generateReport } from "./generate-report.js";
import { assertAppsReachable, filterReachableApps } from "./health-check.js";
import { visualRoutes } from "./routes.manifest.js";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(packageRoot, "..");

async function main(): Promise<void> {
  console.log("MCJ Visual Regression Audit (Chrome baseline → Edge compare)\n");
  console.log(`Routes in manifest: ${visualRoutes.length}`);

  const skipApps = new Set(
    (process.env.VISUAL_SKIP_APPS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const configuredApps = getAppConfigs().filter((app) => !skipApps.has(app.id));
  await assertAppsReachable(configuredApps);
  const { reachable } = await filterReachableApps(configuredApps);
  const reachableIds = reachable.map((a) => a.id).join(",");
  process.env.VISUAL_SKIP_APPS = [
    ...skipApps,
    ...configuredApps.filter((a) => !reachable.some((r) => r.id === a.id)).map((a) => a.id),
  ]
    .filter(Boolean)
    .join(",");
  console.log(`Apps under test: ${reachable.map((a) => a.id).join(", ")}`);
  process.env.VISUAL_COMPARE_APPS = reachable.map((a) => a.id).join(",");

  console.log("\n[1/4] Capturing Chrome baselines…");
  spawnSync("pnpm", ["exec", "tsx", "src/run-phase.ts", "baseline"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });

  console.log("\n[2/4] Capturing Edge screenshots…");
  spawnSync("pnpm", ["exec", "tsx", "src/run-phase.ts", "compare"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });

  console.log("\n[3/4] Pixel diff (Chrome vs Edge)…");
  const results = compareAll();
  const failed = results.filter((r) => r.status !== "pass");

  console.log("\n[4/4] HTML report…");
  generateReport();

  console.log("\n======== SUMMARY ========");
  console.log(`Total comparisons: ${results.length}`);
  console.log(`Pass (within threshold): ${results.length - failed.length}`);
  console.log(`Non-pass: ${failed.length}`);
  console.log(`Results JSON: ${resultsJsonPath}`);
  console.log(`HTML report: ${reportHtmlPath}`);

  const visualFailures = results.filter((r) => r.status === "fail");
  const incomplete = results.filter(
    (r) => r.status === "missing-baseline" || r.status === "missing-actual",
  );
  if (incomplete.length > 0) {
    console.warn(
      `Incomplete captures: ${incomplete.length} (re-run audit or start missing dev servers).`,
    );
  }
  process.exit(visualFailures.length > 0 || incomplete.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
