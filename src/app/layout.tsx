import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nebula from "@/components/Nebula";
import PointerTracker from "@/components/PointerTracker";
import LanguageSwitch from "@/components/LanguageSwitch";

const grotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body className={`${grotesk.variable} ${geistMono.variable} antialiased`}>
        <Nebula />
        <PointerTracker />
        <div className="fixed top-4 right-4 z-20"><LanguageSwitch /></div>
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
