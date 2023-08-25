import { findAdventure } from "../../database/db.js"
import { isCmsView } from "../../src/utils.js"

export { onBeforeRender }

async function onBeforeRender(pageContext) {
  console.log(`onBeforeRender (adventure) -- ${pageContext.urlPathname} -- ${pageContext.Page ? pageContext.Page.__name : ""}`)

  const adventureUrlPath = isCmsView ? pageContext.urlPathname.replace(/^\/|\/$/g, "") : process.env.DEPLOYMENT_PATH
  let adventure = await findAdventure(adventureUrlPath) || {}

  return {
    pageContext: {
      pageProps: {
        adventure
      }
    }
  }
}