import { useState, useEffect, useCallback } from 'react'
import { WATCHLIST_STORAGE_KEY } from '@/lib/constants'

export type WatchlistItem = {
  id: string
  title: string
  type: 'ENTITY' | 'SIGNAL'
  subtitle?: string
  addedAt: string
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore quota error
    }
  }, [items])

  const isBookmarked = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  )

  const toggleBookmark = useCallback(
    (item: Omit<WatchlistItem, 'addedAt'>) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.id === item.id)
        if (exists) {
          return prev.filter((i) => i.id !== item.id)
        }
        return [{ ...item, addedAt: new Date().toISOString() }, ...prev]
      })
    },
    [],
  )

  const removeBookmark = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return { items, isBookmarked, toggleBookmark, removeBookmark }
}
