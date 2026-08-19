import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type Database = ReturnType<typeof drizzle<typeof schema>>

let instance: Database | undefined

function getDatabase(): Database {
  if (instance) return instance
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required when a request uses the database.')
  }
  instance = drizzle(neon(connectionString), { schema })
  return instance
}

// Next.js imports route modules while building. Defer the Neon connection until
// a request actually performs a database operation so preview builds do not
// require access to the production database.
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const database = getDatabase()
    const value = Reflect.get(database, property)
    return typeof value === 'function' ? value.bind(database) : value
  },
})
