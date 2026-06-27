import { useEffect, useRef, useState } from 'react'
import type { DemoSlide } from '../../types/lesson'
import { useTween } from '../../hooks/useTween'
import { easeOutQuint } from '../../utils/easing'
import {
  boxVolume,
  buildBox,
  fmt,
  polyPoints,
  type Pt,
  type ProjectOptions,
} from './paperBox'
import './PaperBox.css'

export interface PaperBoxExplorerConfig {
  /** Sheet width and length, in `unit`. */
  width: number
  length: number
  unit?: string
  initialCut?: number
}

interface Props {
  slide: DemoSlide
  onContinue: () => void
}

type Phase = 'idle' | 'marks' | 'cutting' | 'folding' | 'done'

// One fixed coordinate space for the whole animation — the <svg> never changes
// size, so swapping between the flat paper and the folded box can't collapse the
// layout or blank the stage.
const VIEW_W = 320
const VIEW_H = 300
const CUTS = 8

// Top-down paper placement (portrait sheet).
const PAPER_H = 208
const TOP = 22

// Isometric projection for the folded box.
const ISO_PROJ: ProjectOptions = { scale: 8, ox: 162, oy: 96 }

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0)

interface Segment {
  a: Pt // start, on the paper edge
  b: Pt // end, at the inner corner
}

