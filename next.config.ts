import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Disabilitiamo il PWA per evitare service worker cache inconsistente.
const isPWAEnabled = false;
const withPWA = withPWAInit({ dest: "public" });

const nextConfig: NextConfig = {
  /* config options here */
};

export default isPWAEnabled ? withPWA(nextConfig) : nextConfig;
