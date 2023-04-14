
import { readFile } from "node:fs/promises"
import '../../src/assets/data/slides.json' // TODO maybe necessary so that slides.json is loaded by Vite on page reload?

export { onBeforeRender }

export const passToClient = ['pageProps', 'routeParams']

async function onBeforeRender(pageContext) {
  console.log(`onBeforeRender (adventure) -- ${pageContext.urlPathname} -- ${pageContext.Page ? pageContext.Page.__name : ""}`)

  // TODO Idea: two different data sources:
  // 1. Database. All data is by default in the database. Changes are not watched. Updating slides writes
  //    data to the DB.
  // 2. slides.json. This file is constructed from the data in the database in onBeforeRender. This file
  //    is watched. Editing/adding/deleting images is done directly in the slides.json (in addition to 
  //    the DB) to trigger HMR.
  const slidesJsonString = await readFile("/adventure/src/assets/data/slides.json", "utf8"),
    slidesData = JSON.parse(slidesJsonString);

  return {
    pageContext: {
      pageProps: {
        slidesData: slidesData.slides,
        pageMeta: slidesData.meta,
        messages: slidesData.messages
      }
    }
  }
}