"use client";

import { useEffect } from "react";

// Unregister any stale service worker (from previous PWA setup) to avoid cached routing.
export default function ServiceWorkerReset() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {});
        });
      })
      .catch(() => {});

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => {
          keys.forEach((key) => {
            if (key.startsWith("workbox") || key.startsWith("next-pwa")) {
              caches.delete(key).catch(() => {});
            }
          });
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
