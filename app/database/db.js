import { MongoClient, ObjectId } from "mongodb"
import { escapeRegExp, getPrimitiveValues, getRandomId } from "../utils-node/utils.js"

const slideContentTextModuleFields = [
  "slides.headline",
  "slides.subheadline",
  "slides.content.text",
  "slides.gallery.images.caption"
]

const slideTextModuleFields = [
  "slides.mainImg.caption"
].concat(slideContentTextModuleFields)

const textModuleFields = [
  "meta.title",
  "meta.desc",
  "meta.author.madeby",
  "meta.author.content"
].concat(slideTextModuleFields)

let client

function getCollection(type) {
  if (!client)
    client = new MongoClient(`mongodb://${process.env.DB_ROOT_USER}:${process.env.DB_ROOT_PW}@mongodb:${process.env.DB_PORT}`)

  return client
          .db("adventuredb")
          .collection(type)
}

async function removeTexts(collection, adventureId, texts) {
  if (!texts.length)
    return

  const messageUnsetDoc = {},
        adventureIdObj = new ObjectId(adventureId),
        messagesLangKeys = await collection.aggregate([
          { $match: { _id: adventureIdObj } },
          { $project: { "arrayofkeyvalue": { $objectToArray: "$$ROOT.messages" } } },
          { $project: { keys: "$arrayofkeyvalue.k" } }
        ]).next()

  // Construct an $unset doc to remove all messages referenced in that slide
  if (messagesLangKeys && messagesLangKeys.keys) {
    for (let lang of messagesLangKeys.keys) {
      for (let usedText of texts) {
        messageUnsetDoc[`messages.${lang}.${usedText}`] = ""
      }
    }

    console.log(`removing texts: ${Object.keys(messageUnsetDoc).join(', ')}`)
  }

  await collection.updateOne(
    { _id: adventureIdObj },
    { $unset: messageUnsetDoc }
  )
}

export async function closeDb() {
  if (client != null) {
    await client.close()
    console.log("db connection closed")
  }
}

