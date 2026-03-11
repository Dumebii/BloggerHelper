import fs from "fs";
import path from "path";
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import Footer from "../../../components/Footer";

// --- THE SEQUENCE ARRAY ---
const DEEP_DIVE_ORDER = [
  { slug: "multimodal-pipeline", title: "1. Multimodal Ingestion" },
  { slug: "the-banned-lexicon", title: "2. The Banned Lexicon" },
  { slug: "system-personas", title: "3. System Personas" },
  { slug: "human-in-the-loop", title: "4. Human-in-the-Loop" }
];

const toSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

const extractText = (children: React.ReactNode): string => {
  let text = "";
  React.Children.forEach(children, (child) => {
    if (typeof child === "string") text += child;
    else if (React.isValidElement(child) && (child.props as any).children) {
      text += extractText((child.props as any).children);
    }
  });
  return text;
};

// Custom Ozigi Styling for MDX
const mdxComponents = {
  h1: ({ node, children, ...props }: any) => <h1 id={toSlug(extractText(children))} className="scroll-mt-28 text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6 text-slate-900" {...props}>{children}</h1>,
  h2: ({ node, children, ...props }: any) => <h2 id={toSlug(extractText(children))} className="scroll-mt-28 text-2xl font-black italic uppercase tracking-tighter text-slate-900 border-b-2 border-slate-100 pb-2 mb-4 mt-12" {...props}>{children}</h2>,
  h3: ({ node, children, ...props }: any) => <h3 id={toSlug(extractText(children))} className="scroll-mt-28 text-xl font-black text-slate-900 mt-8 mb-4" {...props}>{children}</h3>,
  h4: ({ node, children, ...props }: any) => <h4 id={toSlug(extractText(children))} className="scroll-mt-28 text-lg font-bold text-slate-800 mt-6 mb-3" {...props}>{children}</h4>,
  h5: ({ node, children, ...props }: any) => <h5 id={toSlug(extractText(children))} className="scroll-mt-28 text-base font-bold text-slate-800 mt-4 mb-2" {...props}>{children}</h5>,
  h6: ({ node, children, ...props }: any) => <h6 id={toSlug(extractText(children))} className="scroll-mt-28 text-sm font-bold uppercase tracking-widest text-slate-500 mt-4 mb-2" {...props}>{children}</h6>,
  p: ({ node, ...props }: any) => <p className="mb-6 text-slate-700 font-medium leading-relaxed" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-black text-slate-900" {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-2xl text-indigo-900 italic font-medium my-8" {...props} />,
  pre: ({ node, ...props }: any) => (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl my-8 border border-slate-800">
      <div className="bg-slate-800/50 px-4 py-3 flex items-center border-b border-slate-700/50 gap-2">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80"></div><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div><div className="w-3 h-3 rounded-full bg-green-500/80"></div></div>
        <span className="text-xs font-mono text-slate-400 ml-2">Code Snippet</span>
      </div>
      <pre className="p-6 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed" {...props} />
    </div>
  ),
  code: ({ node, className, ...props }: any) => {
    if (!className) return <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props} />;
    return <code className={className} {...props} />;
  },
};

function getDocContent(slug: string) {
  const fullPath = path.join(process.cwd(), "content/docs", `${slug}.mdx`);
  try { return fs.readFileSync(fullPath, "utf8"); } 
  catch (err) { return null; }
}

export default async function DocArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;
  const content = getDocContent(currentSlug);

  if (!content) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
      <Link href="/docs/deep-dives" className="mb-4 text-indigo-600 font-bold hover:underline">← Back to Hub</Link>
      <h1 className="text-2xl font-black italic text-slate-900">404 - Document not found</h1>
    </div>
  );

  const title = (content.match(/title:\s*"(.*)"/) || [])[1] || "Documentation";
  const tag = (content.match(/tag:\s*"(.*)"/) || [])[1] || "Guide";
  const readTime = (content.match(/readTime:\s*"(.*)"/) || [])[1] || "3 min read";
  const bodyContent = content.replace(/---[\s\S]*?---/, "");

  // TOC Extraction
  const toc: { title: string; slug: string; level: number }[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(bodyContent)) !== null) {
    const level = match[1].length;
    const rawTitle = match[2].replace(/[*`]/g, "").trim(); 
    toc.push({ title: rawTitle, slug: toSlug(rawTitle), level });
  }

  // Next Article Logic
  const currentIndex = DEEP_DIVE_ORDER.findIndex(d => d.slug === currentSlug);
  const nextArticle = currentIndex >= 0 && currentIndex < DEEP_DIVE_ORDER.length - 1 
    ? DEEP_DIVE_ORDER[currentIndex + 1] 
    : null;

  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col scroll-smooth">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 md:px-8">
          <Link href="/docs/deep-dives" className="flex items-center gap-2 group text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <span>←</span> Back to Deep Dives
          </Link>
          <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
            Go to Dashboard →
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 flex flex-col lg:flex-row gap-12 relative">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Article Contents</h3>
            <nav>
              <ul className="space-y-3 text-sm font-medium border-l-2 border-slate-200">
                {toc.map((item, index) => {
                  const padding = item.level <= 2 ? 'pl-4' : item.level === 3 ? 'pl-8' : item.level === 4 ? 'pl-12' : 'pl-16';
                  const fontSize = item.level <= 2 ? 'text-slate-700 font-bold' : 'text-slate-500';
                  return (
                    <li key={index} className={`${padding}`}>
                      <a href={`#${item.slug}`} className={`${fontSize} hover:text-indigo-600 transition-colors block`}>{item.title}</a>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </aside>

        <main className="flex-1 max-w-3xl overflow-hidden">
          <div className="mb-12 border-b-2 border-slate-100 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">{tag}</span>
              <span className="text-slate-400 text-sm font-medium">{readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900">{title}</h1>
          </div>

          <article className="text-slate-700 font-medium leading-relaxed max-w-none">
            <ReactMarkdown components={mdxComponents}>{bodyContent}</ReactMarkdown>
          </article>

          {/* NEXT ARTICLE BUTTON INJECTED HERE */}
          {nextArticle && (
            <div className="mt-16 pt-10 border-t-2 border-slate-100 flex justify-end">
              <Link 
                href={`/docs/${nextArticle.slug}`} 
                className="group flex flex-col items-end text-right bg-white hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-200 p-6 rounded-[2rem] shadow-sm hover:shadow-lg transition-all w-full sm:w-auto min-w-[300px]"
              >
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 mb-2">
                  Up Next
                </span>
                <span className="text-xl font-black italic text-slate-900 group-hover:text-indigo-700 flex items-center gap-3">
                  {nextArticle.title} 
                  <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center transform group-hover:translate-x-2 transition-transform not-italic">
                    →
                  </span>
                </span>
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}