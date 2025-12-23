import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "framer-motion", "recharts"],
  },
};

export default nextConfig;
