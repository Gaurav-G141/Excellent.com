import { describe, it, expect, vi, afterEach } from 'vitest'

import { generateStickerImage } from './generate'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('generateStickerImage: keyless Pollinations image', () => {
  it('resolves to a pollinations URL with model=flux and the encoded subject', async () => {
    const result = await generateStickerImage('red rocket', 'uid1', 'item1')

    expect(result.provider).toBe('pollinations')
    expect(result.src.startsWith('https://image.pollinations.ai/prompt/')).toBe(true)
    expect(result.src).toContain('model=flux')
    expect(result.src).toContain('width=512')
    expect(result.src).toContain('height=512')
    // The subject is embedded in the prompt, which is URL-encoded into the path.
    expect(result.src).toContain(encodeURIComponent('red rocket'))
  })

  it('never makes a network request (no OpenAI / Storage round trip)', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const result = await generateStickerImage('owl', 'uid1', 'item1')

    expect(result.provider).toBe('pollinations')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('produces a distinct seed per call so repeats are not cache-collided', async () => {
    const a = await generateStickerImage('owl', 'uid1', 'item1')
    const b = await generateStickerImage('owl', 'uid1', 'item2')

    const seedOf = (src: string) => new URL(src).searchParams.get('seed')
    expect(seedOf(a.src)).not.toBe(seedOf(b.src))
  })
})
