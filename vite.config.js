import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/GraphQL/",
  build: {
    rollupOptions: {
      input: "index.html", // Chemin relatif, plus simple
    },
  },
});
