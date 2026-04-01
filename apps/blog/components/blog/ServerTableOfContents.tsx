interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function ServerTableOfContents({ headings }: { headings: Heading[] }) {
  if (!headings || headings.length === 0) return null;

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="text-sm font-bold uppercase text-slate-400 mb-3">
        On this page
      </div>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: (heading.level - 1) * 12 }}>
            <a href={`#${heading.id}`} className="text-slate-500 hover:text-brand-red">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}