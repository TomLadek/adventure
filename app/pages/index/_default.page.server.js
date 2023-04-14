import { findAdventures } from '../../database/db.js'

export { onBeforeRender }

export const passToClient = ['adventures']

async function onBeforeRender(pageContext) {
  console.log(`onBeforeRender (index) -- ${pageContext.urlPathname} -- ${pageContext.Page ? pageContext.Page.__name : ""}`)

  const adventures = await findAdventures()

  return {
    pageContext: {
      adventures
    }
  }
}