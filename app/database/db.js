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
  client.close().then(() => {
    client = null
  })
}

export function insertOneSlide(data) {
  const slidesColl = getSlidesCollection()        

  const transformedData = data
  
  slidesColl.insertOne(transformedData)
    .then((res) => {
      console.log(`A slide was inserted with the _id: ${res.insertedId}`)
    })
    .catch((reason) =>
      console.error(reason)
    )
    .finally(() => 
      releaseClient()
    )
}

export function findSlides() {
  getSlidesCollection().find().toArray()
    .then((res) => 
      console.log(`Slides: ${JSON.stringify(res)}`)
    )
    .catch((reason) => {
      console.error(reason)
    })
    .finally(() =>
      releaseClient()    
    )
}

async function run() {
  try {
    const database = client.db("testdb");

    // Init collection
    const haikuColl = database.collection("haiku");

    // Create a document and insert it into collection
    // const doc = {
    //   title: "Record of a Shriveled Datum",
    //   content: "No bytes, no problem. Just insert a document, in MongoDB",
    // }
    // const result = await haikuColl.insertOne(doc);
    // console.log(`A document was inserted with the _id: ${result.insertedId}`);

    // Return all inserted documents in the collection
    // const haikus = haikuColl.find();
    // const res = await haikus.toArray();
    // console.log(res)

    // Find a specific document
    // const movies = database.collection('movies');
    // Query for a movie that has the title 'Back to the Future'
    // const query = { title: 'Back to the Future' };
    // const movie = await movies.findOne(query);
    // console.log(movie);

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
// run().catch(console.dir);