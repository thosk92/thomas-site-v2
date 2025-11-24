"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitch from "@/components/LanguageSwitch";
import MotionToggle from "@/components/MotionToggle";
import WordmarkExpressive from "@/components/WordmarkExpressive";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEmmaAppArea = pathname.startsWith("/mindclean");

  if (isEmmaAppArea) {
    // App area: no portfolio navbar/footer, just render the page content
    return <div className="relative z-10 min-h-screen">{children}</div>;
  }

  const year = new Date().getFullYear();

  return (
    <>
      <header
        className="sticky top-0 z-20 backdrop-blur border-b"
        style={{ borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between gap-3">
            <Link href="/" className="wm hover:opacity-90 transition" aria-label="Home">
              <WordmarkExpressive />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary">
              <a
                href="#about"
                className="hover:opacity-80 transition"
                style={{ color: "color-mix(in oklab,var(--foreground) 75%, transparent)" }}
              >
                About
              </a>
              <a
                href="#process"
                className="hover:opacity-80 transition"
                style={{ color: "color-mix(in oklab,var(--foreground) 75%, transparent)" }}
              >
                Process
              </a>
              <a
                href="#contact"
                className="hover:opacity-80 transition"
                style={{ color: "color-mix(in oklab,var(--foreground) 75%, transparent)" }}
              >
                Contact
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <Suspense fallback={null}>
                <LanguageSwitch />
              </Suspense>
              <MotionToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 min-h-screen">{children}</div>

      <footer
        className="border-t mt-12"
        style={{ borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}
      >
        <div
          className="max-w-5xl mx-auto px-4 py-6 text-center text-xs"
          style={{ color: "color-mix(in oklab,var(--foreground) 70%, transparent)" }}
        >
          {year} Thomas Zanelli · Built with Next.js and deployed on Vercel
        </div>
      </footer>
    </>
  );
}
