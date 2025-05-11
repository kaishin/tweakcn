import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],

  // This is Astro's default, but it's good to be explicit.
  output: 'static',

  // It's common to put source files in a 'src' directory.
  srcDir: './src',

  // Astro uses 'public' for static assets.
  publicDir: './public',

  // Astro defaults to 'dist' for output.
  outDir: './dist',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
});
