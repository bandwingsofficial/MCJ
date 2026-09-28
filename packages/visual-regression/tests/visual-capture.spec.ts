import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";

import {
  actualDir,
  baselineDir,
  getAppConfigs,
  viewports,
} from "../src/config.js";
import { routeKey, visualRoutes } from "../src/routes.manifest.js";

const phase = process.env.VISUAL_PHASE as "baseline" | "compare" | undefined;

function viewportIdFromProject(projectName: string): string {
  if (projectName.includes("1920")) {
    return "1920";
  }
  if (projectName.includes("1366")) {
    return "1366";
  }
  throw new Error(`Unknown viewport in project ${projectName}`);
}

function isBaselineProject(projectName: string): boolean {
  return projectName.startsWith("baseline-chrome");
}

function outputDirForProject(projectName: string): string {
  return isBaselineProject(projectName) ? baselineDir : actualDir;
}

const skipApps = new Set(
  (process.env.VISUAL_SKIP_APPS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const appConfigById = Object.fromEntries(
  getAppConfigs().map((c) => [c.id, c]),
);

for (const route of visualRoutes) {
  if (skipApps.has(route.app)) {
    continue;
  }
  test(`${route.app} ${route.path}`, async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    const viewportId = viewportIdFromProject(projectName);
    const vp = viewports.find((item) => item.id === viewportId);
    if (!vp) {
      test.skip();
    }

    if (phase === "baseline" && !isBaselineProject(projectName)) {
      test.skip();
    }
    if (phase === "compare" && isBaselineProject(projectName)) {
      test.skip();
    }

    const app = appConfigById[route.app];
    if (!app) {
      throw new Error(`Missing app config for ${route.app}`);
    }

    const storageStatePath = app.storageStatePath;
    if (storageStatePath && fs.existsSync(storageStatePath)) {
      const state = JSON.parse(fs.readFileSync(storageStatePath, "utf8")) as {
        cookies?: Array<{
          name: string;
          value: string;
          domain: string;
          path: string;
          expires?: number;
          httpOnly?: boolean;
          secure?: boolean;
          sameSite?: "Strict" | "Lax" | "None";
        }>;
      };
      if (state.cookies?.length) {
        await page.context().addCookies(state.cookies);
      }
    }

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
            caret-color: transparent !important;
          }
        `;
      document.documentElement.appendChild(style);
    });

    const url = new URL(route.path, app.baseUrl).toString();
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {
      /* Allow capture when background polling prevents idle. */
    });

    await page.evaluate(async () => {
      if ("fonts" in document) {
        await document.fonts.ready;
      }
    });

    await page.waitForTimeout(800);

    const key = routeKey(route.app, route.path, viewportId);
    const dir = outputDirForProject(projectName);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${key}.png`);

    await page.screenshot({
      path: filePath,
      fullPage: true,
      animations: "disabled",
    });

    test.info().attach("screenshot", {
      path: filePath,
      contentType: "image/png",
    });

    test.info().annotations.push({
      type: "httpStatus",
      description: String(response?.status() ?? "unknown"),
    });
    test.info().annotations.push({
      type: "url",
      description: url,
    });
  });
}
