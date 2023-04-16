import { MongoClient } from "mongodb"

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

export async function insertOneSlide(data) {
  const slidesColl = getCollection("slides")
  
  const transformedData = data

  try {
    const res = await slidesColl.insertOne(transformedData)
    console.log(`A slide was inserted with the _id: ${res.insertedId}`)
  } catch(ex) {
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
  } catch(ex) {
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
    const res = await adventuresCursor.toArray()
    // console.log(`Adventures: ${JSON.stringify(res)}`)
    return res.map(value => {
      value.id = value._id.toHexString()
      delete value._id
      return value
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
        adventureCursor = adventuresColl.find({ "meta.basePath": new RegExp(`${urlPath}/?`) } )

  try {
    if (await adventureCursor.hasNext()) {
      return await adventureCursor.next()
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