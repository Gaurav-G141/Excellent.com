import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Calculator } from './tools/Calculator'
import { QuadraticSolver } from './tools/QuadraticSolver'
import './AppHeader.css'

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
  const [quadOpen, setQuadOpen] = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)

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
          className="home-interests home-tool"
          onClick={() => setQuadOpen(true)}
        >
          Quadratic
        </button>
        <button
          type="button"
          className="home-interests home-tool"
          onClick={() => setCalcOpen(true)}
        >
          Calculator
        </button>
        <button type="button" className="home-sign-out" onClick={() => signOut()}>
          Sign out
        </button>
      </div>

      <QuadraticSolver open={quadOpen} onClose={() => setQuadOpen(false)} />
      <Calculator open={calcOpen} onClose={() => setCalcOpen(false)} />
    </header>
  )
}
