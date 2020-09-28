Easy key-value storage. 

## Usage

Create your database at [key-value.vercel.app](https://key-value.vercel.app). 

Install kv 

```bash
npm install @wardmaes/kv
# or
yarn add @wardmaes/kv
```

Create a new database connection  

```js
import kv from '@wardmaes/kv'
const db = new kv('db-name', 'db-secret')
```

Set a value
```js
await db.set('city', 'Chicago')
```

Get a value
```js
const value = await db.get('city') // Chicago
```
