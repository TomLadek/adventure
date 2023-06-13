import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import ssr from 'vite-plugin-ssr/plugin'
import cmsBuildTransformer from "./src/rollup-plugin-cms-build-transformer.js";
import imageGenerator from "./src/rollup-plugin-image-generator.js";

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  const isCmsView = configEnv.mode !== "production",
    conf = {
      define: {
        __VUE_I18N_FULL_INSTALL__: true,
        __VUE_I18N_LEGACY_API__: false,
        __INTLIFY_PROD_DEVTOOLS__: false,
      },
      plugins: [vue(), ssr({ 
        prerender: {
          partial: true
        }
      }), cmsBuildTransformer(isCmsView), imageGenerator()],
      resolve: {
        alias: {
          "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
      }
    };

  if (isCmsView) {
    // conf.server = {}
  } else {
    // conf.base = "/adventure/2023-myadventure"
  }

  conf.base = "/adventure/staging"

  return conf;
});
