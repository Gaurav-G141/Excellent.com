export interface Viewport {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export interface DemoSlide {
  id: string
  type: 'demo'
  component: string
  title: string
  body: string
  config: Record<string, unknown>
  ctaLabel?: string
}

export interface ProblemSlide {
  id: string
  type: 'problem'
  component: string
  title: string
  body: string
  config: Record<string, unknown>
  feedback: {
    correct: string
    wrong: string
  }
  attempts: 'unlimited'
}

export type Slide = DemoSlide | ProblemSlide

export interface Lesson {
  id: string
  title: string
  subject: string
  slides: Slide[]
  /** When true, 3 randomized review questions are appended after the slides. */
  appendRandomQuestions?: boolean
}

export interface GraphOption {
  label: string
  x: number
  y: number
}

export type CriticalPointType = 'max' | 'min' | 'critical'

export interface CriticalPointConfig {
  x: number
  type: CriticalPointType
}

export interface RateOfChangeConfig {
  coefficients: number[]
  viewport: Viewport
  animation: { mode: string; durationMs: number; loop: boolean }
  showScrubSlider: boolean
}

export interface GreatestDerivativeConfig {
  viewport: Viewport
  options: GraphOption[]
}

export interface DraggableSecantPoint {
  id: string
  x: number
}

export interface DraggableSecantConfig {
  coefficients: number[]
  viewport: Viewport
  initialPoints: DraggableSecantPoint[]
  coincidentThreshold: number
}

export interface SecantZoomDerivativeConfig {
  coefficients: number[]
  viewport: Viewport
  targetX: number
  /** Second point on the curve for rise/run reading (on minor grid lines). */
  referenceX: number
  minorGridStep?: number
  zoomLevels: number
  tolerance: number
}

export interface LimitSecantDemoConfig {
  coefficients: number[]
  viewport: Viewport
  coincidentThreshold: number
  animationDurationMs: number
  initialAnchorX?: number
}

export interface SecantToTangentConfig {
  coefficients: number[]
  viewport: Viewport
  targetX: number
  initialVariableX: number
  coincidentThreshold: number
  tolerance: number
  minorGridStep?: number
}

export interface HorizontalCriticalConfig {
  coefficients: number[]
  viewport: Viewport
  criticalPoints: CriticalPointConfig[]
  snapThreshold?: number
  initialLineY?: number
}

export interface DerivativeCriticalPointsConfig {
  coefficients: number[]
  viewport: Viewport
  derivativeViewport: Viewport
  criticalPoints: CriticalPointConfig[]
  selectTolerance?: number
}

// --- Lesson 2: Rules of derivatives ---

export interface PowerRuleExponentConfig {
  coefficient: number
  exponent: number
  variable?: string
}

export interface DragMatchPair {
  prompt: string
  answer: string
}

export interface DragMatchConfig {
  pairs: DragMatchPair[]
}

export interface SumRuleConfig {
  coefficientsF: number[]
  coefficientsG: number[]
  viewport: Viewport
  initialX: number
}

export interface TypeInDerivativeConfig {
  /** Expanded coefficients of f(x); the true derivative is computed from these. */
  coefficients: number[]
  /** Human-readable f(x), e.g. "(2x + 1)²". */
  display: string
  prompt?: string
  placeholder?: string
  sampleXs?: number[]
  tolerance?: number
}

export interface ChainRuleConfig {
  outerCoefficients: number[]
  innerCoefficients: number[]
  outerDisplay: string
  innerDisplay: string
  viewport: Viewport
  showGraph?: boolean
}

export interface MeanValueTheoremConfig {
  coefficients: number[]
  viewport: Viewport
  initialAx: number
  initialBx: number
}

export interface MvtMultiPartConfig {
  coefficients: number[]
  viewport: Viewport
  ax: number
  bx: number
  /** Shown to the student so they don't have to read f from the graph. */
  functionDisplay: string
  /** Given derivative equation, e.g. "0.5x". */
  derivativeDisplay: string
  slopeTolerance?: number
  cTolerance?: number
  derivativeTolerance?: number
}
