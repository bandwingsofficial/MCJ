import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 / Turbopack does not always register a nested static segment
 * under a dynamic folder (`/branches/[branchId]/manage` and
 * `/batches/[id]/timings/[timingId]/manage` 404 even when `manage/page.tsx`
 * exists). Rewrite those public URLs onto the parent dynamic route pages.
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