export async function insertOneSlide(adventureId, imgExt, width, height) {
  const adventuresColl = getCollection("adventures")
  
  const newSlideId = `slide-${getRandomId()}`,
        mainImgSrc = `${newSlideId}_main-${getRandomId()}${imgExt}`,
        newSlide = {
          id: newSlideId,
          mainImg: {
            src: mainImgSrc,
            width,
            height
          },
          transition: 0
        }

  try {
    await adventuresColl.updateOne(
      { _id: new ObjectId(adventureId) },
      { $push: { slides: newSlide } }
    )

    console.log(`Inserted slide '${newSlideId}' into adventure ${adventureId}`)

    return { newSlideId, mainImg: mainImgSrc }
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function removeOneSlide(adventureId, slideId) {
  const adventuresColl = getCollection("adventures"),
        adventureIdObj = new ObjectId(adventureId),
        orphanedImages = []
  
  try {
    // Find the adventure doc by its ID and return only the slide with the specified ID
    const foundAdventure = await adventuresColl.findOne(
      { _id: adventureIdObj, "slides.id": slideId },
      { projection: { "slides.$": 1 } }
    )

    const slideTextsAggregate = await adventuresColl.aggregate([
      { $match: { _id: adventureIdObj } },
      { $unwind: "$slides" },
      { $match: { "slides.id": slideId } },
      { 
        $project: slideTextModuleFields.reduce((projectDoc, textModuleField) => {
          projectDoc[textModuleField] = 1
          return projectDoc
        }, { "_id": 0 })
      }
    ]).next()

    if (slideTextsAggregate)
      await removeTexts(adventuresColl, adventureId, getPrimitiveValues(slideTextsAggregate))

    // Collect all images that are referenced in the slide to be removed
    if (foundAdventure.slides && foundAdventure.slides.length > 0) {
      const oldSlide = foundAdventure.slides[0]

      if (oldSlide.mainImg && oldSlide.mainImg.src)
        orphanedImages.push(oldSlide.mainImg.src)

      if (oldSlide.gallery && Array.isArray(oldSlide.gallery.images)) {
        for (let galleryImg of oldSlide.gallery.images) {
          if (galleryImg.src)
            orphanedImages.push(galleryImg.src)
        }
      }
    }

    // Do the actual doc update
    await adventuresColl.updateOne(
      { _id: adventureIdObj },
      {
        $pull: { slides: { id: slideId } } // Remove the slide with the specified ID
      }
    )

    console.log(`Removed slide '${slideId}' from adventure ${adventureId}${orphanedImages.length > 0 ? ` -- orphaned images: ${orphanedImages.join(", ")}` : ""}`)
    return orphanedImages
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneSlide(adventureId, slideId, props) {
  const adventuresColl = getCollection("adventures"),
        updateDocument = { $set: {}, $unset: {} }

  if (props.intro === "false") {
    updateDocument.$unset = { "slides.$.intro": "" }
    delete props.intro
  }

  for (const prop of Object.keys(props)) {
    const propValue = props[prop]
    let propDbValue;

    if (/true|false/i.test(propValue))
      propDbValue = propValue.toLowerCase() === "true"
    else if (/^[0-9.]+$/.test(propValue))
      propDbValue = parseFloat(propValue)
    else
      propDbValue = propValue

    updateDocument.$set[`slides.$.${prop}`] =  propDbValue
  }

  try {
    await adventuresColl.updateOne(
      {
        _id: new ObjectId(adventureId),
        "slides.id": slideId
      },
      updateDocument
    )
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function insertOneAdventure(data) {
  const adventuresColl = getCollection("adventures")

  try {
    const langs = [data.activeLang || "en"]

    langs.push(...Object.keys(data.multiLangData))

    const adventureDoc = {
      slides: [],
      meta: {
        fallbackLang: data.fallbackLang || langs[0],
        urlPath: data.urlPath.trim().replace(/^\/+|\/+$|\s/g, "").toLowerCase() || "my-adventure",
        title: "meta_title",
        author: {
          madeBy: "meta_author_madeBy",
          content: "meta_author_content"
        }
      },
      messages: langs.reduce((msgs, lang) => {
        const langData = lang === data.activeLang 
                          || Object.keys(data.multiLangData).length < 1 
                          ? data
                          : data.multiLangData[lang]

        msgs[lang] = {
          "meta_title": langData.title || "Adventure",
          "meta_author_madeBy": langData.author || "",
          "meta_author_content": langData.authorText || ""
        }

        return msgs
      }, {})
    }

    const res = await adventuresColl.insertOne(adventureDoc)

    console.log(`An adventure was inserted with the _id: ${res.insertedId}`)
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneAdventure(adventureId, props) {
  const adventuresColl = getCollection("adventures"),
        updateDocument = { $set: {}, $unset: {} }

  for (const prop of Object.keys(props)) {
    const propValue = props[prop]
    let propDbValue;

    if (/true|false/i.test(propValue))
      propDbValue = propValue.toLowerCase() === "true"
    else if (/^[0-9.]+$/.test(propValue))
      propDbValue = parseFloat(propValue)
    else
      propDbValue = propValue

    updateDocument.$set[prop] =  propDbValue
  }

  try {
    await adventuresColl.updateOne(
      {
        _id: new ObjectId(adventureId)
      },
      updateDocument
    )
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneSlideContent(adventureId, slideId, slideContent, locale) {
  const updateDocument = { $set: {} }

  if (slideContent) {
    if (typeof slideContent.headline !== "undefined") {
      updateDocument.$set["slides.$.headline"] = `${slideId}_headline`
      updateDocument.$set[`messages.${locale}.${slideId}_headline`] = slideContent.headline
    }

    if (typeof slideContent.subheadline !== "undefined") {
      updateDocument.$set["slides.$.subheadline"] = `${slideId}_subheadline`
      updateDocument.$set[`messages.${locale}.${slideId}_subheadline`] = slideContent.subheadline
    }

    if (slideContent.content) {
      if (typeof slideContent.content.position !== "undefined")
        updateDocument.$set["slides.$.content.position"] = slideContent.content.position

      if (typeof slideContent.content.text !== "undefined") {
        updateDocument.$set["slides.$.content.text"] = `${slideId}_content`
        updateDocument.$set[`messages.${locale}.${slideId}_content`] = slideContent.content.text
      }
    }
  }

  if (Object.keys(updateDocument.$set).length < 1)
    return

  try {
    const adventuresColl = getCollection("adventures"),
          res = await adventuresColl.updateOne(
            {
              _id: new ObjectId(adventureId),
              "slides.id": slideId
            },
            updateDocument
          )

    if (res.matchedCount !== 1)
      throw new Error(`no slide '${slideId}' in adventure '${adventureId}' to update`)
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneRemoveSlideContent(adventureId, slideId) {
  const adventuresColl = getCollection("adventures"),
        adventureIdObj = new ObjectId(adventureId),
        orphanedImages = []
  
  try {
    // Find the adventure doc by its ID and return only the slide with the specified ID
    const foundAdventure = await adventuresColl.findOne(
      { _id: adventureIdObj, "slides.id": slideId },
      { projection: { "slides.$": 1 } }
    )

    const slideContentTextsAggregate = await adventuresColl.aggregate([
      { $match: { _id: adventureIdObj } },
      { $unwind: "$slides" },
      { $match: { "slides.id": slideId } },
      { 
        $project: slideContentTextModuleFields.reduce((projectDoc, textModuleField) => {
          projectDoc[textModuleField] = 1
          return projectDoc
        }, { "_id": 0 })
      }
    ]).next()

    if (slideContentTextsAggregate)
      await removeTexts(adventuresColl, adventureId, getPrimitiveValues(slideContentTextsAggregate))

    // Collect all gallery images that are referenced in the slide
    if (foundAdventure.slides && foundAdventure.slides.length > 0) {
      const oldSlide = foundAdventure.slides[0]

      if (oldSlide.gallery && Array.isArray(oldSlide.gallery.images)) {
        for (let galleryImg of oldSlide.gallery.images) {
          if (galleryImg.src)
            orphanedImages.push(galleryImg.src)
        }
      }
    }

    // Do the actual doc update
    await adventuresColl.updateOne(
      {
        _id: adventureIdObj,
        "slides.id": slideId
      },
      {
        $unset: {
          "slides.$.headline": "",
          "slides.$.content": "",
          "slides.$.gallery": ""
        }
      }
    )

    console.log(`Removed content of slide '${slideId}' from adventure ${adventureId}${orphanedImages.length > 0 ? ` -- orphaned images: ${orphanedImages.join(", ")}` : ""}`)
    return orphanedImages
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneSlideGallery(adventureId, slideId, galleryProps) {
  const updateDocument = { $set: {} }

  if (galleryProps) {
    if (galleryProps.style)
      updateDocument.$set["slides.$.gallery.style"] = galleryProps.style
  }

  if (Object.keys(updateDocument.$set).length < 1)
    return

  try {
    const adventuresColl = getCollection("adventures"),
          res = await adventuresColl.updateOne({
      _id: new ObjectId(adventureId),
      "slides.id": slideId
    }, updateDocument)

    if (res.matchedCount !== 1)
      throw new Error(`no slide '${slideId}' in adventure '${adventureId}' to update`)
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneSlideGalleryAddImg(adventureId, slideId, imgExt, imgWidth, imgHeight) {
  try {
    const adventuresColl = getCollection("adventures"),
          galleryImgSrc = `${slideId}_gallery-${getRandomId()}${imgExt}`

    await adventuresColl.updateOne({
      _id: new ObjectId(adventureId),
      "slides.id": slideId
    }, {
      $push: {
        "slides.$.gallery.images": {
          src: galleryImgSrc,
          width: imgWidth,
          height: imgHeight
        }
      }
    })

    return galleryImgSrc
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneSlideGalleryAddImgCaption(adventureId, slideId, imgId, captionTextModule) {
  try {
    const adventuresColl = getCollection("adventures"),
          adventureIdObj = new ObjectId(adventureId)

    if (imgId === null) {
      // Main image caption
      await adventuresColl.updateOne({ 
        _id: adventureIdObj,
        "slides.id": slideId
      }, {
        $set: {
          "slides.$.mainImg.caption": captionTextModule
        }
      })
    } else {
      // Gallery image caption
      const imgIdRegex = { $regex: new RegExp(escapeRegExp(imgId)) }

      await adventuresColl.updateOne({ 
        _id: adventureIdObj,
        "slides.id": slideId,
        "slides.gallery.images.src": imgIdRegex
      }, {
        $set: {
          "slides.$[slideElem].gallery.images.$[imageElem].caption": captionTextModule
        }
      }, {
        arrayFilters: [
          { "slideElem.id": slideId},
          { "imageElem.src": imgIdRegex }
        ]
      })
    }
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneSlideGalleryRemoveImg(adventureId, slideId, img) {
  try {
    const adventuresColl = getCollection("adventures"),
          adventureIdObj = new ObjectId(adventureId),
          imgRegex = new RegExp(escapeRegExp(img)),
          captionTextsAggregate = await adventuresColl.aggregate([
            { $match: { _id: adventureIdObj } },
            { $unwind: "$slides" },
            { $match: { "slides.id": slideId }},
            { $unwind: "$slides.gallery.images" },
            { $match: { "slides.gallery.images.src": { $regex: imgRegex } } },
            { $project: { _id: 0, "slides.gallery.images.caption": 1 } }
          ]).next()

    if (captionTextsAggregate)
      await removeTexts(adventuresColl, adventureId, getPrimitiveValues(captionTextsAggregate))

    await adventuresColl.updateOne({
      _id: adventureIdObj,
      "slides.id": slideId
    }, {
      $pull: {
        "slides.$.gallery.images": {
          src: {
            $regex: imgRegex
          }
        }
      }
    })
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneSlideGalleryMoveImg(adventureId, slideId, imageId, direction) {
  try {
    const adventuresColl = getCollection("adventures"),
          adventureIdObj = new ObjectId(adventureId),
          adventure = await adventuresColl.findOne({ 
                        _id: adventureIdObj,
                        "slides.id": slideId
                      },
                      {
                        projection: { "slides.$": 1 }
                      }),
          images = adventure.slides[0] && adventure.slides[0].gallery && adventure.slides[0].gallery.images

    if (images) {
      const imgToMoveRegex = new RegExp(escapeRegExp(imageId)),
            imgToMoveIdx = images.findIndex(img => imgToMoveRegex.test(img.src)),
            neighborimgIdx = imgToMoveIdx + (direction === "prev" ? -1 : 1),
            neighborImg = neighborimgIdx >= 0 && neighborimgIdx < images.length && images[neighborimgIdx]      

      if (neighborImg) {
        images.sort((a, b) => {
          if (a.src === neighborImg.src && imgToMoveRegex.test(b.src))
              return direction === "prev" ? 1 : -1;

          if (b.src === neighborImg.src && imgToMoveRegex.test(a.src))
            return direction === "prev" ? -1 : 1;

          return 0;
        });

        await adventuresColl.updateOne({
          _id: adventureIdObj,
          "slides.id": slideId
        }, {
          $set: {
            "slides.$.gallery.images": images
          }
        })

        console.log(`moved ${imageId} from index ${imgToMoveIdx} to index ${neighborimgIdx} (neighbor image: ${neighborImg && neighborImg.src})`)
      } else {
        throw new Error(`can't move ${imageId} from index ${imgToMoveIdx} to index ${neighborimgIdx} (neighbor image: ${neighborImg && neighborImg.src})`)
      }
    }
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneText(adventureId, textModule, locale, newText) {
  try {
    const adventuresColl = getCollection("adventures"),
          res = await adventuresColl.updateOne({
            _id: new ObjectId(adventureId)
          }, {
            [newText === "" ? "$unset" : "$set"]: {
              [`messages.${locale}.${textModule}`]: newText
            }
          })

    return res.matchedCount > 0
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function findAdventures() {
  const adventuresColl = getCollection("adventures"),
        adventuresCursor = adventuresColl.find()

  try {
    const adventureList = await adventuresCursor.toArray()
    // console.log(`Adventures: ${JSON.stringify(res)}`)
    return adventureList.map(adventure => {
      adventure.id = adventure._id.toHexString()
      delete adventure._id
      return adventure
    });
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function findAdventure(urlPath) {
  const adventuresColl = getCollection("adventures")

  try {
    const adventure = await adventuresColl.findOne({ "meta.urlPath": urlPath } )

    if (adventure == null)
      return null

    adventure.meta.id = adventure._id.toHexString()
    delete adventure._id
    return adventure
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function findAdventureDeploymentPath(adventureId) {
  const adventuresColl = getCollection("adventures")

  try {
    const res = await adventuresColl.findOne(
      { _id: new ObjectId(adventureId) },
      { projection: { "meta.urlPath": 1, _id: 0 } }
    )

    if (res && res.meta && res.meta.urlPath)
      return res.meta.urlPath

    throw new Error(`adventure with ID ${adventureId} not found or it doesn't contain meta.urlPath`)
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function findImgReference(adventureId, imgName) {
  const adventuresColl = getCollection("adventures"),
        imgRegex = new RegExp(`^${escapeRegExp(imgName)}(\\.(jpg|png|gif))?$`)
        
  try {
    return await adventuresColl.countDocuments({
      _id: new ObjectId(adventureId), 
      $or: [
        { "slides.mainImg.src": { $regex: imgRegex } },
        { "slides.gallery.images.src": { $regex: imgRegex } }
      ]
    }) > 0
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}