import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    domains: ["picsum.photos", "your-other-image-domains"],
  },
};

const withMDX = createMDX({});
export default withMDX(nextConfig);