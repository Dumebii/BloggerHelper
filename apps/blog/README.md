# Ozigi Blog

Technical insights, tutorials, and architecture decisions from the team building the intelligent content engine.

**Live at [blog.ozigi.app](https://blog.ozigi.app)**

---

## Overview

The Ozigi Blog is a Next.js 15 application serving as the technical publication for developers, DevRel professionals, and founders building in public. Articles focus on practical engineering decisions, real production constraints, and the philosophy behind building AI tools that respect human authorship.

## Features

- **MDX Content** - Write articles in MDX with full React component support
- **Section-based Organization** - Engineering, Marketing, Content, Tools Roundup, Ozigi Focus
- **Rich Metadata & SEO** - Full Open Graph, Twitter Cards, JSON-LD structured data
- **RSS Feed** - Available at `/feed.xml` for aggregator discovery
- **AI Indexer Support** - `robots.txt` allowing AI crawlers, `llms.txt` for AI model citation
- **Author Profiles** - Linked author bios with social URLs and images
- **Responsive Design** - Mobile-first with Tailwind CSS

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Content | MDX with gray-matter |
| Deployment | Vercel |

## Local Development

```bash
# From the monorepo root
cd apps/blog

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) to view the blog.

## Content Structure

```
apps/blog/
├── app/                    # Next.js App Router
│   ├── [slug]/            # Section pages (top-level for SEO)
│   ├── blog/[slug]/       # Individual article pages
│   ├── feed.xml/          # RSS feed
│   ├── robots.ts          # SEO robots
│   └── sitemap.ts         # Dynamic sitemap
├── content/blog/          # MDX article files
├── components/            # React components
├── lib/                   # Utilities (blog.ts, etc.)
└── public/
    ├── images/            # Article images
    └── llms.txt           # AI indexer file
```

## Section URLs

Sections are at the top level for better SEO:

- `blog.ozigi.app/engineering`
- `blog.ozigi.app/marketing`
- `blog.ozigi.app/content`
- `blog.ozigi.app/tools-roundup`
- `blog.ozigi.app/ozigi-focus`

## Writing Articles

Create a new `.mdx` file in `content/blog/` with frontmatter:

```mdx
---
title: "Your Article Title"
date: "2026-04-09"
description: "A brief description for SEO and social sharing."
coverImage: "/images/blog/your-article/cover.png"
author: "FirstName LastName"
authorUrl: "https://www.linkedin.com/in/firstname-lastname"
authorImage: "/images/authors/firstname-lastname.jpg"
readTime: "5 min read"
section: "Engineering"
keywords: ["keyword1", "keyword2"]
---

Your article content here...
```

## Contributing

Want to write for Ozigi? Visit [Write for Ozigi](https://ozigi.app/write) to apply.

## Related

- [Main Ozigi App](https://ozigi.app)
- [Ozigi Documentation](https://ozigi.app/docs)
- [Writer Guide](https://ozigi.app/write)
