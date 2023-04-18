import { findAdventure } from "../../database/db.js"

export { onBeforeRender }

async function onBeforeRender(pageContext) {
  console.log(`onBeforeRender (adventure) -- ${pageContext.urlPathname} -- ${pageContext.Page ? pageContext.Page.__name : ""}`)
  
  //TODO for prod: get adventure id/path from somwhere else (argument / environment variable)

  let adventure = await findAdventure(pageContext.urlPathname) || {}

  return {
    pageContext: {
      pageProps: {
        adventure
      }
    }
  }
}