import { findAdventures } from '../../database/db.js'

export { onBeforeRender }

async function onBeforeRender(pageContext) {
  console.log(`onBeforeRender (index) -- ${pageContext.urlPathname} -- ${pageContext.Page ? pageContext.Page.__name : ""}`)

  let adventureList

  try {
    adventureList = await findAdventures()
  } catch (ex) {
    console.error(ex)
    adventureList = []
  }

  return {
    pageContext: {
      pageProps: {
        adventureList
      }
    }
  }
}