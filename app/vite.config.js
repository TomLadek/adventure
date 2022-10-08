import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import imageGenerator from "./src/rollup-plugin-image-generator.js";

// https://vitejs.dev/config/
export default defineConfig((command) => {
  const conf = {
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    plugins: [vue(), imageGenerator()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    base: "/adventure/demo/"
  };

  //if (command === "build")
  //  conf.base = "/adventure/test/";

  return conf;
});
