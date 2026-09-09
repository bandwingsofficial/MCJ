import type { NextConfig } from "next";

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
      beforeFiles: [
        {
          source: "/batches/:batchId/timings/:timingId/manage",
          destination: "/batches/:batchId/timings/:timingId",
        },
      ],
    };
  },
};

export default nextConfig;
