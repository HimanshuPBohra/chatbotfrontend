import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "20.244.39.55",
    port: 5012,  // Using alternate port since 5173 is in use
    open: true,  // Automatically opens browser
    strictPort: true  // Prevents conflicts
  }
});
