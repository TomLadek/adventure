import { findAdventures } from '../../database/db.js'

export { onBeforeRender }

async function onBeforeRender(pageContext) {
  console.log(`onBeforeRender (index) -- ${pageContext.urlPathname} -- ${pageContext.Page ? pageContext.Page.__name : ""}`)

  const adventureList = await findAdventures()

  return {
    pageContext: {
      pageProps: {
        adventureList
      }
    }
  }
}