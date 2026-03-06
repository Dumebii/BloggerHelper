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
  title: 'Ozigi | The Agentic Content Engine',
  description: 'Turn your ideas and message into structured, multi-platform social media campaigns without the cheesy AI buzzwords.',
  metadataBase: new URL('https://ozigi.app'),
  openGraph: {
    title: 'Ozigi | The Agentic Content Engine',
    description: 'Turn your raw technical research into structured, multi-platform social media campaigns.',
    url: 'https://ozigi.app',
    siteName: 'Ozigi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ozigi | The Agentic Content Engine',
    description: 'Docs as code? Meet content as code.',
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
