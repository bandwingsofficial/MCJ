import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const phase = process.argv[2];
if (phase !== "baseline" && phase !== "compare") {
  console.error("Usage: tsx src/run-phase.ts <baseline|compare>");
  process.exit(1);
}

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(packageRoot, "..");

const projects =
  phase === "baseline"
    ? ["baseline-chrome-1920", "baseline-chrome-1366"]
    : ["compare-edge-1920", "compare-edge-1366"];

process.env.VISUAL_PHASE = phase;

const args = [
  "exec",
  "playwright",
  "test",
  ...projects.flatMap((project) => ["--project", project]),
];

const result = spawnSync("pnpm", args, {
  cwd: projectRoot,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, VISUAL_PHASE: phase },
});

process.exit(result.status ?? 1);
