/**
 * Shared math + isometric-geometry helpers for the "Paper box" lesson.
 *
 * The lesson takes a rectangular sheet of width `W` and length `L`, cuts a
 * square of side `x` from each corner, and folds the flaps up into an open box:
 *
 *   V(x) = x · (W − 2x) · (L − 2x)
 *        = 4x³ − 2(W + L)x² + (W·L)x
 *
 * V′(x) = 12x² − 4(W + L)x + W·L, which is zero at
 *   x = [ (W + L) ± √(W² − W·L + L²) ] / 6.
 * The smaller root is the one that fits a real box (0 < x < min(W,L)/2).
 *
 * All math is computed here so the slides only need the sheet dimensions — no
 * answers live in JSON.
 */

/** Low-to-high coefficients of V(x). */
export function volumeCoefficients(width: number, length: number): number[] {
  return [0, width * length, -2 * (width + length), 4]
}

/** Low-to-high coefficients of V′(x). */
export function volumeDerivativeCoefficients(width: number, length: number): number[] {
  return [width * length, -4 * (width + length), 12]
}

/** Open-box volume for a given corner cut. */
export function boxVolume(width: number, length: number, cut: number): number {
  return cut * (width - 2 * cut) * (length - 2 * cut)
}

/** The two cuts where V′(x) = 0. The first (smaller) one is the real maximum. */
export function volumeCriticalCuts(width: number, length: number): [number, number] {
  const root = Math.sqrt(width * width - width * length + length * length)
  return [(width + length - root) / 6, (width + length + root) / 6]
}

/** The corner cut that maximizes the volume (the smaller critical point). */
export function optimalCut(width: number, length: number): number {
  return volumeCriticalCuts(width, length)[0]
}

/** The maximum achievable volume for the sheet. */
export function maxVolume(width: number, length: number): number {
  return boxVolume(width, length, optimalCut(width, length))
}

/** Format a number: integer when whole, otherwise up to two decimals (no trailing zeros). */
export function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return Number(n.toFixed(2)).toString()
}

// --- Isometric projection -------------------------------------------------

export interface Pt {
  x: number
  y: number
}

export interface ProjectOptions {
  scale: number
  ox: number
  oy: number
}

const ISO_ANGLE = Math.PI / 6 // 30°
const COS = Math.cos(ISO_ANGLE)
const SIN = Math.sin(ISO_ANGLE)

/** Project a point (bx, by on the ground, bz up) into 2D screen space. */
export function isoProject(
  bx: number,
  by: number,
  bz: number,
  { scale, ox, oy }: ProjectOptions,
): Pt {
  return {
    x: ox + (bx - by) * COS * scale,
    y: oy + (bx + by) * SIN * scale - bz * scale,
  }
}

/** Turn screen points into an SVG polygon `points` string. */
export function polyPoints(points: Pt[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}

export type BoxFace = 'floor' | 'back' | 'front'

export interface BoxWall {
  face: BoxFace
  points: Pt[]
}

export interface BoxGeometry {
  floor: Pt[]
  /** Walls in back-to-front draw order (paint these in array order). */
  walls: BoxWall[]
  heightAnchor: Pt
  /** Midpoint of the edge whose length is the base width (W − 2x). */
  widthAnchor: Pt
  /** Midpoint of the edge whose length is the base length (L − 2x). */
  lengthAnchor: Pt
}

/**
 * Build the projected geometry of the folding box for a rectangular base of
 * `baseW` × `baseL` and wall `height`. `fold` in [0, 1] hinges the four flaps
 * from lying flat (0) to standing vertical (1).
 */
export function buildBox(
  baseW: number,
  baseL: number,
  height: number,
  fold: number,
  proj: ProjectOptions,
): BoxGeometry {
  const phi = fold * (Math.PI / 2)
  const out = Math.cos(phi) * height // how far the flap still lies outward
  const up = Math.sin(phi) * height // how high the flap has risen

  const P = (bx: number, by: number, bz: number) => isoProject(bx, by, bz, proj)

  const floor = [P(0, 0, 0), P(baseW, 0, 0), P(baseW, baseL, 0), P(0, baseL, 0)]

  const backLeft: BoxWall = {
    face: 'back',
    points: [P(0, 0, 0), P(0, baseL, 0), P(-out, baseL, up), P(-out, 0, up)],
  }
  const backRight: BoxWall = {
    face: 'back',
    points: [P(0, 0, 0), P(baseW, 0, 0), P(baseW, -out, up), P(0, -out, up)],
  }
  const frontRight: BoxWall = {
    face: 'front',
    points: [
      P(baseW, 0, 0),
      P(baseW, baseL, 0),
      P(baseW + out, baseL, up),
      P(baseW + out, 0, up),
    ],
  }
  const frontLeft: BoxWall = {
    face: 'front',
    points: [
      P(0, baseL, 0),
      P(baseW, baseL, 0),
      P(baseW, baseL + out, up),
      P(0, baseL + out, up),
    ],
  }

  return {
    floor,
    walls: [backLeft, backRight, frontRight, frontLeft],
    heightAnchor: P(baseW, baseL, up / 2),
    widthAnchor: P(baseW / 2, baseL + out, up),
    lengthAnchor: P(baseW + out, baseL / 2, up),
  }
}
