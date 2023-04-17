import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server'
import { createApp } from './app.js'
import logoUrl from '/favicon.ico'
import utilsSynchUrl from '../src/utils-synch.js?url'

export { render }

export const passToClient = ['pageProps', 'routeParams']

async function render(pageContext) {
  const app = createApp(pageContext)
  const appHtml = await renderToString(app)
  
  const { documentProps } = pageContext.exports
  const title = (documentProps && documentProps.title) || 'Adventure CMS'
  const isPrivatePage = false // TODO get the value for this from a setting somewhere
  const robotsIndex = isPrivatePage ? "noindex" : ""

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
        <meta name="robots" content="${robotsIndex}" />
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
