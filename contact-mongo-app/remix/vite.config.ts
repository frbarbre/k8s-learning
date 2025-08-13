import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
  build: {
    cssMinify: true,
    ssr: false,
  },
});
