import { MetadataRoute } from "next";
import { getAllPosts, getAllSections } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://blog.ozigi.app";
  
  // Get all blog posts and sections
  const posts = await getAllPosts();
  const sections = getAllSections();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { 
      url: baseUrl, 
      lastModified: new Date(), 
      changeFrequency: "daily", 
      priority: 1 
    },
  ];
  
  // Section pages
  const sectionPages: MetadataRoute.Sitemap = sections.map((section) => ({
    url: `${baseUrl}/section/${section.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  
  // Dynamic blog post pages with image metadata
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => {
    const entry: any = {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    };
    
    // Add image metadata if cover image exists
    if (post.coverImage) {
      entry.images = [
        {
          url: post.coverImage,
          title: post.title,
        },
      ];
    }
    
    return entry;
  });
  
  return [...staticPages, ...sectionPages, ...blogPages];
}
