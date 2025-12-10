import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Temporarily disable PWA to avoid stale service worker caching routing to /emma.
// Re-enable once we add a custom runtimeCaching strategy.
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" ? true : true,
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
