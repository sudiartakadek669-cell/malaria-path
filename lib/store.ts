'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { BaseRecord } from './types'

const listeners = new Set<() => void>()
const cache = new Map<string, { raw: string | null; data: unknown[] }>()
const EMPTY: unknown[] = []

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

function read(key: string): unknown[] {
  const raw = window.localStorage.getItem(key)
  const cached = cache.get(key)
  if (cached && cached.raw === raw) return cached.data
  let data: unknown[] = []
  try {
    const parsed = raw ? JSON.parse(raw) : []
    data = Array.isArray(parsed) ? parsed : []
  } catch {
    data = []
  }
  cache.set(key, { raw, data })
  return data
}

function write(key: string, data: unknown[]) {
  const raw = JSON.stringify(data)
  window.localStorage.setItem(key, raw)
  cache.set(key, { raw, data })
  listeners.forEach((listener) => listener())
}

export type NewRecord<T extends BaseRecord> = Omit<T, 'id' | 'createdAt'>

export function useCollection<T extends BaseRecord>(key: string) {
  const items = useSyncExternalStore(
    subscribe,
    () => read(key) as T[],
    () => EMPTY as T[],
  )

  const add = useCallback(
    (item: NewRecord<T>) => {
      const record = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      } as T
      write(key, [record, ...(read(key) as T[])])
      return record
    },
    [key],
  )

  const update = useCallback(
    (id: string, patch: Partial<NewRecord<T>>) => {
      write(
        key,
        (read(key) as T[]).map((r) => (r.id === id ? { ...r, ...patch } : r)),
      )
    },
    [key],
  )

  const remove = useCallback(
    (id: string) => {
      write(
        key,
        (read(key) as T[]).filter((r) => r.id !== id),
      )
    },
    [key],
  )

  return { items, add, update, remove }
}
