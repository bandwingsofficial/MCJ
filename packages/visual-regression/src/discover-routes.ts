/**
 * Scans Next.js `app/**/page.tsx` files and prints route patterns (audit helper).
 * Does not replace `routes.manifest.ts` — dynamic segments need manual/stable slugs.
 */
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./config.js";

const apps = ["admin-web", "branch-web", "customer-web", "student-web"] as const;

function walkPages(appDir: string, rel = ""): string[] {
  const abs = path.join(appDir, rel);
  if (!fs.existsSync(abs)) {
    return [];
  }
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  const routes: string[] = [];
  for (const entry of entries) {
    const nextRel = path.join(rel, entry.name);
    if (entry.isDirectory()) {
      routes.push(...walkPages(appDir, nextRel));
      continue;
    }
    if (entry.name === "page.tsx") {
      routes.push(toRoutePath(rel));
    }
  }
  return routes;
}

function toRoutePath(relDir: string): string {
  const segments = relDir.split(path.sep).filter(Boolean);
  const urlParts = segments
    .filter((s) => !s.startsWith("(") || !s.endsWith(")"))
    .map((s) => {
      if (s.startsWith("(") && s.endsWith(")")) {
        return null;
      }
      if (s.startsWith("[") && s.endsWith("]")) {
        return `:${s.slice(1, -1)}`;
      }
      return s;
    })
    .filter(Boolean) as string[];
  return `/${urlParts.join("/")}`.replace(/\/+/g, "/") || "/";
}

for (const app of apps) {
  const appPages = path.join(repoRoot, "apps", app, "src", "app");
  const discovered = walkPages(appPages).sort();
  console.log(`\n# ${app} (${discovered.length} page files)`);
  for (const r of discovered) {
    console.log(r);
  }
}

console.log(
  "\nNote: Add stable slugs for dynamic routes to src/routes.manifest.ts (see .route-audit).",
);
