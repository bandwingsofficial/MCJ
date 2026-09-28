import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(packageRoot, "../../..");

export const outputRoot =
  process.env.VISUAL_OUTPUT_DIR ??
  path.join(repoRoot, ".visual-regression", "output");

export const baselineDir = path.join(outputRoot, "baseline", "chrome");
export const actualDir = path.join(outputRoot, "actual", "edge");
export const diffDir = path.join(outputRoot, "diff");
export const resultsJsonPath = path.join(outputRoot, "results.json");
export const reportHtmlPath = path.join(outputRoot, "report.html");

export type AppId = "admin-web" | "branch-web" | "customer-web" | "student-web";

export interface AppConfig {
  id: AppId;
  baseUrl: string;
  storageStatePath?: string;
}

export function getAppConfigs(): AppConfig[] {
  return [
    {
      id: "admin-web",
      baseUrl: process.env.VISUAL_ADMIN_URL ?? "http://localhost:3010",
      storageStatePath: process.env.VISUAL_ADMIN_STORAGE_STATE,
    },
    {
      id: "branch-web",
      baseUrl: process.env.VISUAL_BRANCH_URL ?? "http://localhost:3012",
      storageStatePath: process.env.VISUAL_BRANCH_STORAGE_STATE,
    },
    {
      id: "customer-web",
      baseUrl: process.env.VISUAL_CUSTOMER_URL ?? "http://localhost:3011",
      storageStatePath: process.env.VISUAL_CUSTOMER_STORAGE_STATE,
    },
    {
      id: "student-web",
      baseUrl: process.env.VISUAL_STUDENT_URL ?? "http://localhost:3002",
      storageStatePath: process.env.VISUAL_STUDENT_STORAGE_STATE,
    },
  ];
}

/** Pixel diff ratio above this marks a visual failure (1% default). */
export const diffThresholdRatio =
  Number(process.env.VISUAL_DIFF_THRESHOLD ?? "0.01");

export const viewports = [
  { id: "1920", width: 1920, height: 1080 },
  { id: "1366", width: 1366, height: 768 },
] as const;
