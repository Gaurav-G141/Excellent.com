/**
 * Loads and adapts the current learner's Applications-tab difficulty rating.
 *
 * On mount it hydrates from Firestore (falling back to the in-memory initial
 * state when signed out, offline, or on error). `applyOutcome` advances the
 * rating with the Elo-style engine and best-effort persists the new state.
 * Mirrors the structure of src/hooks/useCompletedLessons.ts.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { loadApplicationsLevel, saveApplicationsLevel } from '../lib/applicationsLevel'
import {
  clampRating,
  INITIAL_STATE,
  levelFromRating,
  nextRating,
  type Outcome,
  type RatingState,
} from '../utils/applications/difficulty'

export interface ApplicationsLevel {
  state: RatingState
  level: number
  loading: boolean
  /** Advance + persist the rating; returns the new state so callers can react
   *  synchronously (e.g. buffer the next problem at the updated level). */
  applyOutcome: (outcome: Outcome) => RatingState
  // TESTING ONLY — jump straight to a chosen level (1..15). Remove together
  // with the level controls in ApplicationsPage.tsx.
  setLevelForTesting: (level: number) => RatingState
}

export function useApplicationsLevel(): ApplicationsLevel {
  const { user } = useAuth()
  const [state, setState] = useState<RatingState>(INITIAL_STATE)
  const [loading, setLoading] = useState(true)

  // Mirrors `state` so applyOutcome always reads the latest without being
  // recreated on every change.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Serializes persistence so a slower earlier save can't clobber a newer one.
  const saveChain = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    if (!user) {
      setState(INITIAL_STATE)
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    loadApplicationsLevel(user.uid)
      .then((loaded) => {
        if (!active) return
        setState(loaded ?? INITIAL_STATE)
      })
      .catch(() => {
        if (active) setState(INITIAL_STATE)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  const applyOutcome = useCallback(
    (outcome: Outcome): RatingState => {
      const next = nextRating(stateRef.current, outcome)
      stateRef.current = next
      setState(next)
      if (user) {
        const uid = user.uid
        saveChain.current = saveChain.current
          .catch(() => {})
          .then(() => saveApplicationsLevel(uid, next))
          .catch(() => {})
      }
      return next
    },
    [user],
  )

  // TESTING ONLY — force the rating to a specific level so the difficulty can be
  // inspected directly. Persists like a normal update. Remove with the controls
  // in ApplicationsPage.tsx.
  const setLevelForTesting = useCallback(
    (level: number): RatingState => {
      const next: RatingState = {
        rating: clampRating(level),
        games: stateRef.current.games,
      }
      stateRef.current = next
      setState(next)
      if (user) {
        const uid = user.uid
        saveChain.current = saveChain.current
          .catch(() => {})
          .then(() => saveApplicationsLevel(uid, next))
          .catch(() => {})
      }
      return next
    },
    [user],
  )

  return {
    state,
    level: levelFromRating(state.rating),
    loading,
    applyOutcome,
    setLevelForTesting,
  }
}
