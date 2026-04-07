import Link from "next/link";
import Image from "next/image";
import { getAllPosts, getAllSections, getPostsBySection } from "@/lib/blog";
import { format } from "date-fns";

export async function generateStaticParams() {
  const sections = getAllSections();
  return sections.map((section) => ({
    slug: section.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sectionName = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${sectionName} | Ozigi Blog`,
    description: `Browse ${sectionName} articles from the Ozigi team.`,
  };
}

export default async function SectionPage({ params }: { params: { slug: string } }) {
  const sectionName = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const posts = await getPostsBySection(sectionName);
  const allSections = getAllSections();

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-6xl mx-auto py-16 px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/blog"
            className="text-sm font-semibold text-brand-red hover:text-brand-red/80 mb-4 inline-block"
          >
            ← Back to all articles
          </Link>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
            {sectionName}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            {posts.length} article{posts.length !== 1 ? "s" : ""} in this section
          </p>
        </div>

        {/* Other Sections Navigation */}
        <div className="flex flex-wrap gap-2 mb-12">
          {allSections.map((section) => {
            const isActive = section === sectionName;
            return (
              <Link
                key={section}
                href={
                  isActive
                    ? "#"
                    : `/blog/section/${section.toLowerCase().replace(/\s+/g, "-")}`
                }
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-red text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-brand-red hover:text-brand-red"
                }`}
              >
                {section}
              </Link>
            );
          })}
        </div>

        {/* Posts Grid or Empty State */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                {post.coverImage && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span>{format(new Date(post.date), "MMM dd, yyyy")}</span>
                    <span>•</span>
                    <span>{post.readTime || "5 min read"}</span>
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tighter mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {post.excerpt || post.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600 mb-6">No articles in this section yet.</p>
            <Link
              href="/blog"
              className="inline-block px-6 py-3 bg-brand-red text-white font-bold rounded-lg hover:bg-brand-red/90 transition-colors"
            >
              Browse all articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
