import { useState, useEffect } from 'react'
import { db } from '../db/database'

export function useConfig() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const c = await db.config.toCollection().first()
      if (!cancelled) setConfig(c || null)
    }

    load()

    function handleChanges() { load() }
    db.config.hook('creating', handleChanges)
    db.config.hook('updating', handleChanges)

    return () => {
      cancelled = true
      db.config.hook('creating').unsubscribe(handleChanges)
      db.config.hook('updating').unsubscribe(handleChanges)
    }
  }, [])

  return config
}
