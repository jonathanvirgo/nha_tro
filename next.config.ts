import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',  // Bắt buộc cho static export
  distDir: 'out',
};

export default nextConfig;
