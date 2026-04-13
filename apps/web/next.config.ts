import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@condocontrol/shared-types"],
  // Disable ESLint during build (run separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build (handle via CI)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
