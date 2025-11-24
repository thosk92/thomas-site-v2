import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { UnifrakturCook, Great_Vibes } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
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
  title: "EMMA — Clear your mind, one thought at a time",
  description: "A minimal, calming space to declutter your mind, track mood and gently reframe thoughts.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F6F6",
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
        <link rel="icon" href="/icon.svg" />
      </head>
      <body
        className={`${grotesk.variable} ${robotoMono.variable} ${gothic.variable} ${script.variable} antialiased bg-[#F6F6F6] text-[#575757] overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
