// Note that this file isn't processed by Vite, see https://github.com/brillout/vite-plugin-ssr/issues/562

const fs = require('fs')
const express = require('express')
const multer = require('multer')
const { renderPage } = require('vite-plugin-ssr/server')
const { exec } = require('child_process')

const upload = multer({ dest: 'server/uploads/' })

const isProduction = process.env.NODE_ENV === 'production',
      port = process.env.PORT || 3000,
      root = `${__dirname}/..`

function pad(str) {
  while (str.length < 2)
    str = "0" + str

  return str
}

startServer()

async function startServer() {
  const app = express()
  const { insertOneAdventure, findAdventures, insertOneSlide } = await import('../database/db.js')


  /* Middlewares */
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
  /* ----------- */


  /* Routes */
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

  app.get('/rest/adventure/list', async (req, res) => {
    try {
      const adventures = await findAdventures()
      res.status(200).json(adventures)
    } catch (ex) {
      res.status(500).json(ex)
      return
    }
  })

  app.put('/rest/adventure/create', async (req, res) => {
    try {
      await insertOneAdventure(req.body)
    } catch (ex) {
      res.status(500).json(ex)
      return
    }

    return res.status(200).end()
  })

  app.post('/rest/adventure/:id/edit', upload.single('mainImg'), async (req, res) => {
    try {
      const adventureId = req.params.id,
            newName = `${adventureId}_${pad(req.body.slideIdx)}_main.jpg`,
            newPath = `public/img/${newName}`

      fs.renameSync(req.file.path, newPath)
      console.log(`moved new file ${req.file.path} to ${newPath}`)

      await insertOneSlide(adventureId, newName)
    } catch (ex) {
      res.status(500).json(ex)
      return
    }

    res.status(200).json({ok: true})
  })

  // IMPORTANT: Catch-all-route needs to be after /rest routes otherwise
  // vite-plugin-ssr tries to handle those as well.
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
  /* ------ */


  /* Ports */
  app.listen(port)
  /* ----- */

  console.log(`Server running at http://localhost:${port} (isProduction=${isProduction}; root=${root})`)
}
