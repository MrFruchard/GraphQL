import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/GraphQL/",
  root: ".", // Définit explicitement la racine du projet
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
