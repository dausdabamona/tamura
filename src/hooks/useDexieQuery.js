import { useState, useEffect, useCallback } from 'react'
import { db } from '../db/database'

/**
 * Replacement for useLiveQuery that works reliably.
 * Uses Dexie hooks to listen for table changes.
 */
export function useDexieQuery(queryFn, deps = [], tables = []) {
  const [result, setResult] = useState(undefined)

  const stableFn = useCallback(queryFn, deps)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await stableFn()
        if (!cancelled) setResult(data)
      } catch (e) {
        console.error('useDexieQuery error:', e)
      }
    }

    load()

    // Subscribe to changes on listed tables
    const unsubs = []
    for (const tableName of tables) {
      const table = db.table(tableName)
      const handler = () => { load() }
      table.hook('creating', handler)
      table.hook('updating', handler)
      table.hook('deleting', handler)
      unsubs.push(() => {
        table.hook('creating').unsubscribe(handler)
        table.hook('updating').unsubscribe(handler)
        table.hook('deleting').unsubscribe(handler)
      })
    }

    return () => {
      cancelled = true
      unsubs.forEach(fn => fn())
    }
  }, [stableFn])

  return result
}
