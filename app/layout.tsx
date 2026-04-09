import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ozigi — Automated Content Generator for Creators",
  description: "Automate social media content generation without sounding like an AI bot. Drop in raw notes, a PDF, or a URL. Ozigi generates content for X, LinkedIn, Slack and Discord in your voice. Free to try.",
  keywords: [
    "AI content that doesn't sound like AI",
    "Best Social Marketing Tool",
    "Using AI in marketing",
    "AI content generator",
    "social media posts from notes",
    "AI content generator from PDF",
    "Best AI Content Generator for Creators",
    "Direct posting generator for X and LinkedIn",
    "generate LinkedIn posts from URL",
    "AI writing tool for developers",
    "content engine for technical creators",
    "AI social media post generator",
    "Content automation",
    "Good content, no AI voice",
    "turn notes into social media posts",
  ],
  openGraph: {
    title: "Ozigi — Automated Content Generator for Technical Creators",
    description: "Drop in raw notes, a PDF, or a URL. Get generated content or posts for X, LinkedIn, Slack and Discord in your voice — not AI's.",
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
    title: "Ozigi — Automated Content Generator for Technical Creators",
    description: "Drop in raw notes, a PDF, or a URL. Get content or posts for X, LinkedIn, Slack and Discord in your voice — not AI's.",
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
        <meta property="og:image" content="https://ozigi.app/opengraph-image.png" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Toaster position="bottom-right" />
          {children}
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
