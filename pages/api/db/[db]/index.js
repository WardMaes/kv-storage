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

export default async function handler(req, res) {
  const client = await connectToDatabase(MONGODB_URI)
  const dbs = await findDb(client, req.query.db)

  if (req.method === 'GET') {
    return dbs && dbs.length
      ? res.json({ db: req.query.db })
      : res.json({ error: 'Database not found' })
  }

  if (req.method === 'POST') {
    if (!dbs || !dbs.length) {
      const newDb = await addDb(client, req.query.db)
      return res.json(newDb)
    } else {
      return res.json({ error: 'Database already exists '})
    }
  }

  return res.json({ error: 'Method not allowed' })
}

async function addDb(client, name) {
  return new Promise((resolve, reject) => {
    const db = client.db('kv')
    const dbCollection = db.collection('db')
    const secret =  Math.random().toString(36).substring(2)
    const added = dbCollection.insertMany([
      {
        name,
        secret,
      },
    ])
    resolve({
      added, name, secret
    })
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
