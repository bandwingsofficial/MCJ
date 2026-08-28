import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 / Turbopack does not always register a nested static segment
 * under a dynamic folder (`/branches/[branchId]/manage` 404s even when
 * `manage/page.tsx` exists). The parent `/branches/[branchId]` route does
 * resolve. Rewrite the public Super Admin URL onto that page so
 * `/branches/:branchId/manage` keeps working without changing the URL.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/branches\/([^/]+)\/manage\/?$/);

  if (!match) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/branches/${match[1]}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/branches/:branchId/manage"],
};
