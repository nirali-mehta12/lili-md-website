import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a minimal, self-contained server bundle (.next/standalone/server.js)
  // for the Docker / Cloud Run image. See Dockerfile.
  output: "standalone",
  // Make sure sharp (used by next/image optimization at runtime) is traced
  // into the standalone output so image optimization works in the container.
  outputFileTracingIncludes: {
    "/*": ["node_modules/sharp/**/*"],
  },
};

export default nextConfig;
