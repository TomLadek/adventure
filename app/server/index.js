// Note that this file isn't processed by Vite, see https://github.com/brillout/vite-plugin-ssr/issues/562

const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const { renderPage } = require('vite-plugin-ssr/server')
const { execSync } = require('child_process')

// For verbose request logging run 'npm install winston express-winston' add the following:
// const winston = require('winston')
// const expressWinston = require('express-winston')

const upload = multer({ dest: 'server/uploads/' })

const isProduction = process.env.NODE_ENV === 'production',
      port = process.env.PORT || 3000,
      root = path.resolve(__dirname, '..')

function init() {
  // Set the SetGID flag on the public/img/ directory so that child directories inherit the group (usually 'node')
  fs.chmodSync(path.resolve(root, 'public', 'img'), 0o2755)
}

function getFileExt(srcName) {
  return srcName.split(".").pop().toLowerCase().replace(/jpeg|jfif|pjpeg|pjp/, "jpg")
}

function moveFile(fileExt, srcPath, targetImgDir, targetName) {
  const targetNameWithExt = /\.[a-zA-Z0-9]+$/.test(targetName) ? targetName : `${targetName}.${fileExt}`,
        targetDir = path.resolve(root, 'public', 'img', targetImgDir),
        targetPath = path.resolve(targetDir, targetNameWithExt)

  // Create a new directory in public/img/ for this adventure and set its owner to the parent's owner (usually 'node')
  // TODO get the parent owner dynamically instead of setting this hardcoded
  execSync(`install -d -o node -m 00755 ${targetDir}`)
  
  // TODO check file for viruses before moving it to the img directory
  fs.renameSync(srcPath, targetPath)
  console.log(`moved new file ${srcPath} to ${targetPath}`)
}

