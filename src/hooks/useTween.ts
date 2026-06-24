import { useCallback, useEffect, useRef, useState } from 'react'

interface RunToken {
  id: number
  run: boolean
}

/**
 * Drives a time-based animation with a clean RAF lifecycle.
 *
 * - `play()` (re)starts the tween from t=0, even if it is already playing
 *   (the previous frame is cancelled first via the effect cleanup).
 * - `stop()` halts it (e.g. when the user grabs a slider).
 * - The RAF is always cancelled on unmount, so callbacks never fire on an
 *   unmounted component.
 *
 * `onProgress` receives a normalized t in [0, 1]; apply easing in the callback.
 */
export function useTween(
  durationMs: number,
  onProgress: (t: number) => void,
  onDone?: () => void,
): { play: () => void; stop: () => void; playing: boolean } {
  const [token, setToken] = useState<RunToken>({ id: 0, run: false })
  const [playing, setPlaying] = useState(false)

  const progressRef = useRef(onProgress)
  progressRef.current = onProgress
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!token.run) {
      setPlaying(false)
      return
    }
    setPlaying(true)
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      progressRef.current(t)
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setPlaying(false)
        doneRef.current?.()
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [token, durationMs])

  const play = useCallback(() => setToken((prev) => ({ id: prev.id + 1, run: true })), [])
  const stop = useCallback(() => setToken((prev) => ({ id: prev.id + 1, run: false })), [])

  return { play, stop, playing }
}
