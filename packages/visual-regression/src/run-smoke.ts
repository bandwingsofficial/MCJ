import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compareAll } from "./compare-screenshots.js";
import { generateReport } from "./generate-report.js";
import { getAppConfigs } from "./config.js";
import { assertAppsReachable } from "./health-check.js";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(packageRoot, "..");

const smokePattern = process.env.VISUAL_SMOKE_GREP ?? "admin-web /login|customer-web /";

async function main(): Promise<void> {
  await assertAppsReachable(getAppConfigs());

  for (const phase of ["baseline", "compare"] as const) {
    process.env.VISUAL_PHASE = phase;
    const project =
      phase === "baseline" ? "baseline-chrome-1920" : "compare-edge-1920";
    spawnSync(
      "pnpm",
      ["exec", "playwright", "test", "--project", project, "-g", smokePattern],
      { cwd: projectRoot, stdio: "inherit", shell: true, env: process.env },
    );
  }

  compareAll();
  generateReport();
  console.log("Smoke visual audit complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
