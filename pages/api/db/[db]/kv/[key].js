const MongoClient = require('mongodb').MongoClient
const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sn5pt.mongodb.net/kv`

let cachedClient = null

function connectToDatabase(uri) {
  if (cachedClient) {
    return Promise.resolve(cachedClient)
  }
  return MongoClient.connect(uri).then((db) => {
    cachedClient = db
    return cachedClient
  })
}

async function findDb(client, name) {
  return new Promise((resolve, reject) => {
    const db = client.db('kv')
    const dbCollection = db.collection('db')
    dbCollection.find({ name }).toArray(function (err, docs) {
      resolve(docs)
    })
  })
}

async function getValue(client, dbName, key) {
  return new Promise((resolve, reject) => {
    const db = client.db('kv')
    const collection = db.collection('kv')
    collection.find({ db: dbName, key }).toArray(function (err, docs) {
      resolve(docs)
    })
  })
}

async function addKeyValue(client, dbName, key, value) {
  return new Promise((resolve, reject) => {
    const db = client.db('kv')
    const collection = db.collection('kv')
    const added = collection.updateOne(
      { db: dbName, key },
      { $set: { db: dbName, key, value } },
      { upsert: true }
    )
    resolve(added)
  })
}

export default async function handler(req, res) {
  const client = await connectToDatabase(MONGODB_URI)
  const [db] = await findDb(client, req.query.db)

  if (!db) {
    return res.json({ error: 'Database does not exist' })
  }

  if (db.secret !== req.headers.authorization) {
    return res.json({ error: 'incorrect api key' })
  }

  if (req.method === 'GET') {
    const [record] = await getValue(client, req.query.db, req.query.key)
    if (!record) {
      return res.json({ error: 'no value found for key ' + req.query.key })
    }
    return res.json({ value: record.value })
  }

  if (req.method === 'POST') {
    const response = await addKeyValue(
      client,
      req.query.db,
      req.query.key,
      req.body.value
    )
    return res.json({ value: req.body.value })
  }

  return res.json({ error: 'Method not allowed' })
}
