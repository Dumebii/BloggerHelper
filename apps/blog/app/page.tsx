import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";

export default async function BlogIndex() {
  const postsDirectory = path.join(process.cwd(), "content/blog");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    return {
      slug: filename.replace(/\.mdx?$/, ""),
      title: data.title,
      date: data.date,
      description: data.description,
      coverImage: data.coverImage || null,
    };
  });

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      {/* Header and hero as before */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-brand-navy">
            Ozigi Blog
          </h1>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">
            Insights, updates, and deep dives into the Ozigi content engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article key={post.slug} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              {post.coverImage && (
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              )}
              <div className="p-6">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-black text-brand-navy mb-2 hover:text-brand-red transition">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-sm text-slate-500 mb-3">
                  {new Date(post.date).toLocaleDateString()}
                </p>
                <p className="text-slate-600">{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="inline-block mt-4 text-brand-red font-bold text-sm">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}