import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface Heading {
  text: string;
  level: number;
  id: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  description?: string;
  coverImage?: string;
  author?: string;
  readTime?: string;
  categories?: string[];
  section?: string;
  content: string;
  headings: Heading[];
  [key: string]: any;
}

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ text, level, id });
  }
  return headings;
}

function parseCategories(data: any): string[] {
  if (data.categories) {
    return Array.isArray(data.categories) ? data.categories : [data.categories];
  }
  if (data.category) {
    return data.category.split(',').map((c: string) => c.trim());
  }
  return [];
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(postsDirectory);
  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, "");
    const filePath = path.join(postsDirectory, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || data.description,
      description: data.description || data.excerpt,
      coverImage: data.coverImage || null,
      author: data.author,
      readTime: data.readTime,
      categories: parseCategories(data),
      section: data.section || null,
      content,
      headings: extractHeadings(content),
      ...data,
    };
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || data.description,
      description: data.description || data.excerpt,
      coverImage: data.coverImage || null,
      author: data.author,
      readTime: data.readTime,
      categories: parseCategories(data),
      section: data.section || null,
      content,
      headings: extractHeadings(content),
      ...data,
    };
  } catch {
    return null;
  }
}

export async function getRelatedPosts(categories: string[], currentSlug: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts
    .filter((post) => {
      if (post.slug === currentSlug) return false;
      if (!post.categories || post.categories.length === 0) return false;
      // If any of the current post's categories match any of the other post's categories
      return post.categories.some(cat => categories.includes(cat));
    })
    .slice(0, 3);
}

export function getAllSections(): string[] {
  return ["Engineering", "Marketing", "Content", "Tools Roundup", "Ozigi Focus"];
}

export async function getPostsBySection(section: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.section === section);
}
