import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // the original masters in assets/ are large; only public/media ships
  publicDir: "public",
  server: { port: 5173 },
});
