import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    API_URL: JSON.stringify("http://20.244.39.55:5012") // Define API_URL globally
  },
  server: {
    host: "http://20.244.39.55",
    port: 5012,
    open: false, // Avoids xdg-open error
    strictPort: true
  }
});
