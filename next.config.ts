import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Only apply Sentry config if auth token is available
const sentryConfig = {
  org: "ozigi",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  automaticVercelMonitors: true,
  hideSourceMaps: false,
  disableLogger: true,
  // Skip source map upload if no auth token (prevents build failures)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
};

export default withSentryConfig(nextConfig, sentryConfig);
