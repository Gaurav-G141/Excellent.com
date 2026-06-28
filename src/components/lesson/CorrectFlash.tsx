import { useEffect, useRef, useState, type ReactNode } from 'react'
import './CorrectFlash.css'

interface Props {
  active: boolean
  children: ReactNode
}

// Slightly longer than the 0.7s CSS animation so the safety net only fires if
// the `animationend` event never arrives (e.g. animations disabled).
const FLASH_FALLBACK_MS = 900

export function CorrectFlash({ active, children }: Props) {
  const [flash, setFlash] = useState(false)
  const wasActive = useRef(false)

  // Blink once on each rising edge of `active` (false -> true). We deliberately
  // do NOT clear the blink when `active` goes back to false — callers use both
  // momentary and sticky `active`, and tying the reset to `active` is what made
  // the overlay get stuck green.
  useEffect(() => {
    if (active && !wasActive.current) setFlash(true)
    wasActive.current = active
  }, [active])

  // Turn the blink off on a timer keyed to `flash` itself, so toggling `active`
  // can never cancel it. The `animationend` handler below clears it sooner in
  // the normal case; this is just a fallback.
  useEffect(() => {
    if (!flash) return
    const timer = window.setTimeout(() => setFlash(false), FLASH_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [flash])

  return (
    <div
      className={`correct-flash-wrap${flash ? ' correct-flash-wrap--active' : ''}`}
      onAnimationEnd={(e) => {
        if (e.animationName === 'correct-flash') setFlash(false)
      }}
    >
      {children}
    </div>
  )
}
