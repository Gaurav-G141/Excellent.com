import { useEffect, useState, type CSSProperties } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { STICKER_SIZE_PX, STICKER_SLOT_COUNT } from '../../lib/stickers/config'
import { noteColorFor } from '../../lib/stickers/palette'
import type { StickerItem } from '../../lib/stickers/types'
import { subscribeActiveStickers } from '../../lib/stickers/store'
import './StickerLayer.css'

interface SlotPosition {
  side: 'left' | 'right'
  top: string
  rotate: number
}

/**
 * Ordered scrapbook positions down the side margins, alternating left/right and
 * descending from top to bottom. There must be exactly STICKER_SLOT_COUNT entries
 * so every slotIndex the store can emit maps to a position.
 */
const SLOT_POSITIONS: SlotPosition[] = [
  { side: 'left', top: '8%', rotate: -6 },
  { side: 'right', top: '11%', rotate: 5 },
  { side: 'left', top: '30%', rotate: 4 },
  { side: 'right', top: '34%', rotate: -5 },
  { side: 'left', top: '54%', rotate: -3 },
  { side: 'right', top: '58%', rotate: 7 },
  { side: 'left', top: '76%', rotate: 6 },
  { side: 'right', top: '80%', rotate: -7 },
]

if (SLOT_POSITIONS.length !== STICKER_SLOT_COUNT) {
  throw new Error(
    `SLOT_POSITIONS must have exactly ${STICKER_SLOT_COUNT} entries, got ${SLOT_POSITIONS.length}.`,
  )
}

/** Horizontal inset that tucks a sticker into the gutter beside the 480px column. */
const GUTTER_INSET = `max(8px, calc((100vw - 480px) / 2 - ${STICKER_SIZE_PX}px - 16px))`

/**
 * The pencil + scribble doodle shown on a sticky note while its image loads.
 * Pure SVG/CSS, looping, and quieted under prefers-reduced-motion.
 */
function LoadingDoodle() {
  return (
    <div className="sticker-note__doodle" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="sticker-note__doodle-svg">
        <g className="sticker-note__scribble">
          <path d="M22 64 C 34 50, 46 78, 60 60 S 80 46, 84 60" />
          <path d="M24 44 C 38 34, 52 54, 66 40" />
        </g>
        <g className="sticker-note__pencil">
          <rect x="-2.4" y="-16" width="4.8" height="22" rx="1.4" className="sticker-note__pencil-body" />
          <polygon points="-2.4,6 2.4,6 0,12" className="sticker-note__pencil-tip" />
          <rect x="-2.4" y="-16" width="4.8" height="3.2" rx="1.4" className="sticker-note__pencil-eraser" />
        </g>
      </svg>
    </div>
  )
}

/**
 * A fixed, full-viewport background layer that scatters the signed-in user's
 * earned motivation stickers across the side margins like a scrapbook. It sits
 * behind all page content, never intercepts pointer events, and renders nothing
 * when no user is signed in or no stickers are active.
 *
 * Each sticker shows a pastel sticky note immediately; while its (often slow)
 * image loads, a pencil animates drawing on the note, then the transparent
 * sticker fades in over its note.
 */
export function StickerLayer() {
  const { user } = useAuth()
  const [items, setItems] = useState<StickerItem[]>([])
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set())
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set())

  const uid = user?.uid

  useEffect(() => {
    // Reset per-user view state so a previous account's hidden ids / stickers
    // never leak across a sign-out or account switch.
    setHidden(new Set())
    setLoaded(new Set())
    if (!uid) {
      setItems([])
      return
    }
    const unsubscribe = subscribeActiveStickers(uid, setItems)
    return unsubscribe
  }, [uid])

  if (!user) return null

  return (
    <div className="sticker-layer" aria-hidden="true">
      {items.map((item) => {
        const slot = SLOT_POSITIONS[item.slotIndex]
        if (!slot || hidden.has(item.id)) return null
        const inset = slot.side === 'left' ? { left: GUTTER_INSET } : { right: GUTTER_INSET }
        const note = noteColorFor(item.id)
        const isLoaded = loaded.has(item.id)
        return (
          <div
            key={item.id}
            className="sticker-layer__item"
            style={{
              top: slot.top,
              ...inset,
              width: STICKER_SIZE_PX,
              height: STICKER_SIZE_PX,
              transform: `rotate(${slot.rotate}deg)`,
            }}
          >
            <div
              className={`sticker-note${isLoaded ? ' is-loaded' : ''}`}
              style={
                {
                  '--note-bg': note.bg,
                  '--note-edge': note.edge,
                } as CSSProperties
              }
            >
              {!isLoaded && <LoadingDoodle />}
              <img
                className="sticker-note__img"
                src={item.src}
                alt=""
                aria-hidden="true"
                onLoad={() =>
                  setLoaded((prev) => {
                    const next = new Set(prev)
                    next.add(item.id)
                    return next
                  })
                }
                onError={() =>
                  setHidden((prev) => {
                    const next = new Set(prev)
                    next.add(item.id)
                    return next
                  })
                }
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
