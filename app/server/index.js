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

function init() {
  // Set the SetGID flag on the public/img/ directory so that child directories inherit the group (usually 'node')
  fs.chmodSync(path.resolve(root, 'public', 'img'), 0o2755)
}

async function startServer() {
  const app = express()
  const {
    insertOneAdventure,
    findAdventures,
    insertOneSlide,
    removeOneSlide,
    findImgReference,
    updateOneSlideContent,
    updateOneText
  } = await import('../database/db.js')
  const { pad, generateScaledImage } = await import("../utils-node/utils.js")


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

  app.use((req, _, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
  })
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
      res.status(200).end()
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
            const fileExt = req.file.originalname.split(".").pop().toLowerCase().replace(/jpeg|jfif|pjpeg|pjp/, "jpg"),
                  newName = `${pad(req.body.slideIdx)}_main`,
                  newNameWithExt = `${newName}.${fileExt}`,
                  targetDir = path.resolve(root, 'public', 'img', adventureId),
                  newPath = path.resolve(targetDir, newNameWithExt)
      
            // Create a new directory in public/img/ for this adventure and set its owner to the parent's owner (usually 'node')
            // TODO get the parent owner dynamically instead of setting this hardcoded
            execSync(`install -d -o node -m 00755 ${targetDir}`)
      
            // TODO check file for viruses before moving it to the img directory
            fs.renameSync(req.file.path, newPath)
            console.log(`moved new file ${req.file.path} to ${newPath}`)
      
            const newSlideId = await insertOneSlide(adventureId, fileExt === "jpg" ? newName : newNameWithExt, Number(req.body.imgWidth), Number(req.body.imgHeight))

            res.status(200).json({ok: true, newSlideId: newSlideId})
            return

          case "remove":
            const slideId = req.body.slideId
    
            const orphanedImages = await removeOneSlide(adventureId, slideId)

            if (orphanedImages.length > 0) {
              const adventureImgDir = path.resolve(root, 'public', 'img', adventureId)

              try {
                execSync(`rm -f ${
                  orphanedImages
                    .map(img => path.resolve(adventureImgDir, `${img}*`))
                    .join(" ")
                }`)
                console.log("removed orphaned images")
              } catch (ex) {
                console.error(ex)
                console.log("orphaned images removed with errors, see above")
              }
            }

            break
        }
      } else if (req.body.slideContent) {
        switch (req.body.slideContent) {
          case "add":
            const slideContent = {
              headline: req.body.headline,
              content: {
                text: req.body.contentText,
                position: req.body.contentPosition
              }
            }

            await updateOneSlideContent(adventureId, req.body.slideId, slideContent, req.body.locale)
        }
      }

      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json(ex)
    }
  })

  // Edit text
  app.post('/rest/adventure/:adventureId/edit/text', upload.fields(["textModule", "locale", "newText"]), async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            textModule = req.body.textModule,
            locale = req.body.locale,
            newText = req.body.newText

      console.log(`updating text '${textModule}' (lang '${locale}') in adventure ${adventureId}`)

      const success = await updateOneText(adventureId, textModule, locale, newText)

      if (success)
        res.status(200).json({ok: true})
      else
        res.status(404).json({ok: false, message: `adventure '${adventureId}' not found`})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  app.get('/img/:adventureId/:filename', async (req, res) => {
    const match = req.params.filename.match(/(?<name>.*?)_(?<sizeStr>[\dx]+)\.(?<ext>webp|jpe?g|png|gif)/i)

    if (match) {
      if (await findImgReference(req.params.adventureId, match.groups.name)) {
        console.log(`${match.groups.name} referenced in ${req.params.adventureId} - generating ...`)

        try {
          const scaledImagePath = await generateScaledImage(req.params.adventureId, match.groups.name, match.groups.sizeStr)
          console.log(`generated image: ${scaledImagePath}`)
          res.status(200).sendFile(scaledImagePath)
          return
        } catch (ex) {
          console.error(ex)
        }
      } else {
        console.error(`Error: ${match.groups.name} not referenced in ${req.params.adventureId}`)
      }
    } else {
      console.error(`Error: wrong format: ${req.params.filename}`)
    }

    res.status(404).end()
  })

  app.get('/img/*', (_, res) => {
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