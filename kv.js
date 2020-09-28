const endpoint = 'https://key-value.vercel.app/api'
class kv {
  constructor(dbName, dbSecret) {
    if (!dbName || !dbSecret) {
      throw new Error('Database name and database secret are required')
    }
    this.dbName = dbName
    this.dbSecret = dbSecret
    this._connect()
    // TODO: mock api call to wake up incrementally generated api route /api/db/<dbname>/kv/<key>?
  }

  async _connect() {
    const response = await fetch(endpoint + '/db/' + this.dbName, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.dbSecret,
      },
    })
    const dbValue = await response.json()
    if (dbValue) {
      this.db = dbValue
    }
    return dbValue
  }

  async get(key) {
    if (!key) {
      throw new Error('Key is required')
    }
    if (!this.db) {
      await this._connect()
    }
    const response = await fetch(
      endpoint + '/db/' + this.dbName + '/kv/' + key,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.dbSecret,
        },
      }
    )
    const { value } = await response.json()
    return value
  }

  async set(key, value) {
    if (!key || !value) {
      throw new Error('Key and value are required')
    }
    if (!this.db) {
      await this._connect()
    }
    const response = await fetch(
      endpoint + '/db/' + this.dbName + '/kv/' + key,
      {
        method: 'POST',
        body: JSON.stringify({
          value,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.dbSecret,
        },
      }
    )
    const setValue = await response.json()
    return setValue.value
  }

  // TODO: async delete(key){}
}

module.exports = kv
