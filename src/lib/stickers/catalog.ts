/**
 * Maps a solved word problem to a concrete, drawable subject for a sticker.
 *
 * Problem titles can be reworded by the AI at runtime, so resolution is layered:
 *   1. keyword match over the (possibly reworded) title,
 *   2. a per-topic subject pool keyed off the STABLE `topicId`,
 *   3. a small generic celebratory set.
 * The result is always a non-empty, kid-drawable noun phrase.
 */

import type { WordProblem } from '../../utils/applications/types'

/** Pick a random element from a non-empty list. */
function pickFrom(pool: readonly string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Ordered keyword → subject rules, matched as case-insensitive substrings of the
 * title. Order matters: more specific phrases come before broad ones so e.g.
 * "rocket sled" resolves to a rocket rather than a generic vehicle.
 */
const KEYWORD_RULES: ReadonlyArray<readonly [keyword: string, subject: string]> = [
  ['hatchery', 'fish'],
  ['fish', 'fish'],
  ['balloon', 'hot air balloon'],
  ['bubble', 'soap bubble'],
  ['pizza', 'pizza'],
  ['dough', 'pizza'],
  ['drone', 'drone'],
  ['cyclist', 'bicycle'],
  ['bicycle', 'bicycle'],
  ['bike', 'bicycle'],
  ['rocket', 'rocket'],
  ['sled', 'rocket sled'],
  ['maglev', 'train'],
  ['river', 'river'],
  ['reservoir', 'lake'],
  ['ice', 'ice cube'],
  ['crystal', 'salt crystal'],
  ['salt', 'salt crystal'],
  ['solar', 'sun'],
  ['sun', 'smiling sun'],
  ['stock', 'stock chart'],
  ['temperature', 'thermometer'],
  ['thermometer', 'thermometer'],
  ['elevator', 'elevator'],
  ['coaster', 'roller coaster'],
  ['owl', 'owl'],
  ['crab', 'crab'],
  ['lion', 'lion'],
  ['concert', 'electric guitar'],
  ['ticket', 'electric guitar'],
  ['museum', 'dinosaur'],
  ['download', 'smartphone'],
  ['tent', 'tent'],
  ['nitro', 'race car'],
  ['racing', 'race car'],
  ['signal', 'antenna'],
  ['receiver', 'antenna'],
  ['lens', 'camera'],
  ['camera', 'camera'],
  ['zoom', 'camera'],
  ['spaceship', 'rocket ship'],
  ['space', 'rocket ship'],
  ['robot', 'robot'],
  ['data center', 'computer'],
  ['hybrid car', 'car'],
  ['toll', 'road'],
  ['highway', 'road'],
  ['conveyor', 'cardboard box'],
  ['freight', 'cardboard box'],
  ['pressure', 'pressure gauge'],
  ['valve', 'pressure gauge'],
  ['tank', 'water tank'],
  ['water', 'water tank'],
  ['factory', 'factory'],
  ['boutique', 'shopping bag'],
  ['paint', 'paint bucket'],
  ['kinetic', 'wagon'],
  ['cart', 'wagon'],
  ['motor', 'gear'],
  ['savings', 'piggy bank'],
  ['cash', 'piggy bank'],
  ['balance', 'piggy bank'],
  ['startup', 'piggy bank'],
  ['subscriber', 'television'],
  ['channel', 'television'],
  ['weather', 'cloud'],
  ['altitude', 'drone'],
  ['truck', 'truck'],
  ['car', 'car'],
]

/** Subject pools keyed by the stable topicId, used when no keyword matches. */
const TOPIC_POOLS: Record<string, readonly string[]> = {
  'a1-fastest': ['electric guitar', 'smartphone', 'river', 'lake', 'dinosaur'],
  'a1-avg-inst': ['bicycle', 'fish', 'piggy bank', 'television'],
  'a1-instant-limit': ['drone', 'roller coaster', 'elevator', 'water tank'],
  'a1-turning': ['piggy bank', 'drone', 'stock chart', 'thermometer'],
  'a2-power': ['pizza', 'cube', 'paint bucket', 'wagon'],
  'a2-sum': ['shopping bag', 'factory', 'smartphone', 'car'],
  'a2-chain': ['race car', 'tent', 'antenna', 'camera'],
  'a2-mvt': ['car', 'elevator', 'cardboard box', 'drone'],
  'a2-combine': ['rocket ship', 'robot', 'computer', 'car'],
  'a3-related': ['hot air balloon', 'soap bubble', 'ice cube', 'smiling sun'],
  'a3-accel': ['train', 'elevator', 'gear', 'rocket'],
  'a3-ivt': ['thermometer', 'drone', 'pressure gauge', 'antenna'],
  'a4-egrowth': ['bacteria', 'sprouting plant', 'piggy bank'],
  'a4-base': ['rabbits', 'coins', 'balloons'],
  'a4-log': ['speaker', 'mountain', 'volume knob'],
  'a4-product': ['shopping cart', 'price tag', 'garden plot'],
  'a4-product-point': ['cash register', 'stopwatch', 'shopping bag'],
}

/** Last-resort celebratory subjects, used when title and topicId both miss. */
const GENERIC_SUBJECTS: readonly string[] = [
  'gold star',
  'trophy',
  'hot air balloon',
  'smiling sun',
]

/** Resolve a solved problem to a concrete, drawable subject. Never empty. */
export function resolveSubject(problem: WordProblem): string {
  const title = problem.title?.toLowerCase() ?? ''
  for (const [keyword, subject] of KEYWORD_RULES) {
    if (title.includes(keyword)) return subject
  }

  const pool = TOPIC_POOLS[problem.topicId]
  if (pool && pool.length > 0) return pickFrom(pool)

  return pickFrom(GENERIC_SUBJECTS)
}
