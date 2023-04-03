import { createSSRApp, h } from 'vue'
import { createPinia } from "pinia";
import { setPageContext } from './usePageContext.js'
import { initI18n } from "./i18n.js";

import PageShell from './PageShell.vue'

export { createApp }

function createApp(pageContext) {
  let pageProps = pageContext.pageProps || {}

  const PageWithLayout = {
    render() {
      return h(
        PageShell,
        {},
        {
          default() {
            return h(pageContext.Page, pageProps)
          }
        }
      )
    }
  }

  const app = createSSRApp(PageWithLayout);

  app.use(createPinia());
  app.use(initI18n(pageProps.messages));

  // We make `pageContext` available from any Vue component
  setPageContext(app, pageContext)

  return app
}
