# Blog Structure Guide - Ozigi Blog

## Overview

The Ozigi blog is organized into **5 distinct sections**:

1. **Engineering** - Technical tutorials, architecture decisions, implementation guides
2. **Marketing** - Growth strategies, audience building, launch tactics
3. **Content** - Content strategy, copywriting, distribution
4. **Tools Roundup** - Tool recommendations, reviews, comparisons
5. **Ozigi Focus** - Product updates, changelogs, company news

## How to Add a New Blog Article

### Step 1: Create the Markdown File

Create a new `.mdx` file in `/apps/blog/content/blog/` with a descriptive slug:

```
/apps/blog/content/blog/your-article-slug.mdx
```

### Step 2: Add the Frontmatter

At the top of your markdown file, include the following metadata between `---` markers:

```yaml
---
title: "Your Article Title Here"
date: "2026-04-07"
description: "A brief one-line description of what this article covers."
coverImage: "/images/blog/your-folder/cover-image.png"
category: "Primary Category, Optional Secondary"
section: "Engineering"
author: "Author Name"
authorUrl: "https://www.linkedin.com/in/firstname-lastname"
authorImage: "/images/authors/firstname-lastname.jpg"
readTime: "5 min read"
keywords: ["keyword1", "keyword2", "keyword3"]
---
```

### Step 3: Choose Your Section

The `section` field determines which section your article appears in. Choose ONE:

- `"Engineering"` - Technical guides, system design, code patterns
- `"Marketing"` - Growth, positioning, launch strategies
- `"Content"` - Writing, strategy, distribution tips
- `"Tools Roundup"` - Tool reviews and recommendations
- `"Ozigi Focus"` - Product updates and announcements

### Step 4: Add Your Cover Image

1. Create a folder: `/apps/blog/public/images/blog/your-folder/`
2. Add your cover image: `/apps/blog/public/images/blog/your-folder/cover-image.png`
3. Reference it in frontmatter: `coverImage: "/images/blog/your-folder/cover-image.png"`

### Step 5: Write Your Content

After the frontmatter, write your markdown content. The blog supports:

- **Markdown formatting** (bold, italic, lists, etc.)
- **Code blocks** with syntax highlighting
- **Headings** (# for H1, ## for H2, etc.)
- **Tables and quotes**
- **MDX components** (if custom components are needed)

## Complete Example

```mdx
---
title: "Building a Robust Webhook Handler in Node.js"
date: "2026-04-07"
description: "Complete guide to signature validation, queuing, and retry logic."
coverImage: "/images/blog/webhook-handler/cover-image.png"
category: "Tutorial, Engineering"
section: "Engineering"
author: "Your Name"
authorUrl: "https://www.linkedin.com/in/firstname-lastname"
authorImage: "/images/authors/firstname-lastname.jpg"
readTime: "8 min read"
keywords: ["webhooks", "Node.js", "backend", "reliability"]
---

# Building a Robust Webhook Handler in Node.js

Your introduction paragraph here...

## Section One

Content here with **bold** and *italic* text.

```js
// Code example
const webhook = await handler.process();
```

## Section Two

More content...
```

## URL Structure

Your article will be available at:

- **Main blog:** `blog.ozigi.app/blog/robust-webhook-handler-in-nodejs`
- **Section page:** `blog.ozigi.app/engineering` (shows all Engineering articles)
- **All articles:** `blog.ozigi.app/` (shows latest articles with section tabs)

## Section Pages

Each section has its own dedicated page at the top level for better SEO:

- `blog.ozigi.app/engineering`
- `blog.ozigi.app/marketing`
- `blog.ozigi.app/content`
- `blog.ozigi.app/tools-roundup`
- `blog.ozigi.app/ozigi-focus`

## Current Articles by Section

### Engineering
- "Gemini 2.5 Flash vs Claude 3.7 Sonnet"
- "Building a Robust Webhook Handler in Node.js"

### Marketing
(Coming soon)

### Content
- "Your Launch Post Got 4 Likes"

### Tools Roundup
(Coming soon)

### Ozigi Focus
- "Ozigi v2 Changelog"

## Best Practices

1. **Use descriptive slugs** - `robust-webhook-handler-in-nodejs` instead of `article-1`
2. **Keep descriptions concise** - One sentence, under 160 characters
3. **Use cover images** - They appear in grids and increase engagement
4. **Add keywords** - Helps with SEO and discoverability
5. **Specify readTime** - Helps readers decide if they have time to read
6. **Choose one primary section** - Articles should fit clearly into one section
7. **Use clear headings** - Helps with table of contents and navigation

## Metadata Fields Explained

| Field | Required | Example |
|-------|----------|---------|
| title | Yes | "Building a Robust Webhook Handler" |
| date | Yes | "2026-04-07" |
| description | Yes | "Complete guide to signature validation and retry logic" |
| coverImage | Recommended | "/images/blog/webhook-handler/cover-image.png" |
| category | No | "Tutorial, Engineering" |
| section | Yes | "Engineering" |
| author | No | "Jane Doe" |
| readTime | No | "8 min read" |
| keywords | No | ["webhooks", "Node.js"] |

The blog automatically:
- Sorts articles by date (newest first)
- Filters by section on section pages
- Extracts headings for table of contents
- Generates social preview images
- Creates XML sitemap for SEO
