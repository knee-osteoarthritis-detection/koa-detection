import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000, // Match Docker mapping
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // points to backend on host
        changeOrigin: true,
        secure: false,
      }
    }
  },  
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Uncomment this if deploying to GitHub Pages
  // base: "/koa-detection/", 
}));
