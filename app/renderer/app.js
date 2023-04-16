import { createSSRApp, h } from 'vue'
import { createPinia } from "pinia";
import { setPageContext } from './usePageContext.js'
import { initI18n } from "./i18n.js";

import PageShell from './PageShell.vue'

export { createApp }

function createApp(pageContext) {
  const messages = pageContext.pageProps.adventure ? pageContext.pageProps.adventure.messages : {}

  const PageWithLayout = {
    render() {
      return h(
        PageShell,
        {},
        {
          default() {
            return h(pageContext.Page)
          }
        }
      )
    }
  }

  const app = createSSRApp(PageWithLayout);

  app.use(createPinia());
  app.use(initI18n(messages));

  // We make `pageContext` available from any Vue component
  setPageContext(app, pageContext)

  return app
}
