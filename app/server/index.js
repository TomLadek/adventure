// Note that this file isn't processed by Vite, see https://github.com/brillout/vite-plugin-ssr/issues/562

const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const { renderPage } = require('vite-plugin-ssr/server')
const { execSync } = require('child_process')

const upload = multer({ dest: 'server/uploads/' })

const isProduction = process.env.NODE_ENV === 'production',
      port = process.env.PORT || 3000,
      root = path.resolve(__dirname, '..')

function pad(str) {
  while (str.length < 2)
    str = "0" + str

  return str
}

function init() {
  // Set the SetGID flag on the public/img/ directory so that child directories inherit the group (usually 'node')
  fs.chmodSync(path.resolve(root, 'public', 'img'), 0o2755)
}

async function startServer() {
  const app = express()
  const { insertOneAdventure, findAdventures, insertOneSlide, removeOneSlide } = await import('../database/db.js')


  /* Middlewares */
  app.use(express.json())

  if (isProduction) {
    const sirvMiddleware = require('sirv')

    app.use(sirvMiddleware(path.resolve(root, 'dist', 'client')))
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
    try {
      execSync("npm run build")
      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json(ex)
    }
  })

  app.get('/rest/adventure/list', async (req, res) => {
    try {
      const adventures = await findAdventures()
      res.status(200).json(adventures)
    } catch (ex) {
      console.error(ex)
      res.status(500).json(ex)
    }
  })

  app.put('/rest/adventure/create', async (req, res) => {
    try {
      await insertOneAdventure(req.body)
      return res.status(200).end()
    } catch (ex) {
      console.error(ex)
      res.status(500).json(ex)
    }
  })

  app.post('/rest/adventure/:id/edit', upload.single('mainImg'), async (req, res) => {
    try {
      const adventureId = req.params.id

      if (req.body.slide) {
        switch (req.body.slide) {
          case "add":
            const newName = `${pad(req.body.slideIdx)}_main.jpg`,
                  targetDir = path.resolve(root, 'public', 'img', adventureId),
                  newPath = path.resolve(targetDir, newName)
      
            // Create a new directory in public/img/ for this adventure and set its owner to the parent's owner (usually 'node')
            // TODO get the parent owner dynamically instead of setting this hardcoded
            execSync(`install -d -o node -m 00755 ${targetDir}`)
      
            fs.renameSync(req.file.path, newPath)
            console.log(`moved new file ${req.file.path} to ${newPath}`)
      
            const newSlideId = await insertOneSlide(adventureId, newName)

            res.status(200).json({ok: true, newSlideId: newSlideId})
            return

          case "remove":
            const slideId = req.body.slideId
    
            await removeOneSlide(adventureId, slideId)
            break
        }
      }

      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json(ex)
    }
  })

  app.get('/img/*', async (req, res) => {
    console.log(`${req.originalUrl}`)
    res.status(404).end()
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

init()
startServer()