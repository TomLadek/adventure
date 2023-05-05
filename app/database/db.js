import { MongoClient, ObjectId } from "mongodb"
import { escapeRegExp } from "../utils-node/utils.js"

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
      for (let lang of messagesLangKeys.keys) {
        messageUnsetDoc[`messages.${lang}.${slideId}`] = ""
      }
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
        title: "meta.title",
        author: {
          madeBy: "meta.author.madeBy",
          content: "meta.author.content"
        }
      },
      messages: langs.reduce((msgs, lang) => {
        const langData = lang === data.activeLang 
                          || Object.keys(data.multiLangData).length < 1 
                          ? data
                          : data.multiLangData[lang]

        msgs[lang] = {
          "meta.title": langData.title || "Adventure",
          "meta.author.madeBy": langData.author || "",
          "meta.author.content": langData.authorText || ""
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
      updateDocument.$set["slides.$.headline"] = `${slideId}.headline`
      updateDocument.$set[`messages.${locale}.${slideId}.headline`] = slideContent.headline
    }

    if (slideContent.content) {
      updateDocument.$set["slides.$.content.text"] = `${slideId}.content`
      updateDocument.$set["slides.$.content.position"] = slideContent.content.position
      updateDocument.$set[`messages.${locale}.${slideId}.content`] = slideContent.content.text
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