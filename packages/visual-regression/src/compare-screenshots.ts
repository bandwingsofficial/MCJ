import fs from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

import {
  actualDir,
  baselineDir,
  diffDir,
  diffThresholdRatio,
  resultsJsonPath,
  viewports,
} from "./config.js";
import { routeKey, visualRoutes } from "./routes.manifest.js";

export interface VisualCompareResult {
  app: string;
  path: string;
  viewport: string;
  status: "pass" | "fail" | "missing-baseline" | "missing-actual" | "size-mismatch";
  diffPixels: number;
  totalPixels: number;
  diffRatio: number;
  baselinePath?: string;
  actualPath?: string;
  diffPath?: string;
}

function readPng(filePath: string): PNG {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function writeDiff(png: PNG, filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, PNG.sync.write(png));
}

function getSkippedApps(): Set<string> {
  return new Set(
    (process.env.VISUAL_SKIP_APPS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/** When set (e.g. by run-audit), only compare these apps — avoids false failures on partial runs. */
function getCompareApps(): Set<string> | null {
  const raw = (process.env.VISUAL_COMPARE_APPS ?? "").trim();
  if (!raw) {
    return null;
  }
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function compareAll(): VisualCompareResult[] {
  const results: VisualCompareResult[] = [];
  const skipApps = getSkippedApps();
  const compareApps = getCompareApps();

  for (const route of visualRoutes) {
    if (compareApps && !compareApps.has(route.app)) {
      continue;
    }
    if (skipApps.has(route.app)) {
      continue;
    }
    for (const vp of viewports) {
      const key = routeKey(route.app, route.path, vp.id);
      const baselinePath = path.join(baselineDir, `${key}.png`);
      const actualPath = path.join(actualDir, `${key}.png`);
      const diffPath = path.join(diffDir, `${key}.png`);

      const base: VisualCompareResult = {
        app: route.app,
        path: route.path,
        viewport: vp.id,
        status: "pass",
        diffPixels: 0,
        totalPixels: 0,
        diffRatio: 0,
        baselinePath,
        actualPath,
        diffPath,
      };

      if (!fs.existsSync(baselinePath)) {
        results.push({ ...base, status: "missing-baseline" });
        continue;
      }
      if (!fs.existsSync(actualPath)) {
        results.push({ ...base, status: "missing-actual" });
        continue;
      }

      const img1 = readPng(baselinePath);
      const img2 = readPng(actualPath);

      if (img1.width !== img2.width || img1.height !== img2.height) {
        results.push({
          ...base,
          status: "size-mismatch",
          totalPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
        });
        continue;
      }

      const { width, height } = img1;
      const diff = new PNG({ width, height });
      const diffPixels = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        width,
        height,
        { threshold: 0.1, includeAA: false },
      );

      const totalPixels = width * height;
      const diffRatio = totalPixels === 0 ? 0 : diffPixels / totalPixels;

      if (diffPixels > 0) {
        writeDiff(diff, diffPath);
      }

      results.push({
        ...base,
        status: diffRatio > diffThresholdRatio ? "fail" : "pass",
        diffPixels,
        totalPixels,
        diffRatio,
      });
    }
  }

  fs.mkdirSync(path.dirname(resultsJsonPath), { recursive: true });
  fs.writeFileSync(resultsJsonPath, JSON.stringify(results, null, 2));
  return results;
}

const executed = path.resolve(process.argv[1] ?? "");
if (executed.endsWith(`${path.sep}compare-screenshots.ts`)) {
  const results = compareAll();
  const failed = results.filter((r) => r.status !== "pass");
  console.log(`Compared ${results.length} captures; ${failed.length} non-pass.`);
  process.exit(failed.length > 0 ? 1 : 0);
}
