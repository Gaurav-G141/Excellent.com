import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { lessonList } from '../lessons'
import { loadLessonProgress } from '../lib/progress'

interface CompletedLessons {
  /** Ids of lessons the signed-in user has finished. */
  completed: Set<string>
  loading: boolean
}

/**
 * Loads which lessons the current user has completed. Used to gate the Practice
 * and Applications tabs: a topic only unlocks once its lesson is finished, so a
 * brand-new account (no completed lessons) sees everything locked.
 */
export function useCompletedLessons(): CompletedLessons {
  const { user } = useAuth()
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setCompleted(new Set())
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    Promise.all(
      lessonList.map((lesson) =>
        loadLessonProgress(user.uid, lesson.id)
          .then((progress) => (progress?.lessonCompleted ? lesson.id : null))
          .catch(() => null),
      ),
    )
      .then((ids) => {
        if (!active) return
        setCompleted(new Set(ids.filter((id): id is string => id !== null)))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  return { completed, loading }
}
