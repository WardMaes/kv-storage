const MongoClient = require('mongodb').MongoClient
export const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sn5pt.mongodb.net/kv`

let cachedClient = null

export async function connectToDatabase(uri) {
  if (!cachedClient) {
    cachedClient = MongoClient.connect(uri)
  }
  return cachedClient
}

export default async function handler(req, res) {
  const client = await connectToDatabase(MONGODB_URI)
  const dbs = await findDb(client, req.query.db)

  if (req.method === 'OPTIONS') {
    return res.status(200).send('')
  }

  if (req.method === 'GET') {
    let authSecret
    // Remove 'Bearer ' from headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      authSecret = req.headers.authorization.slice(7)
    } else {
      authSecret = req.headers.authorization || ''
    }
    if (dbs && dbs.length) {
      if (authSecret !== dbs[0].secret) {
        res.status(401).send({ error: 'Incorrect database secret' })
      }
      return res.json({ db: dbs[0] })
    }
    return res.status(404).send({ error: 'Database not found' })
  }

  if (req.method === 'POST') {
    if (!dbs || !dbs.length) {
      const newDb = await addDb(client, req.query.db)
      return res.json(newDb)
    } else {
      return res.status(409).send({ error: 'Database already exists ' })
    }
  }

  return res.status(405).send('Method not allowed')
}

async function addDb(client, name) {
  return new Promise((resolve, reject) => {
    const db = client.db('kv')
    const dbCollection = db.collection('db')
    const secret = Math.random().toString(36).substring(2)
    const added = dbCollection.insertMany([
      {
        name,
        secret,
      },
    ])
    resolve({
      added,
      name,
      secret,
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
