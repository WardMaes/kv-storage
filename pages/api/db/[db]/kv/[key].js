import { connectToDatabase, MONGODB_URI } from '../index'

async function findDb(client, name) {
  return new Promise((resolve, reject) => {
    const db = client.db('kv')
    const dbCollection = db.collection('db')
    dbCollection.find({ name }).toArray(function (err, docs) {
      if(err){
        reject(err)
      }
      resolve(docs)
    })
  })
}

async function getValue(client, dbName, key) {
  return new Promise((resolve, reject) => {
    const db = client.db('kv')
    const collection = db.collection('kv')
    collection.find({ db: dbName, key }).toArray(function (err, docs) {
      if(err){
        reject(err)
      }
      resolve(docs)
    })
  })
}

async function addKeyValue(client, dbName, key, value) {
  return new Promise((resolve, reject) => {
    const added = client.db('kv').collection('kv').updateOne(
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
    return res.status(404).send({ error: 'Database does not exist' })
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).send('')
  }

  if (db.secret !== req.headers.authorization) {
    return res.status(401).send({ error: 'Incorrect database secret' })
  }

  if (req.method === 'GET') {
    const [record] = await getValue(client, req.query.db, req.query.key)
    if (!record) {
      return res.status(404).send({ error: 'No value found for key ' + req.query.key })
    }
    return res.json({ value: record.value })
  }

  if (req.method === 'POST') {
    await addKeyValue(
      client,
      req.query.db,
      req.query.key,
      req.body.value
    )
    return res.json({ value: req.body.value })
  }

  return res.status(405).send('Method not allowed')
}
