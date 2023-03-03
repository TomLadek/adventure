import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import ssr from 'vite-plugin-ssr/plugin'

// Plugins
import imageGenerator from "./src/rollup-plugin-image-generator.js";
import dataManager from "./vite-plugin-data-manager.js";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const conf = {
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    plugins: [vue(), ssr(), imageGenerator(), dataManager()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    }
  };

  return conf;
});
