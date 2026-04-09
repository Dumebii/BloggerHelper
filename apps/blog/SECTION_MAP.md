# Ozigi Blog - Section Organization Map

## Blog URL Structure

```
blog.ozigi.app/
├── /                                    (Home - all articles with section filters)
│   ├── Section navigation tabs (5 sections)
│   └── Latest articles grid
│
├── /blog/[slug]                         (Individual article pages)
│   ├── robust-webhook-handler-in-nodejs
│   ├── gemini-2.5-vs-claude-3.7
│   ├── ozigi-v2-changelog
│   └── your-launch-post-got-4-likes
│
└── /[section-slug]                     (Section landing pages - top level for SEO)
    ├── /engineering                     (2 articles)
    │   ├── robust-webhook-handler-in-nodejs
    │   └── gemini-2.5-vs-claude-3.7
    ├── /marketing                       (0 articles - coming soon)
    ├── /content                         (1 article)
    │   └── your-launch-post-got-4-likes
    ├── /tools-roundup                   (0 articles - coming soon)
    └── /ozigi-focus                     (1 article)
        └── ozigi-v2-changelog
```

## Five Blog Sections Explained

### 1. Engineering (`/engineering`)
**Target Audience:** Backend developers, DevOps engineers, infrastructure teams

**Article Types:**
- Technical tutorials and how-tos
- Architecture decision records (ADRs)
- System design deep-dives
- Implementation guides
- Performance optimization
- API/SDK patterns
- Database design patterns

**Example Topics:**
- Building webhook handlers
- Comparing LLM models for production
- Server architecture decisions
- Database scaling strategies
- Authentication patterns

---

### 2. Marketing (`/marketing`)
**Target Audience:** Growth marketers, product marketers, founders

**Article Types:**
- Go-to-market strategies
- Growth hacking techniques
- Audience building
- Launch strategies
- Positioning and messaging
- Channel strategy

**Example Topics:**
- How to launch on ProductHunt
- Building an engaged community
- Growth metrics that matter
- Pricing strategy
- SaaS marketing playbook

---

### 3. Content (`/content`)
**Target Audience:** Content creators, DevRel, technical writers, founders

**Article Types:**
- Content strategy guides
- Copywriting techniques
- Content distribution tactics
- Building content systems
- Writing frameworks
- Audience engagement

**Example Topics:**
- Building a sustainable content system
- Writing for developers
- Content repurposing strategies
- Building your personal brand
- The 4-like problem (and solutions)

---

### 4. Tools Roundup (`/tools-roundup`)
**Target Audience:** Developers, product teams, technical decision-makers

**Article Types:**
- Tool comparisons and reviews
- Best-in-class tool recommendations
- Tool integrations and workflows
- Use case analysis

**Example Topics:**
- Best Node.js webhook libraries
- Frontend framework comparison
- Database tool roundup
- Monitoring and observability tools
- Developer productivity tools

---

### 5. Ozigi Focus (`/ozigi-focus`)
**Target Audience:** Ozigi users, product enthusiasts, people interested in our journey

**Article Types:**
- Product updates and changelogs
- Behind-the-scenes decisions
- Roadmap announcements
- Release notes with context
- Company milestones

**Example Topics:**
- v2 Changelog and what changed
- New features announcement
- Company updates
- User success stories (internal)
- Technical decisions behind features

---

## Navigation Flow

### Visitors Landing on Blog Home
1. See hero section with 5 section navigation tabs
2. See "Latest Articles" grid showing all recent posts
3. Each post card shows section badge
4. Can click section tabs to filter, or click individual posts

### Visitors Browsing a Section
1. Go to `/blog/section/engineering` (or any section)
2. See section title and article count
3. Quick-switch tabs to jump to other sections
4. Browse all articles in that section
5. Click individual articles to read

### Visitors Reading an Article
1. Read the full article
2. See "Related Articles" at bottom (same section)
3. Can navigate back to section or blog home

---

## File Locations

```
/apps/blog/
├── content/blog/                                (Markdown articles)
│   ├── robust-webhook-handler-in-nodejs.mdx   ← NEW
│   ├── gemini-2.5-vs-claude-3.7.mdx          ← Engineering
│   ├── ozigi-v2-changelog.mdx                 ← Ozigi Focus
│   └── your-launch-post-got-4-likes.mdx      ← Content
│
├── public/images/blog/                        (Cover images)
│   ├── webhook-handler/                       ← NEW
│   │   └── cover-image.png
│   ├── gemini-vs-claude/
│   │   └── cover-image.png
│   ├── ozigi-v2/
│   │   └── cover-image.png
│   └── your-post-got-4-likes/
│       └── cover-image.png
│
├── app/
│   ├── page.tsx                               (Blog home with section tabs)
│   ├── [slug]/page.tsx                        (Section landing - top level)
│   └── blog/
│       └── [slug]/page.tsx                    (Individual article)
│
└── lib/blog.ts                                (Updated with section support)
```

---

## How to Add an Article to a Section

1. **Create the markdown file** with proper frontmatter including `section: "Engineering"`
2. **Add the cover image** to the appropriate folder
3. **Deploy** - the blog automatically rebuilds
4. **Article appears** in:
   - The section page (`/blog/section/engineering`)
   - The main blog home
   - Related posts on other articles in same section

---

## Future Expansion Ideas

- **Author profiles** - Click author name to see all their articles
- **Category + Section combo** - Filter by both (e.g., "Engineering" + "Tutorial")
- **Newsletter signup** - Per-section newsletters
- **Reading lists** - Curated collections across sections
- **Search** - Full-text search across all articles
