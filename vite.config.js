import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import monkey, { cdn } from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar(),
    monkey({
      entry: "src/main.js",
      userscript: {
        icon: "https://vitejs.dev/logo.svg",
        namespace: "along/alibabatools",
        match: ["*://*.alibaba.com/trade/search*"],
        "run-at": "document-end",
        defaulticon: "",
        author: "along",
      },
      clientAlias: "$monkey",
      server: { mountGmApi: true },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js"),
        },
        externalResource: {},
      },
    }),
  ],
});
