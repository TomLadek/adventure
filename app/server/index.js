// Note that this file isn't processed by Vite, see https://github.com/brillout/vite-plugin-ssr/issues/562

const express = require('express')
const { renderPage } = require('vite-plugin-ssr/server')
const { exec } = require('child_process')

const isProduction = process.env.NODE_ENV === 'production',
      port = process.env.PORT || 3000,
      root = `${__dirname}/..`

startServer()

async function startServer() {
  const app = express()
  const { insertOneSlide } = await import('../database/db.js')

  app.use(express.json())

  if (isProduction) {
    const sirvMiddleware = require('sirv')

    app.use(sirvMiddleware(`${root}/dist/client`))
  } else {
    const vite = require('vite'),
          viteDevMiddleware = (
            await vite.createServer({
              root,
              server: { middlewareMode: true }
            })
          ).middlewares

    app.use(viteDevMiddleware)
  }

  app.get('*', async (req, res, next) => {
    const result = await renderPage({
            urlOriginal: req.originalUrl
          }),
          { httpResponse } = result

    // console.log(`serving response for ${req.originalUrl}:`, result)

    if (!httpResponse)
      return next()

    const { body, statusCode, contentType, earlyHints } = httpResponse

    if (res.writeEarlyHints)
      res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) })

    res.status(statusCode).type(contentType).send(body)
  })

  app.get('/rest/deploy', async (_, res) => {
    exec("npm run build", (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`)
      }

      console.log(`stdout: ${stdout}`)
    })

    res.status(200).json({ok: true})
  })

  app.put('/rest/adventure/create', async (req, res) => {
    // TODO Do something with req.body

    insertOneSlide(req.body)

    res.status(200).json({ok: true})
  })

  app.post('/rest/adventure/:id/edit', async (req, res) => {
    console.log("params", req.params)
    console.log("body", req.body)

    res.status(200).json({ok: true})
  })

  app.listen(port)

  console.log(`Server running at http://localhost:${port} (isProduction=${isProduction}; root=${root})`)
}
