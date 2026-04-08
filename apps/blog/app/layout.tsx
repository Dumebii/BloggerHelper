import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Ozigi Blog - Insights, tutorials, and architecture for technical creators",
  description: "Technical insights, tutorials, and architecture decisions from the Ozigi team. Engineering, marketing, content strategy, and product updates.",
  keywords: [
    "AI content generation",
    "technical writing",
    "content automation",
    "developer blog",
    "Next.js",
    "architecture",
    "software engineering",
    "DevRel",
  ],
  metadataBase: new URL("https://blog.ozigi.app"),
  canonical: "https://blog.ozigi.app",
  openGraph: {
    title: "Ozigi Blog",
    description: "Technical insights, tutorials, and architecture decisions from the Ozigi team.",
    url: "https://blog.ozigi.app",
    siteName: "Ozigi Blog",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Ozigi Blog",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ozigi Blog",
    description: "Technical insights, tutorials, and architecture decisions from the Ozigi team.",
    images: ["/images/og-default.png"],
    creator: "@ozigi_app",
    site: "@ozigi_app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    types: {
      "application/rss+xml": [
        {
          url: "https://blog.ozigi.app/feed.xml",
          title: "Ozigi Blog RSS Feed",
        },
      ],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" href="https://blog.ozigi.app/feed.xml" title="Ozigi Blog RSS Feed" />
        <link rel="alternate" type="application/atom+xml" href="https://blog.ozigi.app/feed.xml" title="Ozigi Blog Atom Feed" />
      </head>
      <body className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
