import { useEffect, useState } from 'react'
import type { Collection } from '@tanstack/db'

export function useCollectionArray<T extends object>(
  collection: Collection<T, any, any, any, any>,
): T[] {
  const [snapshot, setSnapshot] = useState<T[]>(() => collection.toArray as T[])

  useEffect(() => {
    const sub = collection.subscribeChanges(() => {
      setSnapshot(collection.toArray as T[])
    })
    void collection.preload()
    return () => sub.unsubscribe()
  }, [collection])

  return snapshot
}