function deleteAdventureImages(adventureId, images) {
  if (!images.length)
    return

  const adventureImgDir = path.resolve(root, 'public', 'img', adventureId)

  try {
    execSync(`rm -f ${
      images
        .map(img => path.resolve(adventureImgDir, `${img.replace(/\.[a-zA-Z0-9]+$/, "")}*`))
        .join(" ")
    }`)

    console.log("removed image files:", images.join(", "))
  } catch (ex) {
    console.error(ex)
    console.log("image files removed with errors, see above")
  }
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
    updateOneSlideGallery,
    updateOneSlideGalleryAddImg,
    updateOneSlideGalleryRemoveImg,
    updateOneSlideGalleryAddImgCaption,
    updateOneRemoveSlideContent,
    updateOneText,
    closeDb
  } = await import('../database/db.js')
  const { pad, generateScaledImage } = await import("../utils-node/utils.js")


  /* Middlewares */
  // For verbose request logging add the following:
  // app.use(expressWinston.logger({
  //   transports: [
  //     new winston.transports.Console()
  //   ],
  //   meta: false,
  //   expressFormat: true
  // }))

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
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  app.get('/rest/adventure/list', async (_, res) => {
    try {
      const adventures = await findAdventures()
      res.status(200).json(adventures)
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Create adventure
  app.put('/rest/adventure/create', async (req, res) => {
    try {
      await insertOneAdventure(req.body)
      res.status(201).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Delete slide
  app.delete('/rest/adventure/:adventureId/slide/:slideId', async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            slideId = req.params.slideId
    
      const orphanedImages = await removeOneSlide(adventureId, slideId)

      deleteAdventureImages(adventureId, orphanedImages)

      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Add slide content
  app.put('/rest/adventure/:adventureId/slide/:slideId/content', upload.fields(["locale", "contentPosition", "headline", "contentText"]), async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            slideContent = {
              headline: req.body.headline,
              content: {
                text: req.body.contentText,
                position: req.body.contentPosition
              }
            }

      await updateOneSlideContent(adventureId, req.params.slideId, slideContent, req.body.locale)

      res.status(201).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Remove slide content
  app.delete('/rest/adventure/:adventureId/slide/:slideId/content', async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            slideId = req.params.slideId

      const orphanedImages = await updateOneRemoveSlideContent(adventureId, slideId)

      deleteAdventureImages(adventureId, orphanedImages)

      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Add slide gallery image
  app.post('/rest/adventure/:adventureId/slide/:slideId/gallery', upload.single('galleryImg'), async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            slideId = req.params.slideId,
            fileExt = getFileExt(req.file.originalname)

      const galleryImg = await updateOneSlideGalleryAddImg(adventureId, slideId, fileExt === "jpg" ? "" : `.${fileExt}`, Number(req.body.imgWidth), Number(req.body.imgHeight))

      moveFile(fileExt, req.file.path, adventureId, galleryImg)

      res.status(200).json({ok: true, src: galleryImg})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Change slide gallery properties
  app.post('/rest/adventure/:adventureId/slide/:slideId/gallery/props', upload.fields(["style"]), async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            slideId = req.params.slideId,
            style = req.body.style

      await updateOneSlideGallery(adventureId, slideId, { style })

      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Delete slide gallery image
  app.delete('/rest/adventure/:adventureId/slide/:slideId/gallery', upload.fields(["galleryImg"]), async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            slideId = req.params.slideId,
            galleryImgSrc = req.body.galleryImg.replace(".jpg", "");

      await updateOneSlideGalleryRemoveImg(adventureId, slideId, galleryImgSrc)

      deleteAdventureImages(adventureId, [galleryImgSrc])

      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Add gallery image caption text module
  app.put('/rest/adventure/:adventureId/slide/:slideId/gallery/:imageId/caption', upload.fields(["captionTextModule"]), async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            slideId = req.params.slideId,
            imageId = req.params.imageId

      await updateOneSlideGalleryAddImgCaption(adventureId, slideId, imageId, req.body.captionTextModule)

      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Add new slide
  app.put('/rest/adventure/:adventureId/slide/', upload.single('mainImg'), async (req, res) => {
    try {
      const adventureId = req.params.adventureId,      
            fileExt = getFileExt(req.file.originalname)

      const { newSlideId, mainImg } = await insertOneSlide(adventureId, fileExt === "jpg" ? "" : `.${fileExt}`, Number(req.body.imgWidth), Number(req.body.imgHeight))

      moveFile(fileExt, req.file.path, adventureId, mainImg)

      res.status(200).json({ok: true, id: newSlideId, src: mainImg})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
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

  app.post('/rest/adventure/:adventureId/slide/:slideId/content', upload.fields(["contentPosition"]), async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            slideId = req.params.slideId,
            slideContent = {
              content: {
                position: req.body.contentPosition
              }
            }

      await updateOneSlideContent(adventureId, slideId, slideContent)
      
      res.status(200).json({ok: true})
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })

  // Request non-existent image in the adventure directory, possibly creating a scaled version of an existing original image
  app.get('/img/:adventureId/:filename', async (req, res) => {
    try {
      const adventureId = req.params.adventureId,
            match = req.params.filename.match(/(?<name>.*?)_(?<sizeStr>[\dx]+)\.(?<ext>webp|jpe?g|png|gif)/i)
      
      if (match) {
        if (await findImgReference(adventureId, match.groups.name)) {
          console.log(`${match.groups.name} referenced in ${adventureId} - generating ...`)
          
          const scaledImagePath = await generateScaledImage(adventureId, match.groups.name, match.groups.sizeStr)
          console.log(`generated image: ${scaledImagePath}`)
          res.status(200).sendFile(scaledImagePath)
          return
        } else {
          console.error(`Error: ${match.groups.name} not referenced in ${adventureId}`)
        }
      } else {
        console.error(`Error: wrong format: ${req.params.filename}`)
      }

      res.status(404).end()
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }      
  })

  app.get('/img/*', (_, res) => {
    res.status(404).end()
  })

  // IMPORTANT: Catch-all-route needs to be after /rest routes otherwise
  // vite-plugin-ssr tries to handle those as well.
  app.get('*', async (req, res, next) => {
    try {
      const result = await renderPage({
              urlOriginal: req.originalUrl
            }),
            { httpResponse } = result

      // console.log(`serving response for ${req.originalUrl}:`, result)

      if (!httpResponse)
        return next()

      const { body, statusCode, contentType } = httpResponse

      // Comment this in to speed up the requests a little. Warning: may break an nginx reverse proxy as of 2023-06!
      // if (res.writeEarlyHints)
      //   res.writeEarlyHints({ link: httpResponse.earlyHints.map((e) => e.earlyHintLink) })

      res.status(statusCode).type(contentType).send(body)    
    } catch (ex) {
      console.error(ex)
      res.status(500).json({ok: false, message: `${ex.name}: ${ex.message}`})
    }
  })
  /* ------ */


  /* Ports */
  app.listen(port)
  /* ----- */

  console.log(`Server running at http://localhost:${port} (isProduction=${isProduction}; root=${root})`)

  process.on("exit", async () => {
    console.log("shutting down")
    await closeDb()
  })
}

init()
startServer()