import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
images: {
  domains: ["picsum.photos", "your-other-image-domains"],
  dangerouslyAllowSVG: true,
  contentDispositionType: 'attachment', // security best practice alongside the above
},
};

const withMDX = createMDX({});
export default withMDX(nextConfig);