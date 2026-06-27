import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { subscribeActiveStickers } from '../lib/stickers/store'
import type { StickerItem } from '../lib/stickers/types'

interface StickerContextValue {
  /** The signed-in learner's currently-active (non-expired) stickers. */
  items: StickerItem[]
  /** Ids whose image has been successfully fetched (warmed into cache). */
  loaded: ReadonlySet<string>
}

const StickerContext = createContext<StickerContextValue>({
  items: [],
  loaded: new Set<string>(),
})

/** Active stickers and which of their images are warmed, maintained app-wide. */
export function useStickers(): StickerContextValue {
  return useContext(StickerContext)
}

/** Give a flaky image several chances before giving up on it. */
const MAX_ATTEMPTS = 6
/** Linear backoff base between retries of a failed image. */
const BASE_RETRY_MS = 4000
/** Treat an image that never loads within this window as a failure. */
const LOAD_TIMEOUT_MS = 20000

/** Resolve when `src` loads, reject on error or timeout. Browser-only. */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.onload = null
      img.onerror = null
      reject(new Error('timeout'))
    }, LOAD_TIMEOUT_MS)
    img.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error('error'))
    }
    img.src = src
  })
}

/**
 * Keeps the signed-in learner's active stickers live across the whole app and
 * warms each sticker image in the background, one at a time, with retries.
 *
 * Because this runs on every tab (mounted once at the app root), freshly earned
 * or removed stickers are reflected even while the learner is elsewhere, and the
 * slow Pollinations images are fetched as they're earned instead of all at once
 * when the Scrapbook opens, so the burst that used to get rate-limited (showing
 * only one new sticker per visit) no longer happens.
 */
export function StickerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid

  const [items, setItems] = useState<StickerItem[]>([])
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set())

  // Mirrors of state the async warmer reads without re-subscribing.
  const itemsRef = useRef<StickerItem[]>(items)
  const loadedRef = useRef<ReadonlySet<string>>(loaded)
  useEffect(() => {
    itemsRef.current = items
  }, [items])
  useEffect(() => {
    loadedRef.current = loaded
  }, [loaded])

  // Warmer bookkeeping (kept in refs so it survives renders without retriggers).
  const attempts = useRef<Map<string, number>>(new Map())
  const cooldownUntil = useRef<Map<string, number>>(new Map())
  const givenUp = useRef<Set<string>>(new Set())
  const pumping = useRef(false)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pump = useCallback(async () => {
    if (pumping.current) return
    pumping.current = true
    try {
      // Warm one eligible image at a time so we never burst the image host.
      for (;;) {
        const now = Date.now()
        const pending = itemsRef.current.filter(
          (it) => !loadedRef.current.has(it.id) && !givenUp.current.has(it.id),
        )
        const next = pending.find((it) => (cooldownUntil.current.get(it.id) ?? 0) <= now)
        if (!next) {
          // Nothing eligible right now: schedule a wake-up for the soonest item
          // still in backoff so transient failures eventually retry.
          const soonest = pending
            .map((it) => cooldownUntil.current.get(it.id) ?? 0)
            .filter((t) => t > now)
            .sort((a, b) => a - b)[0]
          if (soonest && retryTimer.current === null) {
            retryTimer.current = setTimeout(() => {
              retryTimer.current = null
              void pump()
            }, Math.max(250, soonest - now))
          }
          break
        }
        try {
          await preloadImage(next.src)
          // Update the ref synchronously so the loop doesn't re-pick this id
          // before React flushes the state update.
          const updated = new Set(loadedRef.current)
          updated.add(next.id)
          loadedRef.current = updated
          setLoaded(updated)
        } catch {
          const n = (attempts.current.get(next.id) ?? 0) + 1
          attempts.current.set(next.id, n)
          if (n >= MAX_ATTEMPTS) {
            givenUp.current.add(next.id)
          } else {
            cooldownUntil.current.set(next.id, Date.now() + BASE_RETRY_MS * n)
          }
        }
      }
    } finally {
      pumping.current = false
    }
  }, [])

  // Subscribe to the live set; reset everything when the account changes.
  useEffect(() => {
    const empty = new Set<string>()
    setItems([])
    setLoaded(empty)
    itemsRef.current = []
    loadedRef.current = empty
    attempts.current.clear()
    cooldownUntil.current.clear()
    givenUp.current.clear()
    if (retryTimer.current !== null) {
      clearTimeout(retryTimer.current)
      retryTimer.current = null
    }
    if (!uid) return
    return subscribeActiveStickers(uid, setItems)
  }, [uid])

  // Warm images whenever the active set changes (new sticker earned, etc.).
  useEffect(() => {
    void pump()
  }, [items, pump])

  // Drop any pending retry timer on unmount.
  useEffect(() => {
    return () => {
      if (retryTimer.current !== null) clearTimeout(retryTimer.current)
    }
  }, [])

  return (
    <StickerContext.Provider value={{ items, loaded }}>{children}</StickerContext.Provider>
  )
}
