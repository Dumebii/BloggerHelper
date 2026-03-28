import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

export default async function BlogIndex() {
  console.log("BlogIndex: start");
  const postsDirectory = path.join(process.cwd(), "content/blog");
  console.log("Posts directory:", postsDirectory);

  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    console.error("Directory does not exist:", postsDirectory);
    return <div>No blog posts directory found.</div>;
  }

  const filenames = fs.readdirSync(postsDirectory);
  console.log("Filenames:", filenames);

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    return {
      slug: filename.replace(/\.mdx?$/, ""),
      title: data.title,
      date: data.date,
      description: data.description,
    };
  });

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  console.log("Posts loaded:", posts.length);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* hero section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-brand-navy">
          Ozigi Blog
        </h1>
        <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">
          Insights, updates, and deep dives into the Ozigi content engine.
        </p>
      </div>

      {/* posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-xl font-black text-brand-navy mb-2 group-hover:text-brand-red">
                {post.title}
              </h2>
              <p className="text-sm text-slate-500 mb-3">
                {new Date(post.date).toLocaleDateString()}
              </p>
              <p className="text-slate-600">{post.description}</p>
              <div className="mt-4 text-brand-red font-bold text-sm">Read more →</div>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}