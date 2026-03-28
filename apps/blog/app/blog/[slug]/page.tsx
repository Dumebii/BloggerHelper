import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

// Custom components for MDX
const components = {
  img: (props: any) => (
    <img
      {...props}
      referrerPolicy="no-referrer"
      className="rounded-lg my-4 max-w-full h-auto"
    />
  ),
};

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), `content/blog/${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const source = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(source);

  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
        {data.title}
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        {new Date(data.date).toLocaleDateString()}
      </p>
      <div className="prose prose-slate max-w-none">
        <MDXRemote source={content} components={components} />
      </div>
    </article>
  );
}