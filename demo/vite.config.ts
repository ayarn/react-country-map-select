import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  root: "demo",
  base: isPages ? "/react-country-map-select/" : "/",
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: "../dist-demo", emptyOutDir: true },
});
