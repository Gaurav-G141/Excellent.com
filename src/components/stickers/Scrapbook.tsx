import { type CSSProperties } from 'react'
import { useStickers } from '../../contexts/StickerContext'
import { noteColorFor } from '../../lib/stickers/palette'
import './Scrapbook.css'

/**
 * Gentle per-slot tilt so pasted notes read like a real scrapbook rather than a
 * rigid grid. Indexed by slotIndex; wraps if more slots are ever added.
 */
const SLOT_ROTATIONS = [-6, 5, 4, -5, -3, 7, 6, -7, 3, -4, 2, -2]

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
 * The scrapbook board: the signed-in learner's earned motivation stickers laid
 * out as pasted sticky notes inside the page content.
 *
 * Active stickers and their image-load status come from the app-wide
 * StickerProvider, which warms each image in the background on every tab. The
 * board only renders an image once it has been warmed, so opening this tab never
 * fires its own burst of (rate-limited) image requests; un-warmed notes show the
 * pencil doodle until their drawing is ready.
 */
export function Scrapbook() {
  const { items, loaded } = useStickers()

  if (items.length === 0) {
    return (
      <div className="scrapbook-empty">
        <div className="scrapbook-empty__icon" aria-hidden="true">
          ✎
        </div>
        <h3>Your scrapbook is empty</h3>
        <p>
          Solve problems in the <strong>Applications</strong> tab to earn crayon
          stickers. They get pasted here and fade after a couple of days, so keep
          coming back.
        </p>
      </div>
    )
  }

  return (
    <div className="scrapbook-board" aria-label="Your earned stickers">
      {items.map((item) => {
        const note = noteColorFor(item.id)
        const rotate = SLOT_ROTATIONS[item.slotIndex % SLOT_ROTATIONS.length]
        const isLoaded = loaded.has(item.id)
        return (
          <div
            key={item.id}
            className="scrapbook-cell"
            style={{ transform: `rotate(${rotate}deg)` }}
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
              {isLoaded ? (
                <img className="sticker-note__img" src={item.src} alt="" aria-hidden="true" />
              ) : (
                <LoadingDoodle />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
