import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rewrites public /manage URLs onto canonical dynamic route pages so nested
 * manage segments stay reachable under Next.js 16 / Turbopack.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const batchTimingManageMatch = pathname.match(
    /^\/batches\/([^/]+)\/timings\/([^/]+)\/manage\/?$/,
  );
  if (batchTimingManageMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/batches/${batchTimingManageMatch[1]}/timings/${batchTimingManageMatch[2]}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/batches/:batchId/timings/:timingId/manage"],
};
