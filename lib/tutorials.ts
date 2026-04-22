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
    duration: "2:22", // ← update this to the actual video length
    category: "Getting Started",
    publishedAt: "2026-04-17",
  },
    {
    id: "2",
    slug: "understanding-personas-in-ozigi",
    title: "Understanding Personas in Ozigi",
    description:
      "Learn how to create and manage personas in Ozigi to create better content for your target audience.",
    videoId: "olWZZOW9WYk",
    duration: "2:15", // ← update this to the actual video length
    category: "Features",
    publishedAt: "2026-04-22",
  },
      {
    id: "3",
    slug: "scheduling-generated-content-with-ozigi",
    title: "Scheduling Generated Content in Ozigi",
    description:
      "Learn how to schedule content generation in Ozigi to streamline your workflow.",
    videoId: "ylqy_hr2sio",
    duration: "1:05", // ← update this to the actual video length
    category: "Workflows",
    publishedAt: "2026-04-22",
  },
        {
    id: "4",
    slug: "ozigi-content-engine-explained",
    title: "Ozigi Content Engine Explained",
    description: "This video is an in-depth explanation of how the Ozigi content engine operates. From the brain behind the API to how it all plays out in the user interface. Ozigi is your AI-powered content generztor that produces human sounding content",
    videoId: "dFbCTd_npQY",
    duration: "4:51", // ← update this to the actual video length
    category: "Getting Started",
    publishedAt: "2026-04-22",
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
