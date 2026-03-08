import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ozigi | Agentic Social Media Manager",
  description:
    "An Agentic Content Engine for social media handlers, technical writers and developer educators.",
  openGraph: {
    title: "Ozigi | Agentic Social Media Manager",
    description:
      "Build a 3-day social media distribution campaign from raw context, in your own voice.",
    siteName: "Ozigi",
    images: [
      {
        url: "/opengraph-image.png", // Points to public/landing-preview.png
        width: 1200,
        height: 630,
        alt: "Ozigi.app Landing Page Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ozigi - Your Catchy Slogan",
    description: "A brief description of what Ozigi.app does.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
