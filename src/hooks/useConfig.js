import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'

export function useConfig() {
  const config = useLiveQuery(() => db.config.toCollection().first())
  return config
}
