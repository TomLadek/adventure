import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { resourcePath } from "./utils-node/utils.js";

import vue from "@vitejs/plugin-vue";
import ssr from 'vite-plugin-ssr/plugin'
import cmsBuildTransformer from "./src/rollup-plugin-cms-build-transformer.js";

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
      }), cmsBuildTransformer(isCmsView, resourcePath)],
      resolve: {
        alias: {
          "@": fileURLToPath(new URL("./src", import.meta.url)),
          "$R": resourcePath
        },
      },
      build: {
        reportCompressedSize: false
      },
      experimental: { // TODO pin Vite version to minor according to https://vitejs.dev/guide/build.html#advanced-base-options
        renderBuiltUrl(filename, { hostType }) {
          if (hostType === "css") {
            return `/${filename}`
          }
        }
      }
    };

  if (isCmsView) {
    conf.base = process.env.URL_BASE_CMS;
  } else {
    conf.base = `${process.env.URL_BASE}/${process.env.DEPLOYMENT_PATH}`;
  }

  return conf;
});
