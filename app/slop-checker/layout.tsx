import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Free AI Slop Checker — Does Your Writing Sound Like ChatGPT? | Ozigi" },
  description:
    "Paste any email, post, or draft. Get a human score, see exactly which words and sentence patterns read as AI-generated, and fix them in one click. Free, no signup, runs in your browser.",
  keywords: [
    "ai slop checker",
    "does my writing sound like ai",
    "ai writing detector",
    "chatgpt detector",
    "ai buzzword checker",
    "human score writing",
  ],
  openGraph: {
    title: "Free AI Slop Checker | Ozigi",
    description:
      "Paste anything you wrote — or anything a tool wrote for you. Get a human score and see exactly which words and sentence patterns are giving it away. Free, no signup.",
    type: "website",
    url: "https://ozigi.app/slop-checker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Slop Checker | Ozigi",
    description:
      "Paste anything you wrote — or anything a tool wrote for you. Get a human score and see exactly which words and sentence patterns are giving it away.",
  },
  alternates: {
    canonical: "https://ozigi.app/slop-checker",
  },
};

export default function SlopCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