export function PaperBoxExplorerSlide({ slide, onContinue }: Props) {
  const config = slide.config as unknown as PaperBoxExplorerConfig
  const { width: W, length: L, unit = 'in', initialCut = 1 } = config

  const s = PAPER_H / L
  const paperW = W * s
  const originX = (VIEW_W - paperW) / 2
  const sx = (bx: number) => originX + bx * s
  const sy = (by: number) => TOP + by * s

  const maxCut = Math.floor((Math.min(W, L) / 2 - 0.25) * 4) / 4

  const [cut, setCut] = useState(initialCut)
  const [phase, setPhase] = useState<Phase>('idle')
  const [cutProgress, setCutProgress] = useState(0)
  const [foldProgress, setFoldProgress] = useState(0)
  const [best, setBest] = useState<{ cut: number; volume: number } | null>(null)

  const marksTimer = useRef<number | null>(null)

  const fold = useTween(
    1500,
    (t) => setFoldProgress(easeOutQuint(t)),
    () => {
      setFoldProgress(1)
      setPhase('done')
      setBest((prev) => {
        const volume = boxVolume(W, L, cut)
        return !prev || volume > prev.volume ? { cut, volume } : prev
      })
    },
  )

  // One distinct cut at a time: 8 corner edges, ~340 ms each.
  const cutTween = useTween(
    CUTS * 340,
    (t) => setCutProgress(t),
    () => {
      setCutProgress(1)
      setPhase('folding')
      fold.play()
    },
  )

  useEffect(
    () => () => {
      if (marksTimer.current !== null) window.clearTimeout(marksTimer.current)
    },
    [],
  )

  function startFold() {
    if (phase !== 'idle') return
    setCutProgress(0)
    setFoldProgress(0)
    setPhase('marks')
    marksTimer.current = window.setTimeout(() => {
      setPhase('cutting')
      cutTween.play()
    }, 650)
  }

  function reset() {
    cutTween.stop()
    fold.stop()
    if (marksTimer.current !== null) window.clearTimeout(marksTimer.current)
    setCutProgress(0)
    setFoldProgress(0)
    setPhase('idle')
  }

  const baseW = W - 2 * cut
  const baseL = L - 2 * cut
  const volume = boxVolume(W, L, cut)

  // --- Flat paper geometry -------------------------------------------------

  // Corner squares (top-left origin), ordered TL, TR, BR, BL.
  const cornerRects = [
    { x: 0, y: 0 },
    { x: W - cut, y: 0 },
    { x: W - cut, y: L - cut },
    { x: 0, y: L - cut },
  ]

  // The 8 cut edges, two per corner, in cutting order.
  const segments: Segment[] = [
    { a: { x: cut, y: 0 }, b: { x: cut, y: cut } },
    { a: { x: 0, y: cut }, b: { x: cut, y: cut } },
    { a: { x: W - cut, y: 0 }, b: { x: W - cut, y: cut } },
    { a: { x: W, y: cut }, b: { x: W - cut, y: cut } },
    { a: { x: W - cut, y: L }, b: { x: W - cut, y: L - cut } },
    { a: { x: W, y: L - cut }, b: { x: W - cut, y: L - cut } },
    { a: { x: cut, y: L }, b: { x: cut, y: L - cut } },
    { a: { x: 0, y: L - cut }, b: { x: cut, y: L - cut } },
  ]

  const cp = clamp01(cutProgress)
  const completedCuts = cp >= 1 ? CUTS : Math.floor(cp * CUTS)
  const activeIndex = Math.min(CUTS - 1, Math.floor(cp * CUTS))
  const activeLocal = clamp01(cp * CUTS - activeIndex)

  const cutFraction = (j: number) =>
    j < completedCuts ? 1 : j === activeIndex && phase === 'cutting' ? activeLocal : 0
  const cornerRemoved = (k: number) => completedCuts >= 2 * k + 2

  const activeSeg = segments[activeIndex] ?? segments[0]
  const aS = { x: sx(activeSeg.a.x), y: sy(activeSeg.a.y) }
  const bS = { x: sx(activeSeg.b.x), y: sy(activeSeg.b.y) }
  const scissorPos = {
    x: aS.x + (bS.x - aS.x) * activeLocal,
    y: aS.y + (bS.y - aS.y) * activeLocal,
  }

  // College-ruled paper: blue horizontal rules at 9/32" + a red left margin.
  const RULE_SPACING = 0.28125
  const MARGIN_X = 1.25
  const ruleYs: number[] = []
  for (let v = RULE_SPACING; v < L; v += RULE_SPACING) ruleYs.push(v)

  // --- Folded box geometry (same SVG, fixed projection) --------------------

  const box = buildBox(Math.max(0, baseW), Math.max(0, baseL), Math.max(0, cut), clamp01(foldProgress), ISO_PROJ)

  // Crossfade: paper visible until folding starts, box fades in as it folds.
  const showingBox = phase === 'folding' || phase === 'done'
  const paperOpacity = showingBox ? 0 : 1
  const boxOpacity = showingBox ? 1 : 0

  const showMarks = phase === 'marks' || phase === 'cutting'

  return (
    <>
      <div className="slide-copy">
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <div className="pb-stage">
        <svg
          className="pb-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label="A sheet of 8.5 by 11 inch college-ruled paper being cut and folded into a box"
        >
          {/* ---- Flat paper layer ---- */}
          <g className="pb-layer" style={{ opacity: paperOpacity }}>
            <rect className="pb-paper" x={originX} y={TOP} width={paperW} height={PAPER_H} rx={2} />

            {ruleYs.map((v) => (
              <line
                key={`rule-${v}`}
                className="pb-rule"
                x1={originX}
                y1={sy(v)}
                x2={originX + paperW}
                y2={sy(v)}
              />
            ))}
            <line
              className="pb-margin-line"
              x1={sx(MARGIN_X)}
              y1={TOP}
              x2={sx(MARGIN_X)}
              y2={TOP + PAPER_H}
            />

            {cornerRects.map((c, k) =>
              cornerRemoved(k) ? (
                <rect
                  key={`cut-${k}`}
                  className="pb-corner-cut"
                  x={sx(c.x)}
                  y={sy(c.y)}
                  width={cut * s}
                  height={cut * s}
                />
              ) : (
                <rect
                  key={`prev-${k}`}
                  className="pb-corner-preview"
                  x={sx(c.x)}
                  y={sy(c.y)}
                  width={cut * s}
                  height={cut * s}
                />
              ),
            )}

            {showMarks &&
              segments.map((seg, j) =>
                cutFraction(j) < 1 && !cornerRemoved(Math.floor(j / 2)) ? (
                  <line
                    key={`guide-${j}`}
                    className="pb-cut-guide"
                    x1={sx(seg.a.x)}
                    y1={sy(seg.a.y)}
                    x2={sx(seg.b.x)}
                    y2={sy(seg.b.y)}
                  />
                ) : null,
              )}

            {phase === 'cutting' &&
              segments.map((seg, j) => {
                const f = cutFraction(j)
                if (f <= 0 || cornerRemoved(Math.floor(j / 2))) return null
                const x1 = sx(seg.a.x)
                const y1 = sy(seg.a.y)
                return (
                  <line
                    key={`cut-line-${j}`}
                    className="pb-cut-line"
                    x1={x1}
                    y1={y1}
                    x2={x1 + (sx(seg.b.x) - x1) * f}
                    y2={y1 + (sy(seg.b.y) - y1) * f}
                  />
                )
              })}

            {phase === 'cutting' && (
              <text
                className="pb-scissor"
                x={scissorPos.x}
                y={scissorPos.y}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {'\u2702\uFE0F'}
              </text>
            )}

            <text className="pb-dim-text" x={originX + paperW / 2} y={TOP + PAPER_H + 16}>
              {fmt(W)} {unit}
            </text>
            <text
              className="pb-dim-text"
              x={originX - 10}
              y={TOP + PAPER_H / 2}
              transform={`rotate(-90 ${originX - 10} ${TOP + PAPER_H / 2})`}
            >
              {fmt(L)} {unit}
            </text>
          </g>

          {/* ---- Folded box layer ---- */}
          <g className="pb-layer" style={{ opacity: boxOpacity }}>
            <polygon className="pb-floor" points={polyPoints(box.floor)} />
            {box.walls.map((wall, i) => (
              <polygon
                key={i}
                className={`pb-wall pb-wall--${wall.face}`}
                points={polyPoints(wall.points)}
              />
            ))}
            {phase === 'done' && (
              <>
                <text className="pb-dim-label" x={box.heightAnchor.x + 8} y={box.heightAnchor.y + 4}>
                  {fmt(cut)} {unit}
                </text>
                <text
                  className="pb-dim-label pb-dim-label--center"
                  x={box.widthAnchor.x - 6}
                  y={box.widthAnchor.y - 6}
                >
                  {fmt(baseW)}
                </text>
                <text
                  className="pb-dim-label pb-dim-label--center"
                  x={box.lengthAnchor.x + 6}
                  y={box.lengthAnchor.y - 6}
                >
                  {fmt(baseL)}
                </text>
              </>
            )}
          </g>
        </svg>

        {phase === 'done' ? (
          <div className="pb-readout">
            <span className="pb-readout-volume">
              Volume = {fmt(volume)} {unit}³
            </span>
            <span className="pb-readout-sub">
              base {fmt(baseW)} × {fmt(baseL)} {unit}, height {fmt(cut)} {unit}
            </span>
            {best && (
              <span className="pb-best">
                Best so far: {fmt(best.volume)} {unit}³ at a {fmt(best.cut)} {unit} cut
              </span>
            )}
          </div>
        ) : (
          <div className="pb-readout">
            <span className="pb-readout-sub">Corner cut</span>
            <span className="pb-readout-volume">
              x = {fmt(cut)} {unit}
            </span>
            {best && (
              <span className="pb-best">
                Best so far: {fmt(best.volume)} {unit}³ at a {fmt(best.cut)} {unit} cut
              </span>
            )}
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <div className="slide-scrubber">
          <label htmlFor="pb-cut">
            Size of each corner square: {fmt(cut)} {unit}
          </label>
          <input
            id="pb-cut"
            type="range"
            min={0.25}
            max={maxCut}
            step={0.25}
            value={cut}
            onChange={(e) => setCut(Number(e.target.value))}
          />
        </div>
      )}

      <p className="pb-hint">
        {phase === 'idle' && best === null && 'Pick a corner size, then cut and fold it into a box.'}
        {phase === 'idle' && best !== null && 'Try another size — can you beat your best volume?'}
        {phase === 'marks' && 'Marking the eight cuts…'}
        {phase === 'cutting' && `Cutting corner ${Math.min(4, Math.floor(completedCuts / 2) + 1)} of 4…`}
        {phase === 'folding' && 'Folding the sides up…'}
        {phase === 'done' && 'Play around — where is the volume the highest?'}
      </p>

      <div className="pb-actions">
        {phase === 'idle' && (
          <button type="button" className="slide-cta" onClick={startFold}>
            {'\u2702\uFE0F'} Cut &amp; fold
          </button>
        )}
        {(phase === 'marks' || phase === 'cutting' || phase === 'folding') && (
          <button type="button" className="slide-cta" disabled>
            Working…
          </button>
        )}
        {phase === 'done' && (
          <button type="button" className="slide-secondary-cta" onClick={reset}>
            Fold another
          </button>
        )}
        {(phase === 'done' || (phase === 'idle' && best !== null)) && (
          <button type="button" className="slide-cta" onClick={onContinue}>
            {slide.ctaLabel ?? 'Continue'}
          </button>
        )}
      </div>
    </>
  )
}
