/** @type {import('next').NextConfig} */
const nextConfig = {
  // Every page is prerendered from the Markdown library at build time,
  // so the site is exported as plain static files (written to ./out).
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
