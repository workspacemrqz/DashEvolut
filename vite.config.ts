import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const isReplit = process.env.REPL_ID !== undefined;

export default defineConfig({
  plugins: [
    react(),
    // Apenas carregar plugins do Replit em desenvolvimento no Replit
    ...(!isProduction && isReplit ? [
      // Plugins do Replit serão carregados dinamicamente apenas se disponíveis
    ] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    cssMinify: false,
  },
  server: {
    host: '0.0.0.0',
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
