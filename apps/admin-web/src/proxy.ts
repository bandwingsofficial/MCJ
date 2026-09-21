import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Mirror next.config rewrites for nested `.../manage` URLs.
 * Turbopack does not always register deep filesystem routes under dynamic
 * segments after a fresh dev server start; these rewrites target stable
 * parent pages that render the same UI.
 */
const MANAGE_REWRITES: Array<{
  pattern: RegExp;
  toPath: (match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /^\/branches\/([^/]+)\/manage\/?$/,
    toPath: (m) => `/branches/${m[1]}`,
  },
  {
    pattern: /^\/batches\/([^/]+)\/manage\/?$/,
    toPath: (m) => `/batches/${m[1]}`,
  },
  {
    pattern: /^\/batches\/([^/]+)\/timings\/([^/]+)\/manage\/?$/,
    toPath: (m) => `/batches/${m[1]}/timings/${m[2]}`,
  },
  {
    pattern: /^\/batches\/([^/]+)\/modes\/([^/]+)\/manage\/?$/,
    toPath: (m) => `/batches/${m[1]}/modes/${m[2]}`,
  },
  {
    pattern: /^\/students\/([^/]+)\/manage(?:\/enrollments)?\/?$/,
    toPath: (m) => `/students/${m[1]}`,
  },
  {
    pattern: /^\/enrollments\/([^/]+)\/manage\/?$/,
    toPath: (m) => `/enrollments/${m[1]}`,
  },
  {
    pattern: /^\/community\/([^/]+)\/manage\/?$/,
    toPath: (m) => `/community/${m[1]}`,
  },
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const rule of MANAGE_REWRITES) {
    const match = pathname.match(rule.pattern);
    if (!match) {
      continue;
    }

    const url = request.nextUrl.clone();
    url.pathname = rule.toPath(match);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/branches/:branchId/manage",
    "/batches/:id/manage",
    "/batches/:id/timings/:timingId/manage",
    "/batches/:id/modes/:mode/manage",
    "/students/:id/manage",
    "/students/:id/manage/enrollments",
    "/enrollments/:id/manage",
    "/community/:Id/manage",
  ],
};
