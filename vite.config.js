import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "http://20.244.39.55",
    port: 5012,
    open: false, // Disable auto-open to avoid xdg-open error
    strictPort: true
  }
});
