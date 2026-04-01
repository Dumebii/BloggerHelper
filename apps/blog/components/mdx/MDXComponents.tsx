"use client";
import Link from "next/link";

export const MDXComponents = {
  // Only override links to use Next.js Link for internal navigation
  a: ({ href, children, ...props }: any) => {
    if (href?.startsWith("/")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  // No custom img, h1, etc. – let MDX use default elements
};