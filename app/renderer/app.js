import { createSSRApp, h } from 'vue'
import { setPageContext } from './usePageContext'
import { createPinia } from "pinia";
import { initI18n } from "./i18n";

import PageShell from './PageShell.vue'
import slidesData from "../src/assets/data/slides.json";

export { createApp }

function createApp(pageContext) {
  let pageProps = pageContext.pageProps || {}
  
  pageProps.slidesData = slidesData.slides
  pageProps.pageMeta = slidesData.meta

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
  app.use(initI18n(slidesData.messages));

  // We make `pageContext` available from any Vue component
  setPageContext(app, pageContext)

  return app
}
