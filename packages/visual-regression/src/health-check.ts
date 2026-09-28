import type { AppConfig } from "./config.js";

const healthPathsByApp: Partial<Record<AppConfig["id"], string[]>> = {
  "admin-web": ["/login", "/"],
  "branch-web": ["/login", "/"],
  "customer-web": ["/", "/courses"],
  "student-web": ["/student/learning", "/"],
};

export async function checkAppHealth(app: AppConfig): Promise<boolean> {
  const paths = healthPathsByApp[app.id] ?? ["/"];

  for (const routePath of paths) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(new URL(routePath, app.baseUrl), {
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);
      if (res.status > 0 && res.status < 500) {
        return true;
      }
    } catch {
      /* try next path */
    }
  }

  return false;
}

export async function filterReachableApps(
  apps: AppConfig[],
): Promise<{ reachable: AppConfig[]; unreachable: AppConfig[] }> {
  const results = await Promise.all(
    apps.map(async (app) => ({ app, ok: await checkAppHealth(app) })),
  );
  return {
    reachable: results.filter((r) => r.ok).map((r) => r.app),
    unreachable: results.filter((r) => !r.ok).map((r) => r.app),
  };
}

export async function assertAppsReachable(apps: AppConfig[]): Promise<void> {
  const { reachable, unreachable } = await filterReachableApps(apps);
  if (unreachable.length > 0) {
    console.warn(
      "Skipping unreachable apps (start dev servers and re-run to include them):",
    );
    for (const app of unreachable) {
      console.warn(`  - ${app.id}: ${app.baseUrl}`);
    }
  }
  if (reachable.length === 0) {
    throw new Error(
      "No dev servers reachable. Start apps and set VISUAL_*_URL if needed (see .visual-regression/.env.example).",
    );
  }
}
