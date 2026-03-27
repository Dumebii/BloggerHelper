import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ozigi — Turn Raw Notes, PDFs & URLs Into Social Posts | AI Content Engine",
  description: "Drop in raw notes, a PDF, or a URL. Ozigi generates platform-ready posts for X, LinkedIn, and Discord in your voice — without sounding like AI wrote them. Free to try.",
  keywords: [
    "AI content generator",
    "social media posts from notes",
    "AI content generator from PDF",
    "generate LinkedIn posts from URL",
    "AI writing tool for developers",
    "content engine for technical creators",
    "AI social media post generator",
    "turn notes into social media posts",
  ],
  openGraph: {
    title: "Ozigi — AI Content Engine for Technical Creators",
    description: "Drop in raw notes, a PDF, or a URL. Get platform-ready posts for X, LinkedIn, and Discord in your voice — not AI's.",
    url: "https://ozigi.app",
    siteName: "Ozigi",
    type: "website",
    images: [
      {
        url: "https://ozigi.app/opengraph-image.png", // Ensure this matches your actual deployed URL
        width: 1200,
        height: 630,
        alt: "Ozigi — Turn raw notes into social posts without sounding like AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ozigi — AI Content Engine for Technical Creators",
    description: "Drop in raw notes, a PDF, or a URL. Get platform-ready posts for X, LinkedIn, and Discord in your voice — not AI's.",
    images: ["https://ozigi.app/opengraph-image.png"],
    creator: "@DumebiTheWriter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://ozigi.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
            <head>
        {/* Favicon links */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="bottom-right" />
        {children}
      </body>
    </html>
  );
}
