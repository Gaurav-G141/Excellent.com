import { NavLink } from 'react-router-dom'
import { useCompletedLessons } from '../hooks/useCompletedLessons'
import { APPLICATION_LESSONS } from '../utils/applications'
import { PRACTICE_LESSONS } from '../utils/practice'
import './TabNav.css'

function tabClass({ isActive }: { isActive: boolean }, locked: boolean): string {
  return `app-tab${isActive ? ' app-tab--active' : ''}${locked ? ' app-tab--locked' : ''}`
}

/** Top-level navigation between the Lessons, Practice, Applications, and Scrapbook tabs. */
export function TabNav() {
  const { completed, loading } = useCompletedLessons()

  // A tab is locked until at least one of its lessons has been completed.
  const practiceLocked =
    !loading && !PRACTICE_LESSONS.some((group) => completed.has(group.lessonId))
  const applicationsLocked =
    !loading && !APPLICATION_LESSONS.some((group) => completed.has(group.lessonId))

  return (
    <nav className="app-tabs" aria-label="Primary">
      <NavLink to="/" end className={(state) => tabClass(state, false)}>
        Lessons
      </NavLink>
      <NavLink
        to="/practice"
        className={(state) => tabClass(state, practiceLocked)}
        aria-label={practiceLocked ? 'Practice (locked)' : undefined}
      >
        Practice
        {practiceLocked && (
          <span className="app-tab-lock" aria-hidden="true">
            🔒
          </span>
        )}
      </NavLink>
      <NavLink
        to="/applications"
        className={(state) => tabClass(state, applicationsLocked)}
        aria-label={applicationsLocked ? 'Applications (locked)' : undefined}
      >
        Applications
        {applicationsLocked && (
          <span className="app-tab-lock" aria-hidden="true">
            🔒
          </span>
        )}
      </NavLink>
      <NavLink to="/scrapbook" className={(state) => tabClass(state, false)}>
        Scrapbook
      </NavLink>
    </nav>
  )
}
