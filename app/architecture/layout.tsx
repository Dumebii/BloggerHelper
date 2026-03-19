import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ozigi Architecture — AI Constraint Engine Design Decisions",
  description: "Open architecture decision records explaining how Ozigi processes context, enforces the Banned Lexicon, and generates authentic social content without AI-speak.",
  alternates: { canonical: "https://ozigi.app/architecture" },
};

export default function ArchitectureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}