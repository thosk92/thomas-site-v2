import "./globals.css";
import type { Metadata } from "next";
import BackgroundGradient from "@/components/BackgroundGradient";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Thomas Zanelli — Personal Site",
  description: "Minimal, motion-friendly portfolio by Thomas Zanelli.",
  themeColor: "#ffffff",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Thomas Zanelli — Personal Site",
    description: "Minimal, motion-friendly portfolio by Thomas Zanelli.",
    siteName: "Thomas Zanelli",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thomas Zanelli — Personal Site",
    description: "Minimal, motion-friendly portfolio by Thomas Zanelli.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BackgroundGradient />
        <div className="relative z-10">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
