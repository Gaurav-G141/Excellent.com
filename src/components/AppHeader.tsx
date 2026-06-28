import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MathTools } from './tools/MathTools'
import './AppHeader.css'

/** Simple calculator glyph for the single math-tools button. */
function CalculatorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10" />
      <line x1="12" y1="10" x2="12" y2="10" />
      <line x1="16" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
      <line x1="16" y1="14" x2="16" y2="18" />
      <line x1="8" y1="18" x2="12" y2="18" />
    </svg>
  )
}

interface Props {
  /**
   * Which page the primary link points at. 'interests' (default) shows an
   * "Interests" link to /interests; 'home' shows a "Home" link to / (used on
   * the Interests page itself).
   */
  primaryLink?: 'interests' | 'home'
}

/**
 * Shared top header: wordmark, the primary nav link, the two utility tools
 * (quadratic solver + calculator) as modal overlays, and sign out. Manages its
 * own modal state so any page can drop it in without extra wiring.
 */
export function AppHeader({ primaryLink = 'interests' }: Props) {
  const { signOut } = useAuth()
  const [toolsOpen, setToolsOpen] = useState(false)

  return (
    <header className="home-header">
      <h1>Excellent</h1>
      <div className="home-header-actions">
        {primaryLink === 'home' ? (
          <Link to="/" className="home-interests">
            Home
          </Link>
        ) : (
          <Link to="/interests" className="home-interests">
            Interests
          </Link>
        )}
        <button
          type="button"
          className="home-interests home-tool home-tool-icon"
          aria-label="Calculator"
          title="Calculator"
          onClick={() => setToolsOpen(true)}
        >
          <CalculatorIcon />
        </button>
        <button type="button" className="home-sign-out" onClick={() => signOut()}>
          Sign out
        </button>
      </div>

      <MathTools open={toolsOpen} onClose={() => setToolsOpen(false)} />
    </header>
  )
}
