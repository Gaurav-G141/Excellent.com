import { useEffect, useState, type ReactNode } from 'react'
import './CorrectFlash.css'

interface Props {
  active: boolean
  children: ReactNode
}

export function CorrectFlash({ active, children }: Props) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!active) return
    setFlash(true)
    const timer = window.setTimeout(() => setFlash(false), 700)
    return () => window.clearTimeout(timer)
  }, [active])

  return (
    <div className={`correct-flash-wrap${flash ? ' correct-flash-wrap--active' : ''}`}>
      {children}
    </div>
  )
}
