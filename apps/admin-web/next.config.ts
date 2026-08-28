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
          source: "/branches/:branchId/manage",
          destination: "/branches/:branchId",
        },
      ],
    };
  },
};

export default nextConfig;