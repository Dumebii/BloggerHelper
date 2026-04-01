import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import { format } from "date-fns";

export const metadata = {
  title: "Blog | Ozigi",
  description: "Insights, updates, and tutorials from the Ozigi team.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
          Ozigi Blog
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Insights, updates, and tutorials from the team building the intelligent content engine.
        </p>
      </div>

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
                {post.category && (
                  <>
                    <span>•</span>
                    <span className="text-brand-red">{post.category}</span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter mb-2 group-hover:text-brand-red transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-600 text-sm line-clamp-2">
                {post.excerpt || post.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}