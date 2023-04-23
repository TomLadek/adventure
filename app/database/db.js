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

function releaseClient() {
  if (client != null) {
    const oldClient = client
    client = null;
    oldClient.close()
  }
}

export async function insertOneSlide(adventureId, mainImg, width, height) {
  const adventureColl = getCollection("adventures")
  
  const newSlideId = `slide-${Math.floor(Math.random() * 1000)}`,
        newSlide = {
          id: newSlideId,
          mainImg: {
            src: mainImg,
            caption: "NewCaption",
            width,
            height
          },
          transition: 0,
          headline: "NewHeadline",
          content: {
            text: "NewText",
            position: "top start"
          }
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
  } finally {
    releaseClient()
  }
}

export async function removeOneSlide(adventureId, slideId) {
  const adventureColl = getCollection("adventures"),
        adventureIdObj = new ObjectId(adventureId),
        orphanedImages = []
  
  try {
    const foundAdventure = await adventureColl.findOne(
      { _id: adventureIdObj, "slides.id": slideId },
      { projection: { "slides.$": 1 } }
    )

    if (foundAdventure.slides && foundAdventure.slides.length > 0) {
      const oldSlide = foundAdventure.slides[0]

      if (oldSlide.mainImg && oldSlide.mainImg.src)
        orphanedImages.push(oldSlide.mainImg.src)

      if (oldSlide.gallery && Array.isArray(oldSlide.gallery.images)) {
        orphanedImages.push(...oldSlide.gallery.images.reduce((sources, galleryImg) => {
          if (galleryImg.src)
            sources.push(galleryImg.src)
          return sources
        }, []))
      }
    }

    await adventureColl.updateOne(
      { _id: adventureIdObj },
      { $pull: { slides: { id: slideId } }}
    )

    console.log(`Removed slide '${slideId}' from adventure ${adventureId}${orphanedImages.length > 0 ? ` -- orphaned images: ${orphanedImages.join(", ")}` : ""}`)
    return orphanedImages
  } catch (ex) {
    console.error(ex)
    throw ex
  } finally {
    releaseClient()
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
  } finally {
    releaseClient()
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
  } finally {
    releaseClient()    
  }
}

export async function findAdventure(urlPath) {
  const adventuresColl = getCollection("adventures"),
        adventureCursor = adventuresColl.find({ "meta.basePath": new RegExp(`${escapeRegExp(urlPath)}/?`) } )

  try {
    if (await adventureCursor.hasNext()) {
      const adventure = await adventureCursor.next()
      adventure.meta.id = adventure._id.toHexString()
      delete adventure._id
      return adventure
    } else {
      return null
    }
  } catch (ex) {
    console.error(ex)
    throw ex
  } finally {
    releaseClient()
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
  } finally {
    releaseClient()
  }
}