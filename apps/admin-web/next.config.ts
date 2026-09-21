import type { NextConfig } from "next";

/**
 * Nested App Router pages under dynamic segments are intermittently missing
 * from Turbopack's route manifest after a fresh `next dev` start. Public
 * `.../manage` URLs are therefore rewritten onto a stable parent page that
 * renders the same UI. Course deep links use shallow catch-alls instead
 * (see `courses/[id]/manage/[...segments]` and `modules/[...segments]`).
 *
 * Do not reintroduce competing filesystem routes for these rewritten paths.
 */
const manageRewrites = [
  {
    source: "/branches/:branchId/manage",
    destination: "/branches/:branchId",
  },
  {
    source: "/batches/:id/manage",
    destination: "/batches/:id",
  },
  {
    source: "/batches/:id/timings/:timingId/manage",
    destination: "/batches/:id/timings/:timingId",
  },
  {
    source: "/batches/:id/modes/:mode/manage",
    destination: "/batches/:id/modes/:mode",
  },
  {
    source: "/students/:id/manage",
    destination: "/students/:id",
  },
  {
    source: "/students/:id/manage/enrollments",
    destination: "/students/:id",
  },
  {
    source: "/enrollments/:id/manage",
    destination: "/enrollments/:id",
  },
  {
    source: "/community/:Id/manage",
    destination: "/community/:Id",
  },
] as const;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mcj-assets.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [...manageRewrites],
    };
  },
};

export default nextConfig;
