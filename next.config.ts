import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAUTA_BASE_PATH || "",
  trailingSlash: true,
  allowedDevOrigins: ["localhost", "127.0.0.1", "*.agent.cvm.dev"],
  devIndicators: false,
};

export default nextConfig;
