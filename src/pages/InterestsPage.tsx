import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TabNav } from '../components/TabNav'
import { useAuth } from '../contexts/AuthContext'
import { useInterests } from '../hooks/useInterests'
import { MAX_INTEREST_LENGTH, MAX_INTERESTS } from '../lib/interests'
import { ERROR_MESSAGE, moderateInterest } from '../lib/interestsModeration'
import './HomePage.css'
import './PracticePage.css'
import './InterestsPage.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function InterestsPage() {
  const { signOut } = useAuth()
  const { interests, loading, save } = useInterests()

  const [draft, setDraft] = useState<string[]>([])
  const [entry, setEntry] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [hydrated, setHydrated] = useState(false)
  // Safety screening of the pending entry (so problems never get themed around
  // drugs, sex, violence, crime, etc.). `checking` blocks Add while the OpenAI
  // classifier runs; `addError` shows why an entry was rejected or to retry.
  const [checking, setChecking] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Seed the editable draft once the saved interests have loaded.
  useEffect(() => {
    if (!loading && !hydrated) {
      setDraft(interests)
      setHydrated(true)
    }
  }, [loading, hydrated, interests])

  const normalizedDraft = draft.map((d) => d.toLowerCase())
  const trimmedEntry = entry.trim().replace(/\s+/g, ' ')
  const canAdd =
    trimmedEntry.length > 0 &&
    !checking &&
    draft.length < MAX_INTERESTS &&
    !normalizedDraft.includes(trimmedEntry.toLowerCase())

  const dirty = useMemo(
    () => draft.join('\u0000') !== interests.join('\u0000'),
    [draft, interests],
  )

  async function addInterest() {
    if (!canAdd) return
    const candidate = trimmedEntry.slice(0, MAX_INTEREST_LENGTH)
    setAddError(null)
    setChecking(true)
    try {
      const verdict = await moderateInterest(candidate)
      if (verdict.status === 'blocked') {
        setAddError(verdict.reason)
        return
      }
      if (verdict.status === 'error') {
        setAddError(ERROR_MESSAGE)
        return
      }
      // Guard against a list change while the async check was in flight.
      setDraft((prev) =>
        prev.length >= MAX_INTERESTS ||
        prev.some((v) => v.toLowerCase() === candidate.toLowerCase())
          ? prev
          : [...prev, candidate],
      )
      setEntry('')
      setSaveState('idle')
    } finally {
      setChecking(false)
    }
  }

  function removeInterest(value: string) {
    setDraft((prev) => prev.filter((v) => v !== value))
    setSaveState('idle')
  }

  async function handleSave() {
    setSaveState('saving')
    try {
      await save(draft)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Excellent</h1>
        <div className="home-header-actions">
          <Link to="/" className="home-interests">
            Home
          </Link>
          <button type="button" className="home-sign-out" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="home-main">
        <TabNav />

        <div className="practice-intro">
          <h2>Your interests</h2>
          <p>
            Tell us a few things you&apos;re into. We&apos;ll quietly set Applications
            problems in worlds you care about, so the math feels closer to home. This
            never changes the math itself, only the story around it.
          </p>
        </div>

        {loading ? (
          <p className="slide-hint">Loading your interests…</p>
        ) : (
          <section className="interests-editor">
            <div className="interests-input-row">
              <input
                type="text"
                className="interests-input"
                placeholder="e.g. basketball, baking, space, anime"
                value={entry}
                maxLength={MAX_INTEREST_LENGTH}
                onChange={(e) => {
                  setEntry(e.target.value)
                  if (addError) setAddError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void addInterest()
                  }
                }}
                aria-label="Add an interest"
                aria-invalid={addError !== null || undefined}
              />
              <button
                type="button"
                className="slide-cta interests-add"
                onClick={() => void addInterest()}
                disabled={!canAdd}
              >
                {checking ? 'Checking…' : 'Add'}
              </button>
            </div>

            {addError && (
              <p className="interests-add-error" role="alert">
                {addError}
              </p>
            )}

            <p className="interests-count">
              {draft.length} / {MAX_INTERESTS} added
            </p>

            {draft.length === 0 ? (
              <p className="interests-empty">
                No interests yet. Add a few above to personalize your problems.
              </p>
            ) : (
              <div className="interests-chips">
                {draft.map((value) => (
                  <span key={value} className="interests-chip">
                    {value}
                    <button
                      type="button"
                      className="interests-chip-remove"
                      aria-label={`Remove ${value}`}
                      onClick={() => removeInterest(value)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="interests-actions">
              <button
                type="button"
                className="slide-cta"
                onClick={handleSave}
                disabled={!dirty || saveState === 'saving'}
              >
                {saveState === 'saving' ? 'Saving…' : 'Save interests'}
              </button>
              {saveState === 'saved' && !dirty && (
                <span className="interests-status" role="status">
                  Saved
                </span>
              )}
              {saveState === 'error' && (
                <span className="interests-status interests-status--error" role="status">
                  Couldn&apos;t save. Check your connection.
                </span>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
