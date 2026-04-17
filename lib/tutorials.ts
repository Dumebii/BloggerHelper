export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** YouTube video ID — the part after ?v= in the URL */
  videoId: string;
  /** Human-readable duration e.g. "3:45" */
  duration: string;
  category: "Getting Started" | "Features" | "Workflows" | "Tips & Tricks";
  publishedAt: string; // ISO date string
}

export const TUTORIALS: Tutorial[] = [
  {
    id: "1",
    slug: "getting-started-with-ozigi",
    title: "Getting Started with Ozigi",
    description:
      "A complete walkthrough of the Ozigi dashboard — from signing up to generating your first piece of content in under 5 minutes.",
    videoId: "wX18Kd7n_RM",
    duration: "0:00",
    category: "Getting Started",
    publishedAt: "2026-04-17",
  },
  // Add more tutorials here as you upload videos to YouTube.
  // Copy the block above, increment the id, update the slug, title,
  // description, videoId (the part after ?v= in the YouTube URL),
  // duration, category, and publishedAt date.
];

export const TUTORIAL_CATEGORIES = [
  "All",
  "Getting Started",
  "Features",
  "Workflows",
  "Tips & Tricks",
] as const;

export type TutorialCategory = (typeof TUTORIAL_CATEGORIES)[number];
