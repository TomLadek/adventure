import { MongoClient } from "mongodb"

let client

function getSlidesCollection() {
  if (!client)
    client = new MongoClient("mongodb://root:1234@mongodb:27017") // TODO get user/PW/port from environment variables

  return client
          .db("slides")
          .collection("slides")
}

function releaseClient() {
  if (client != null) {
    const oldClient = client
    client = null;
    oldClient.close()
  }
}

export async function insertOneSlide(data) {
  const slidesColl = getSlidesCollection()        

  const transformedData = data
  
  try {
    const res = await slidesColl.insertOne(transformedData)
    console.log(`A slide was inserted with the _id: ${res.insertedId}`)
  } catch(ex) {
    console.error(ex)
  } finally {
    releaseClient()
  }
}

export async function findSlides() {
  const slidesColl = getSlidesCollection(),
        slidesCursor = slidesColl.find()

  try {
    const res = await slidesCursor.toArray()
    // console.log(`Slides: ${JSON.stringify(res)}`)
    return res;
  } catch (ex) {
    console.error(ex)
  } finally {
    releaseClient()    
  }
}