import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({ dest: "public" });

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
