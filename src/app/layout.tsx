import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Suspense } from "react";
import BackgroundMount from "@/components/BackgroundMount";
import PointerTracker from "@/components/PointerTracker";
import LanguageSwitch from "@/components/LanguageSwitch";

const grotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

// Geist Mono provided via 'geist/font/mono'

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
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body className={`${grotesk.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <BackgroundMount />
        </Suspense>
        <PointerTracker />
        <div className="fixed top-4 right-4 z-20">
          <Suspense fallback={null}>
            <LanguageSwitch />
          </Suspense>
        </div>
        <div className="relative z-10 min-h-screen">{children}</div>
        <footer className="border-t border-foreground/10 mt-12">
          <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-foreground/70">
            P. IVA: 01492490451 · Sito prodotto da Thomas Zanelli · Tutti i diritti sono riservati
          </div>
        </footer>
      </body>
    </html>
  );
}
