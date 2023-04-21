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

export async function insertOneSlide(adventureId, mainImg) {
  const adventureColl = getCollection("adventures")
  
  const newSlideId = `slide-${Math.floor(Math.random() * 1000)}`,
        newSlide = {
          id: newSlideId,
          mainImg: {
            src: mainImg,
            caption: "NewCaption",
            width: 4080,
            height: 3072
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
  const adventureColl = getCollection("adventures")
  
  try {
    await adventureColl.updateOne(
      { _id: new ObjectId(adventureId) },
      { $pull: { slides: { id: slideId } }}
    )

    console.log(`Removed slide '${slideId}' from adventure ${adventureId}`)
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
        imgRegex = new RegExp(`^${escapeRegExp(imgName)}(\.[a-zA-Z0-9]+)?$`)
        
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