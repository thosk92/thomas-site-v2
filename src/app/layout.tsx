import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { UnifrakturCook, Great_Vibes } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

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
  title: "EMMA – Emotional Mindful Messaging Assistant",
  description: "A minimal, calming space to declutter your mind, track mood and gently reframe thoughts.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "EMMA – Emotional Mindful Messaging Assistant",
    description: "A minimal, calming space to declutter your mind, track mood and gently reframe thoughts.",
    images: [
      {
        url: "/emma-og.png",
        width: 1200,
        height: 630,
        alt: "EMMA – Emotional Mindful Messaging Assistant",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#5d4dfc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta name="supported-color-schemes" content="light dark" />
        <link rel="icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5d4dfc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${grotesk.variable} ${robotoMono.variable} ${gothic.variable} ${script.variable} antialiased bg-[#1D2150] text-[#F8FAFC] overflow-x-hidden`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
