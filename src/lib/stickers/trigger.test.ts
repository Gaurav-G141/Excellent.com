import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import type { WordProblem } from '../../utils/applications/types'
import type { StickerItem } from './types'

// Mock the collaborators so this is a pure unit test of the slot/eviction logic.
const mocks = vi.hoisted(() => ({
  resolveSubject: vi.fn(),
  generateStickerImage: vi.fn(),
  getActiveStickers: vi.fn(),
  addSticker: vi.fn(),
  deleteSticker: vi.fn(),
  removeRandomSticker: vi.fn(),
}))

vi.mock('./catalog', () => ({ resolveSubject: mocks.resolveSubject }))
vi.mock('./generate', () => ({ generateStickerImage: mocks.generateStickerImage }))
vi.mock('./store', () => ({
  getActiveStickers: mocks.getActiveStickers,
  addSticker: mocks.addSticker,
  deleteSticker: mocks.deleteSticker,
  removeRandomSticker: mocks.removeRandomSticker,
}))

import { loseStickers, maybeSpawnSticker } from './trigger'
import { STICKER_SLOT_COUNT } from './config'

// ── Fixtures ─────────────────────────────────────────────────────────────────
function makeProblem(): WordProblem {
  return {
    id: 'p1',
    topicId: 'a1-fastest',
    title: 'Concert ticket sales',
    prompt: 'A scenario.',
    hint: 'A nudge.',
    fields: [],
  }
}

function makeItem(
  slotIndex: number,
  createdAt: number,
  over: Partial<StickerItem> = {},
): StickerItem {
  return {
    id: `id-${slotIndex}`,
    subject: 'owl',
    src: 'https://img.example/owl.png',
    provider: 'pollinations',
    slotIndex,
    createdAt,
    expiresAt: Date.now() + 60_000,
    ...over,
  }
}

function lastAddedItem(): StickerItem {
  const calls = mocks.addSticker.mock.calls
  return calls[calls.length - 1][1] as StickerItem
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.resolveSubject.mockReturnValue('trophy')
  mocks.generateStickerImage.mockResolvedValue({ src: 'https://img.example/x.png', provider: 'pollinations' })
  mocks.getActiveStickers.mockResolvedValue([])
  mocks.addSticker.mockResolvedValue(undefined)
  mocks.deleteSticker.mockResolvedValue(undefined)
  mocks.removeRandomSticker.mockResolvedValue(true)
  // SPAWN_CHANCE is 1; any random value < 1 spawns. Pin it for determinism.
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('maybeSpawnSticker: slot assignment', () => {
  it('assigns slot 0 when there are no active stickers', async () => {
    mocks.getActiveStickers.mockResolvedValue([])

    await maybeSpawnSticker(makeProblem(), 'uid1')

    expect(mocks.addSticker).toHaveBeenCalledTimes(1)
    expect(lastAddedItem().slotIndex).toBe(0)
    expect(mocks.deleteSticker).not.toHaveBeenCalled()
  })

  it('picks the smallest free slot (1 when [0,2] are taken)', async () => {
    mocks.getActiveStickers.mockResolvedValue([makeItem(0, 10), makeItem(2, 20)])

    await maybeSpawnSticker(makeProblem(), 'uid1')

    expect(lastAddedItem().slotIndex).toBe(1)
    expect(mocks.deleteSticker).not.toHaveBeenCalled()
  })

  it('evicts the oldest sticker and reuses its slot when all 8 are full', async () => {
    const actives: StickerItem[] = []
    for (let slot = 0; slot < STICKER_SLOT_COUNT; slot++) {
      // Make slot 3 the oldest (smallest createdAt).
      const createdAt = slot === 3 ? 100 : 1000 + slot
      actives.push(makeItem(slot, createdAt))
    }
    mocks.getActiveStickers.mockResolvedValue(actives)

    await maybeSpawnSticker(makeProblem(), 'uid1')

    expect(mocks.deleteSticker).toHaveBeenCalledTimes(1)
    const [, evicted] = mocks.deleteSticker.mock.calls[0]
    expect((evicted as StickerItem).slotIndex).toBe(3)
    expect((evicted as StickerItem).createdAt).toBe(100)
    expect(lastAddedItem().slotIndex).toBe(3)
  })

  it('passes the resolved subject and generated provider through to the stored item', async () => {
    mocks.resolveSubject.mockReturnValue('rocket')
    mocks.generateStickerImage.mockResolvedValue({ src: 'https://img.example/r.png', provider: 'openai' })

    await maybeSpawnSticker(makeProblem(), 'uid1')

    const item = lastAddedItem()
    expect(item.subject).toBe('rocket')
    expect(item.provider).toBe('openai')
    expect(item.src).toBe('https://img.example/r.png')
    // generate is called with (subject, uid, id) and id matches the stored item.
    expect(mocks.generateStickerImage).toHaveBeenCalledWith('rocket', 'uid1', item.id)
  })
})

describe('maybeSpawnSticker: spawn probability', () => {
  it('always spawns while SPAWN_CHANCE is 1 (even for random ~1)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)

    await maybeSpawnSticker(makeProblem(), 'uid1')

    expect(mocks.addSticker).toHaveBeenCalledTimes(1)
  })
})

describe('loseStickers', () => {
  it('removes exactly `count` random stickers', async () => {
    await loseStickers('uid1', 3)
    expect(mocks.removeRandomSticker).toHaveBeenCalledTimes(3)
    expect(mocks.removeRandomSticker).toHaveBeenCalledWith('uid1')
  })

  it('does nothing for a non-positive count', async () => {
    await loseStickers('uid1', 0)
    await loseStickers('uid1', -2)
    expect(mocks.removeRandomSticker).not.toHaveBeenCalled()
  })

  it('stops early once the learner has no stickers left', async () => {
    mocks.removeRandomSticker
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
    await loseStickers('uid1', 5)
    expect(mocks.removeRandomSticker).toHaveBeenCalledTimes(2)
  })

  it('never throws when removal rejects', async () => {
    mocks.removeRandomSticker.mockRejectedValue(new Error('remove boom'))
    await expect(loseStickers('uid1', 2)).resolves.toBeUndefined()
  })
})

describe('maybeSpawnSticker: never throws', () => {
  it('swallows errors when generate rejects', async () => {
    mocks.generateStickerImage.mockRejectedValue(new Error('image boom'))

    await expect(maybeSpawnSticker(makeProblem(), 'uid1')).resolves.toBeUndefined()
    expect(mocks.addSticker).not.toHaveBeenCalled()
  })

  it('swallows errors when getActiveStickers rejects', async () => {
    mocks.getActiveStickers.mockRejectedValue(new Error('read boom'))

    await expect(maybeSpawnSticker(makeProblem(), 'uid1')).resolves.toBeUndefined()
    expect(mocks.addSticker).not.toHaveBeenCalled()
  })

  it('swallows errors when addSticker rejects', async () => {
    mocks.addSticker.mockRejectedValue(new Error('write boom'))

    await expect(maybeSpawnSticker(makeProblem(), 'uid1')).resolves.toBeUndefined()
  })

  it('swallows errors when deleteSticker rejects during eviction', async () => {
    const actives: StickerItem[] = []
    for (let slot = 0; slot < STICKER_SLOT_COUNT; slot++) {
      actives.push(makeItem(slot, 1000 + slot))
    }
    mocks.getActiveStickers.mockResolvedValue(actives)
    mocks.deleteSticker.mockRejectedValue(new Error('delete boom'))

    await expect(maybeSpawnSticker(makeProblem(), 'uid1')).resolves.toBeUndefined()
  })
})
