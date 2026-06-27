import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { loadInterests, sanitizeInterests, saveInterests } from '../lib/interests'

interface UseInterests {
  interests: string[]
  loading: boolean
  /** Persist a new interest list (sanitized first); updates local state too. */
  save: (next: string[]) => Promise<void>
}

/**
 * Loads and persists the signed-in learner's interests. Used by the Interests
 * page today; exposed as a hook so the Applications problem generator can read
 * the same data when interest-based theming is wired in.
 */
export function useInterests(): UseInterests {
  const { user } = useAuth()
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setInterests([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    loadInterests(user.uid)
      .then((loaded) => {
        if (active) setInterests(loaded)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  const save = useCallback(
    async (next: string[]) => {
      const clean = sanitizeInterests(next)
      // Persist first; only reflect locally on success. If the write throws, the
      // caller's catch shows an error and `interests` stays as-is, so the editor
      // still reads as dirty and the learner can retry without a spurious edit.
      if (user) await saveInterests(user.uid, clean)
      setInterests(clean)
    },
    [user],
  )

  return { interests, loading, save }
}
