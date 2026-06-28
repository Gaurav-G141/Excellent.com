import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Lightweight accessible modal: overlay + centered panel. Closes on backdrop
 * click, the X button, and Escape. Renders nothing when closed so it can never
 * trap input or block the rest of the app while inactive.
 */
export function Modal({ open, title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    // Move focus into the panel for keyboard + screen-reader users.
    panelRef.current?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="tool-modal-overlay"
      // A click that starts and ends on the backdrop (not bubbled from the
      // panel) dismisses the modal.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="tool-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="tool-modal-header">
          <h2 className="tool-modal-title">{title}</h2>
          <button
            type="button"
            className="tool-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="tool-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
