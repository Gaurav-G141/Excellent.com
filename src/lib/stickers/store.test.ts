import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { StickerItem } from './types'

// ── Mocks ────────────────────────────────────────────────────────────────────
// `fb` is a mutable namespace so tests can toggle whether Firebase is configured
// (db defined) — store.ts reads this as a live binding.
const fb = vi.hoisted(() => ({
  db: undefined as unknown,
}))

const fs = vi.hoisted(() => ({
  collection: vi.fn((..._args: unknown[]) => ({ __kind: 'collection' })),
  doc: vi.fn((..._args: unknown[]) => ({ __kind: 'doc' })),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(async () => undefined),
  deleteDoc: vi.fn(async () => undefined),
}))

vi.mock('../firebase', () => fb)
vi.mock('firebase/firestore', () => ({
  collection: fs.collection,
  doc: fs.doc,
  getDocs: fs.getDocs,
  onSnapshot: fs.onSnapshot,
  setDoc: fs.setDoc,
  deleteDoc: fs.deleteDoc,
}))

import {
  addSticker,
  deleteSticker,
  getActiveStickers,
  removeRandomSticker,
  subscribeActiveStickers,
} from './store'

// ── Fixtures ─────────────────────────────────────────────────────────────────
const FUTURE = Date.now() + 5 * 60 * 1000
const PAST = Date.now() - 5 * 60 * 1000

function rawDoc(id: string, data: Record<string, unknown>) {
  return { id, data }
}

function snapshotOf(docs: Array<{ id: string; data: Record<string, unknown> }>) {
  return {
    forEach: (cb: (d: { id: string; data: () => Record<string, unknown> }) => void) =>
      docs.forEach((d) => cb({ id: d.id, data: () => d.data })),
  }
}

function validData(over: Partial<StickerItem> = {}): Record<string, unknown> {
  return {
    subject: 'owl',
    src: 'https://img.example/owl.png',
    provider: 'pollinations',
    slotIndex: 0,
    createdAt: 1,
    expiresAt: FUTURE,
    ...over,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  fb.db = {}
})

// ── Configured (db present) ──────────────────────────────────────────────────
describe('getActiveStickers (configured)', () => {
  it('drops expired + malformed docs and sorts by ascending slotIndex', async () => {
    fs.getDocs.mockResolvedValue(
      snapshotOf([
        rawDoc('a', validData({ slotIndex: 3 })),
        rawDoc('b', validData({ slotIndex: 1 })),
        rawDoc('expired', validData({ slotIndex: 0, expiresAt: PAST })),
        rawDoc('bad-slot', validData({ slotIndex: 'nope' as unknown as number })),
        rawDoc('bad-provider', validData({ provider: 'midjourney' })),
        rawDoc('missing-src', { subject: 'x', provider: 'openai', slotIndex: 2, createdAt: 1, expiresAt: FUTURE }),
      ]),
    )

    const result = await getActiveStickers('uid1')

    expect(result.map((i) => i.id)).toEqual(['b', 'a'])
    expect(result.map((i) => i.slotIndex)).toEqual([1, 3])
  })

  it('returns [] when there are no docs', async () => {
    fs.getDocs.mockResolvedValue(snapshotOf([]))
    expect(await getActiveStickers('uid1')).toEqual([])
  })
})

describe('subscribeActiveStickers (configured)', () => {
  it('emits filtered + sorted items and returns the unsubscribe fn', () => {
    const unsub = vi.fn()
    fs.onSnapshot.mockImplementation(
      (_coll: unknown, cb: (snap: ReturnType<typeof snapshotOf>) => void) => {
        cb(
          snapshotOf([
            rawDoc('a', validData({ slotIndex: 5 })),
            rawDoc('b', validData({ slotIndex: 2 })),
            rawDoc('expired', validData({ slotIndex: 0, expiresAt: PAST })),
            rawDoc('bad', validData({ createdAt: 'x' as unknown as number })),
          ]),
        )
        return unsub
      },
    )

    const received: StickerItem[][] = []
    const returned = subscribeActiveStickers('uid1', (items) => received.push(items))

    expect(received).toHaveLength(1)
    expect(received[0].map((i) => i.id)).toEqual(['b', 'a'])
    expect(returned).toBe(unsub)
  })
})

describe('addSticker (configured)', () => {
  it('writes the sticker fields via setDoc', async () => {
    const item: StickerItem = {
      id: 'item1',
      subject: 'owl',
      src: 'https://img.example/owl.png',
      provider: 'pollinations',
      slotIndex: 2,
      createdAt: 10,
      expiresAt: FUTURE,
    }
    await addSticker('uid1', item)

    expect(fs.setDoc).toHaveBeenCalledTimes(1)
    const [, payload] = fs.setDoc.mock.calls[0]
    expect(payload).toEqual({
      subject: 'owl',
      src: 'https://img.example/owl.png',
      provider: 'pollinations',
      slotIndex: 2,
      createdAt: 10,
      expiresAt: FUTURE,
    })
  })
})

describe('deleteSticker (configured)', () => {
  it('deletes only the Firestore doc (images are external URLs)', async () => {
    await deleteSticker('uid1', { id: 'item1', provider: 'pollinations' })
    expect(fs.deleteDoc).toHaveBeenCalledTimes(1)
  })
})

describe('removeRandomSticker (configured)', () => {
  it('deletes one active sticker and returns true', async () => {
    fs.getDocs.mockResolvedValue(
      snapshotOf([rawDoc('a', validData()), rawDoc('b', validData({ slotIndex: 1 }))]),
    )
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const removed = await removeRandomSticker('uid1')

    expect(removed).toBe(true)
    expect(fs.deleteDoc).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })

  it('returns false when there are no active stickers', async () => {
    fs.getDocs.mockResolvedValue(snapshotOf([]))
    const removed = await removeRandomSticker('uid1')
    expect(removed).toBe(false)
    expect(fs.deleteDoc).not.toHaveBeenCalled()
  })
})

// ── Unconfigured (db undefined) ──────────────────────────────────────────────
describe('store helpers when Firebase is not configured', () => {
  beforeEach(() => {
    fb.db = undefined
  })

  it('getActiveStickers returns [] without querying', async () => {
    expect(await getActiveStickers('uid1')).toEqual([])
    expect(fs.getDocs).not.toHaveBeenCalled()
  })

  it('subscribeActiveStickers emits [] once and returns a no-op unsubscribe', () => {
    const received: StickerItem[][] = []
    const unsub = subscribeActiveStickers('uid1', (items) => received.push(items))

    expect(received).toEqual([[]])
    expect(fs.onSnapshot).not.toHaveBeenCalled()
    expect(typeof unsub).toBe('function')
    expect(() => unsub()).not.toThrow()
  })

  it('addSticker and deleteSticker no-op', async () => {
    await addSticker('uid1', {
      id: 'item1',
      subject: 'owl',
      src: 'x',
      provider: 'pollinations',
      slotIndex: 0,
      createdAt: 1,
      expiresAt: FUTURE,
    })
    await deleteSticker('uid1', { id: 'item1', provider: 'openai' })

    expect(fs.setDoc).not.toHaveBeenCalled()
    expect(fs.deleteDoc).not.toHaveBeenCalled()
  })

  it('removeRandomSticker returns false without querying', async () => {
    expect(await removeRandomSticker('uid1')).toBe(false)
    expect(fs.getDocs).not.toHaveBeenCalled()
  })
})
