import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { UnifrakturCook, Great_Vibes } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
// Aurora background is now CSS-based in globals.css
import PointerTracker from "@/components/PointerTracker";
import LanguageSwitch from "@/components/LanguageSwitch";
import TimeTheme from "@/components/TimeTheme";
import GeoPrefetch from "@/components/GeoPrefetch";
import ScrollReveal from "@/components/ScrollReveal";
import LightThreadsSwitcher from "@/components/backgrounds/LightThreadsSwitcher";
import MotionToggle from "@/components/MotionToggle";
import WordmarkExpressive from "@/components/WordmarkExpressive";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";

const grotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const gothic = UnifrakturCook({
  variable: "--font-gothic",
  subsets: ["latin"],
  weight: ["700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thomaszanelli.co"),
  title: "Thomas Zanelli — Designer & Frontend",
  description: "Minimal, motion-friendly portfolio by Thomas Zanelli.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://thomaszanelli.co/",
    title: "Thomas Zanelli — Designer & Frontend",
    description: "Minimal, motion-friendly portfolio by Thomas Zanelli.",
    siteName: "Thomas Zanelli",
    images: [{ url: "/icon.svg", width: 1200, height: 630, alt: "Thomas Zanelli" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thomas Zanelli — Designer & Frontend",
    description: "Minimal, motion-friendly portfolio by Thomas Zanelli.",
    images: ["/icon.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="supported-color-schemes" content="light dark" />
      </head>
      <body className={`${grotesk.variable} ${robotoMono.variable} ${gothic.variable} ${script.variable} antialiased`}>
        <GeoPrefetch />
        <TimeTheme />
        <LightThreadsSwitcher />
        <ScrollReveal />
        <PointerTracker />
        <header className="sticky top-0 z-20 backdrop-blur border-b" style={{ borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="h-14 flex items-center justify-between gap-3">
              <Link href="/" className="hover:opacity-90 transition" aria-label="Home">
                <WordmarkExpressive />
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary">
                <a href="#about" className="hover:opacity-80 transition" style={{ color: "color-mix(in oklab,var(--foreground) 75%, transparent)" }}>About</a>
                <a href="#process" className="hover:opacity-80 transition" style={{ color: "color-mix(in oklab,var(--foreground) 75%, transparent)" }}>Process</a>
                <a href="#contact" className="hover:opacity-80 transition" style={{ color: "color-mix(in oklab,var(--foreground) 75%, transparent)" }}>Contact</a>
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
        <SpeedInsights />
        <Analytics />
        <footer className="border-t mt-12" style={{ borderColor: "color-mix(in oklab,var(--foreground) 10%, transparent)" }}>
          <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs" style={{ color: "color-mix(in oklab,var(--foreground) 70%, transparent)" }}>
            {new Date().getFullYear()} Thomas Zanelli · Built with Next.js and deployed on Vercel
          </div>
        </footer>
      </body>
    </html>
  );
}
