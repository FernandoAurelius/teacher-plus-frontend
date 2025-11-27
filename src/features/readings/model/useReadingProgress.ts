import { computed, ref } from "vue"

import type { ReadingItem } from "./types"

interface ReadingProgressOptions {
  notes?: string
  autoPersist?: boolean
}

interface ReadingProgressSnapshot {
  isRead: boolean
  favorite: boolean
  notes: string
}

export const useReadingProgress = (
  item: ReadingItem,
  options: ReadingProgressOptions = {},
) => {
  const storageKey = `tp_reading_${item.id}`
  const persisted = options.autoPersist ? loadSnapshot(storageKey) : null

  const isRead = ref(persisted?.isRead ?? item.status === "done")
  const favorite = ref(persisted?.favorite ?? item.favorite ?? false)
  const notes = ref(persisted?.notes ?? options.notes ?? "")

  const markDone = () => {
    isRead.value = true
    persist()
  }

  const toggleFavorite = () => {
    favorite.value = !favorite.value
    persist()
  }

  const updateNotes = (value: string) => {
    notes.value = value
    persist()
  }

  const resetNotes = () => {
    notes.value = ""
    persist()
  }

  const snapshot = computed<ReadingProgressSnapshot>(() => ({
    isRead: isRead.value,
    favorite: favorite.value,
    notes: notes.value,
  }))

  const persist = () => {
    if (!options.autoPersist || typeof window === "undefined") return
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot.value))
  }

  return {
    isRead,
    favorite,
    notes,
    markDone,
    toggleFavorite,
    updateNotes,
    resetNotes,
    snapshot,
  }
}

const loadSnapshot = (key: string) => {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { isRead: boolean; favorite: boolean; notes: string }
  } catch {
    return null
  }
}
