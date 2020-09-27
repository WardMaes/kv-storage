import { useState } from 'react'
import Head from 'next/head'

// TODO: add loading state
// TODO: add docs

export default function Home() {
  const [dbName, setDbName] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSecret('')
    const response = await fetch('/api/db/' + dbName, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
    })
    const { error, secret } = await response.json()

    if (error) {
      setError(
        'Database already exists. \nPick a different name for your database.'
      )
    } else {
      setSecret(secret)
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Key Value</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="w-full max-w-xs">
          <form
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="dbName"
              >
                Database name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="dbName"
                type="text"
                placeholder="My awesome database"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <p className="text-red-500 text-xs italic">{error}</p>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
              >
                Create
              </button>
            </div>
          </form>
        </div>
        {secret && (
          <div>
            <div
              className="bg-blue-500 text-white text-sm px-4 py-3"
              role="alert"
            >
              <p>
                Database <span className="italic font-bold">{dbName}</span>{' '}
                created!
              </p>
              <p>
                Secret: <span className="font-bold italic">{secret}</span>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
