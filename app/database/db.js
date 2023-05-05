import { MongoClient, ObjectId } from "mongodb"
import { escapeRegExp, getPrimitiveValues } from "../utils-node/utils.js"

const slideTextModuleFields = [
  "slides.headline",
  "slides.subheadline",
  "slides.content.text",
  "slides.mainImg.caption",
  "slides.gallery.images.caption"
]

const textModuleFields = [
  "meta.title",
  "meta.desc",
  "meta.author.madeby",
  "meta.author.content"
].concat(slideTextModuleFields)

let client

function getCollection(type) {
  if (!client)
    client = new MongoClient("mongodb://root:1234@mongodb:27017") // TODO get user/PW/port from environment variables

  return client
          .db("adventuredb")
          .collection(type)
}

export async function closeDb() {
  if (client != null) {
    await client.close()
    console.log("db connection closed")
  }
}

export async function insertOneSlide(adventureId, mainImg, width, height) {
  const adventureColl = getCollection("adventures")
  
  const newSlideId = `slide-${Math.floor(Math.random() * 1000)}`,
        newSlide = {
          id: newSlideId,
          mainImg: {
            src: mainImg,
            width,
            height
          },
          transition: 0
        }

  try {
    await adventureColl.updateOne(
      { _id: new ObjectId(adventureId) },
      { $push: { slides: newSlide } }
    )

    console.log(`Inserted slide '${newSlideId}' into adventure ${adventureId}`)

    return newSlideId
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function removeOneSlide(adventureId, slideId) {
  const adventureColl = getCollection("adventures"),
        adventureIdObj = new ObjectId(adventureId),
        messageUnsetDoc = {},
        orphanedImages = []
  
  try {
    // Find the adventure doc by its ID and return only the slide with the specified ID
    const foundAdventure = await adventureColl.findOne(
      { _id: adventureIdObj, "slides.id": slideId },
      { projection: { "slides.$": 1 } }
    )

    // Find all available locales (keys in the 'messages' doc) in the adventure doc
    const messagesLangKeys = await adventureColl.aggregate([
      { $match: { _id: adventureIdObj } },
      { 
        $project: {
          "arrayofkeyvalue": {
            $objectToArray: "$$ROOT.messages"
          }
        }
      },
      { $project: { keys: "$arrayofkeyvalue.k" } }
    ]).next()

    // Construct an $unset doc to remove all messages referenced in that slide
    if (messagesLangKeys && messagesLangKeys.keys) {
      const projectDoc = slideTextModuleFields.reduce((projectDoc, textModuleField) => {
        projectDoc[textModuleField] = 1
        return projectDoc
      }, { "_id": 0 })

      const slideTextsAggregate = await adventureColl.aggregate([
        {
          $match: { _id: new ObjectId(adventureId) }
        },
        {
          $unwind: "$slides"
        },
        {
          $match: { "slides.id": slideId }
        },
        {
          $project: projectDoc
        }
      ]).next()

      for (let lang of messagesLangKeys.keys) {
        for (let usedText of getPrimitiveValues(slideTextsAggregate))
          messageUnsetDoc[`messages.${lang}.${usedText}`] = ""
      }

      console.log(`removing texts: ${Object.keys(messageUnsetDoc).join(', ')}`)
    }

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
    await adventureColl.updateOne(
      { _id: adventureIdObj },
      {
        $pull: { slides: { id: slideId } }, // Remove the slide with the specified ID
        $unset: messageUnsetDoc // Remove all messages referenced in the slide with the specified ID
      }
    )

    console.log(`Removed slide '${slideId}' from adventure ${adventureId}${orphanedImages.length > 0 ? ` -- orphaned images: ${orphanedImages.join(", ")}` : ""}`)
    return orphanedImages
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function insertOneAdventure(data) {
  const adventureColl = getCollection("adventures")

  try {
    const langs = [data.activeLang || "en"]

    langs.push(...Object.keys(data.multiLangData))

    const adventureDoc = {
      slides: [],
      meta: {
        basePath: "/" + (data.urlPath.replace(/^\/+/, "") || "adventure"),
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

    const res = await adventureColl.insertOne(adventureDoc)

    console.log(`An adventure was inserted with the _id: ${res.insertedId}`)
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

export async function updateOneSlideContent(adventureId, slideId, slideContent, locale) {
  const updateDocument = { $set: {} }

  if (slideContent) {
    if (slideContent.headline) {
      updateDocument.$set["slides.$.headline"] = `${slideId}_headline`
      updateDocument.$set[`messages.${locale}.${slideId}_headline`] = slideContent.headline
    }

    if (slideContent.content) {
      updateDocument.$set["slides.$.content.text"] = `${slideId}_content`
      updateDocument.$set["slides.$.content.position"] = slideContent.content.position
      updateDocument.$set[`messages.${locale}.${slideId}_content`] = slideContent.content.text
    }
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

export async function updateOneText(adventureId, textModule, locale, newText) {
  try {
    const adventuresColl = getCollection("adventures"),
          res = await adventuresColl.updateOne({
            _id: new ObjectId(adventureId)
          }, {
            $set: {
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
    const adventure = await adventuresColl.findOne({ "meta.basePath": new RegExp(`${escapeRegExp(urlPath)}/?`) } )

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