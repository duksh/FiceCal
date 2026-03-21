import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    // Allow TypeScript source imports from workspace packages
    conditions: ["import", "default"],
  },
});
