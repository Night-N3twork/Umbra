import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
  output: "static",
  server: {
    port: 4321,
    host: true
  },
  vite: {
    server: {
      fs: {
        strict: false,
        allow: ['..']
      }
    }
  }
});
