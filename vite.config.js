import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://ceps-charrues-render.onrender.com",
        changeOrigin: true,
        secure: false, // Si le certificat SSL est auto-signé
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
