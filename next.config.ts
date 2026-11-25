import type { NextConfig } from "next";

/*
  The site is exported as plain static files for GitHub Pages.

  A GitHub Pages project site is served from a sub-path
  (https://<owner>.github.io/<repo>/), so every URL needs that prefix. The
  deploy workflow sets NEXT_PUBLIC_BASE_PATH to it; locally it is empty and the
  site runs at http://localhost:3000 as usual. With a custom domain, leave it
  empty there too.
*/
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Emit /en/research/index.html rather than /en/research.html, which is the
  // layout static hosts like GitHub Pages serve most reliably.
  trailingSlash: true,
  images: {
    // There is no server to resize images on the fly. This loader serves the
    // original file and adds the base path, which next/image does not do on
    // its own for plain string sources.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
};

export default nextConfig;
