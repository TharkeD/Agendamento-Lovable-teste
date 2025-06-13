import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let componentTaggerPlugin = null;

  // Evita erro por causa do módulo ESM
  if (mode === 'development') {
    const mod = await import("lovable-tagger");
    componentTaggerPlugin = mod.componentTagger();
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      componentTaggerPlugin,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
