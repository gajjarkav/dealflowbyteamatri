"use client"
import { useSyncExternalStore } from "react"
import { mockStore } from "./mockStore"

export function useDataStore() {
  const store = useSyncExternalStore(
    (callback) => mockStore.subscribe(callback),
    () => mockStore,
    () => mockStore
  )

  return store
}
