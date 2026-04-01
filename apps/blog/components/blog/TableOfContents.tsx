"use client";
import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const lines = content.split("\n");
    const extracted: Heading[] = [];

    lines.forEach((line) => {
      // Allow optional space after the hashes (some markdown may omit it)
      const match = line.match(/^(#{1,6})\s*(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        extracted.push({ id, text, level });
      }
    });

    setHeadings(extracted);
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="text-sm font-bold uppercase text-slate-400 mb-3">
        On this page
      </div>

      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: (heading.level - 1) * 12 }}
          >
            <a
              href={`#${heading.id}`}
              className="text-slate-500 hover:text-brand-red"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}