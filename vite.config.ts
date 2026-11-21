/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For GitHub Pages project sites the app is served from /<repo>/.
// Override with VITE_BASE=/ for local/Vercel/root deploys.
const base = process.env.VITE_BASE ?? "/pathology-wsi-viewer/";

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
  },
});
