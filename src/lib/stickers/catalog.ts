/**
 * Maps a solved word problem to a concrete, drawable subject for a sticker.
 *
 * Problem titles and scenes can be reworded by the AI at runtime (and themed to
 * the learner's interests), so resolution is layered, most-relevant first:
 *   0. an explicit `stickerSubject` hint (if the problem author set one),
 *   1. a concrete `subjectTerms` noun the problem is actually *about*
 *      (e.g. mice/owl) — this is the real thing the learner just reasoned over,
 *      so it must win over loose title-keyword guesses,
 *   2. a learner interest that literally appears in the themed problem text,
 *   3. a keyword match over the (possibly reworded) title + prompt,
 *   4. a per-topic subject pool keyed off the STABLE `topicId`,
 *   5. a small generic celebratory set.
 * The result is always a non-empty, kid-drawable noun phrase.
 *
 * WHY subjectTerms beats title keywords: the title is AI-rewritten and the
 * keyword rules are deliberately loose substring matches, so an unrelated word
 * in a themed title (e.g. "conveyor") could otherwise fire a rule and draw
 * something the problem was never about (a cardboard box) instead of its real
 * subject (a mouse / an owl). subjectTerms are the curated nouns the steps
 * genuinely reference, so they're the most faithful sticker subject available.
 */

/**
 * The minimal problem shape the sticker subject resolver needs. Both the
 * single-shot `WordProblem` and the multi-step `ScenarioProblem` satisfy it, so
 * either kind of solved problem can earn a matching sticker.
 */
export interface StickerableProblem {
  topicId: string
  title?: string
  prompt?: string
  /** Optional explicit subject hint that wins over keyword/topic resolution. */
  stickerSubject?: string
  /**
   * Concrete nouns the problem's steps actually refer to (e.g. ['mice','owl']).
   * Preferred over title keywords because these are the curated, faithful
   * subjects of the problem rather than loose substring guesses on a reworded
   * title. Carried through verbatim by the AI rewrite, so available at spawn.
   */
  subjectTerms?: string[]
}

/** Pick a random element from a non-empty list. */
function pickFrom(pool: readonly string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Turn an interest into a cleaner "one single X" subject by dropping a trailing
 * plural "s" (but not "ss"), e.g. "ladybugs" -> "ladybug", "chess" stays.
 */
function asDrawableSubject(text: string): string {
  const t = text.trim()
  if (/[^s]s$/i.test(t)) return t.slice(0, -1)
  return t
}

/**
 * Pick a concrete subject from the problem's curated `subjectTerms`, singularized
 * for drawing. These are the real nouns the steps reference, so this is the most
 * faithful sticker subject and must beat loose title-keyword guesses. Returns
 * null when there are no usable terms.
 */
function matchSubjectTerm(problem: StickerableProblem): string | null {
  const terms = problem.subjectTerms
  if (!terms || terms.length === 0) return null
  const usable = terms
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .map((t) => asDrawableSubject(t))
  if (usable.length === 0) return null
  return pickFrom(usable)
}

/**
 * If any learner interest literally appears in the themed problem text, return it
 * as the subject so the sticker reflects what the learner actually solved. Short
 * interests (< 3 chars) are ignored to avoid spurious substring hits.
 */
function matchInterest(problem: StickerableProblem, interests?: string[]): string | null {
  if (!interests || interests.length === 0) return null
  const haystack = `${problem.title ?? ''} ${problem.prompt ?? ''}`.toLowerCase()
  for (const raw of interests) {
    if (typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (trimmed.length < 3) continue
    // Try both the interest as written and its singular stem, since the themed
    // problem may say "ladybug" while the saved interest is "ladybugs".
    const variants = [trimmed.toLowerCase(), asDrawableSubject(trimmed).toLowerCase()]
    for (const needle of variants) {
      if (needle.length >= 3 && haystack.includes(needle)) return asDrawableSubject(trimmed)
    }
  }
  return null
}

/**
 * Ordered keyword → subject rules, matched as case-insensitive substrings of the
 * title + prompt. Order matters: more specific phrases come before broad ones so
 * e.g. "rocket sled" resolves to a rocket rather than a generic vehicle.
 *
 * Every rule here must be genuinely *depictive* of its keyword — the drawn
 * subject is something the keyword literally names or strongly implies. We avoid
 * rules that map an incidental setting word to an unrelated object (e.g. the old
 * `conveyor`/`freight` -> `cardboard box` rules, removed below): those could
 * override the real problem subject and draw something the problem isn't about.
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
  // Removed: ['conveyor','cardboard box'] and ['freight','cardboard box'] — a
  // conveyor/freight setting doesn't mean the problem is about a box, and these
  // could clobber a real subjectTerm (e.g. mice/owl) with an unrelated box.
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
  's1-equilibrium': ['ladybug', 'songbird', 'owl', 'goat', 'snail'],
  's2-spread': ['oil droplet', 'paint splatter', 'campfire', 'ink blot'],
  's2-product': ['solar panel', 'picture frame', 'garden plot', 'flag banner'],
  's3-peak': ['rocket', 'soccer ball', 'beanbag', 'toy drone'],
  's4-growth': ['bacteria', 'mushroom', 'leaf', 'bread loaf'],
}

/** Last-resort celebratory subjects, used when title and topicId both miss. */
const GENERIC_SUBJECTS: readonly string[] = [
  'gold star',
  'trophy',
  'hot air balloon',
  'smiling sun',
]

/** Resolve a solved problem to a concrete, drawable subject. Never empty. */
export function resolveSubject(problem: StickerableProblem, interests?: string[]): string {
  // An explicit per-problem subject hint wins outright.
  if (problem.stickerSubject && problem.stickerSubject.trim().length > 0) {
    return problem.stickerSubject.trim()
  }

  // Prefer a curated subject term — the concrete thing the problem is actually
  // about (e.g. mice/owl). This must beat the loose title-keyword rules below so
  // a reworded title can't draw something unrelated to what the learner solved.
  const subjectTerm = matchSubjectTerm(problem)
  if (subjectTerm) return subjectTerm

  // Then an interest that's actually present in the themed problem, so the
  // sticker matches the scene the learner just solved.
  const interest = matchInterest(problem, interests)
  if (interest) return interest

  // Keyword rules scan title + prompt (not title alone) so a depictive noun in
  // the scenario body can still match; these are only a guess, so they sit below
  // the curated subjectTerms above.
  const haystack = `${problem.title ?? ''} ${problem.prompt ?? ''}`.toLowerCase()
  for (const [keyword, subject] of KEYWORD_RULES) {
    if (haystack.includes(keyword)) return subject
  }

  const pool = TOPIC_POOLS[problem.topicId]
  if (pool && pool.length > 0) return pickFrom(pool)

  return pickFrom(GENERIC_SUBJECTS)
}
