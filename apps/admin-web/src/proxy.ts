import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 / Turbopack does not always register nested routes under a
 * dynamic folder (for example `/branches/[branchId]/manage`,
 * `/batches/[id]/timings/[timingId]/manage`, and course module management
 * URLs under `/courses/[id]/manage/modules/...`). Rewrite those public URLs
 * onto route pages Turbopack reliably registers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const branchManageMatch = pathname.match(/^\/branches\/([^/]+)\/manage\/?$/);
  if (branchManageMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/branches/${branchManageMatch[1]}`;
    return NextResponse.rewrite(url);
  }

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
  matcher: [
    "/branches/:branchId/manage",
    "/batches/:id/timings/:timingId/manage",
  ],
};
