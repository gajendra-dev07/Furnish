/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {
    // Explicitly set the workspace root so Turbopack can always resolve
    // next/package.json regardless of which sub-directory it compiles from.
    root: import.meta.dirname,
  },
};

export default nextConfig;
