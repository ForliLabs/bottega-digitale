import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  turbopack: {
    root: path.join(process.cwd(), ".."),
  },
};

export default nextConfig;
