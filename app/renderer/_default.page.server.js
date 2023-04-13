import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server'
import { readFile } from "node:fs/promises"
import { createApp } from './app.js'
import { findSlides } from '../database/db.js'
import logoUrl from '/favicon.ico'
import utilsSynchUrl from '../src/utils-synch.js?url'
import '../src/assets/data/slides.json' // TODO maybe necessary so that slides.json is loaded by Vite on page reload?

export { onBeforeRender, render }
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ['pageProps', 'routeParams']

async function onBeforeRender(pageContext) {
  console.log(`onBeforeRender -- ${pageContext.urlPathname} -- ${pageContext.Page ? pageContext.Page.__name : ""}`)

  findSlides()

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

async function render(pageContext) {
  const app = createApp(pageContext)
  const appHtml = await renderToString(app)

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext.exports
  const title = (documentProps && documentProps.title) || 'Adventure CMS'

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="preload" href="/fonts/ubuntu-v20-latin-regular.woff2" as="font" crossorigin />
        <link rel="preload" href="/fonts/ubuntu-v20-latin-italic.woff2" as="font" crossorigin />
        <link rel="preload" href="/fonts/ubuntu-v20-latin-700.woff2" as="font" crossorigin />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" />
        <title>${title}</title>
        <script src="${utilsSynchUrl}"></script>
      </head>
      <body>${dangerouslySkipEscape(appHtml)}</body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    }
  }
}
