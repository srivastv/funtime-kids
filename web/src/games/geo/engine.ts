import { shuffle } from '../../lib/shuffle'
import type { GeoItem, GeoQuestion, GeoMode, GeoQuestionType } from '../../content/types'
import allGeoItems from '../../content/data/geography/items.json'

export const MODES: { id: GeoMode; name: string; icon: string; desc: string }[] = [
  { id: 'mixed', name: 'Mixed Hop', icon: '🌍', desc: 'Flags, capitals, landmarks and maps' },
  { id: 'flags', name: 'Flag Match', icon: '🏳️', desc: 'Name the country from its flag' },
  { id: 'capitals', name: 'Capital Call', icon: '🏛️', desc: 'What is the capital city?' },
  { id: 'landmarks', name: 'Landmark Clue', icon: '🗽', desc: 'Guess from famous places' },
  { id: 'maps', name: 'Map Drop', icon: '🗺️', desc: 'Drag the flag to the right spot on an accurate map' },
  { id: 'landmarkmap', name: 'Landmark Hunt', icon: '📍', desc: 'Drag the landmark to the right country' },
  { id: 'capitalmatch', name: 'Capital Match', icon: '🔗', desc: 'Connect countries to their capitals' },
]

export const DIFFICULTIES = [
  { level: 1 as const, name: 'Explorer', desc: 'Big well-known countries' },
  { level: 2 as const, name: 'Adventurer', desc: 'Add medium countries' },
  { level: 3 as const, name: 'Globetrotter', desc: 'Hard and tiny states too' },
]

const QUESTION_COUNT = 10

// Keyword → emoji, checked in order (specific before generic). Used to give each
// landmark clue its own little picture instead of a fixed icon. The clue text is
// always shown too, so an approximate match is fine.
const CLUE_EMOJI: [string[], string][] = [
  [['loch ness', 'monster', 'dragon', 'dinosaur'], '🐉'],
  [['pyramid', 'giza', 'chichen'], '🔺'],
  [['taj mahal', 'hagia', 'mosque'], '🕌'],
  [['sagrada', 'church', 'cathedral', 'redeemer'], '⛪'],
  [['temple', 'parthenon', 'colosseum', 'terracotta', 'inca', 'brandenburg gate', 'ancient', 'greek gods', 'sphinx', 'genghis'], '🏛️'],
  [['big ben', 'clock'], '🕰️'],
  [['bridge'], '🌉'],
  [['tower', 'eiffel', 'pisa'], '🗼'],
  [['palace', 'castle', 'buckingham', 'knights'], '🏰'],
  [['statue', 'liberty'], '🗽'],
  [['opera'], '🎭'],
  [['fuji'], '🗻'],
  [['volcano', 'geyser'], '🌋'],
  [['everest', 'himalaya', 'snowdon', 'fjord', 'mountain', 'machu picchu', 'table mountain', 'hill', 'steppe'], '⛰️'],
  [['great wall', 'wall'], '🧱'],
  [['canyon', 'desert', 'sahara'], '🏜️'],
  [['waterfall', 'falls', 'niagara', 'iguazu'], '💦'],
  [['cliff', 'atlantic wave', 'wave', 'sea cave', 'nile', 'river', 'ha long', 'bay'], '🌊'],
  [['reef', 'coral', 'barrier'], '🐠'],
  [['island', 'islands', 'tropical'], '🏝️'],
  [['rainforest', 'amazon', 'forest'], '🌴'],
  [['balloon', 'cappadocia'], '🎈'],
  [['northern lights'], '🌌'],
  [['viking', 'khan empire'], '⚔️'],
  [['museum', 'louvre'], '🖼️'],
  [['bullet train', 'train'], '🚄'],
  [['cherry blossom', 'blossom'], '🌸'],
  [['maple'], '🍁'],
  [['shamrock', 'leprechaun'], '🍀'],
  [['panda'], '🐼'],
  [['tiger'], '🐅'],
  [['lion', 'safari'], '🦁'],
  [['kangaroo'], '🦘'],
  [['penguin', 'puffin'], '🐧'],
  [['elephant'], '🐘'],
  [['llama'], '🦙'],
  [['camel'], '🐪'],
  [['bison', 'wildebeest', 'migration', 'bull'], '🦬'],
  [['kiwi'], '🥝'],
  [['pizza', 'pasta'], '🍕'],
  [['taco'], '🌮'],
  [['curry'], '🍛'],
  [['noodle', 'pho'], '🍜'],
  [['kimchi'], '🥬'],
  [['baguette', 'croissant', 'nata', 'custard', 'tart'], '🥐'],
  [['pretzel'], '🥨'],
  [['pierogi', 'dumpling'], '🥟'],
  [['paella', 'rice'], '🥘'],
  [['coconut'], '🥥'],
  [['tea'], '🍵'],
  [['skull', 'dead'], '💀'],
  [['music', 'k-pop', 'kpop', 'abba', 'drums', 'bagpipes', 'tango'], '🎵'],
  [['hockey'], '🏒'],
  [['rugby'], '🏉'],
  [['movie', 'nollywood', 'hobbit'], '🎬'],
  [['ship', 'explorer', 'sail'], '⛵'],
  [['flag'], '🚩'],
  [['market'], '🏪'],
  [['city', 'town', 'high tech'], '🏙️'],
  [['furniture', 'ikea'], '🛋️'],
  [['tent', 'yurt', 'ger'], '⛺'],
  [['snow'], '❄️'],
  [['happiness', 'happy'], '😊'],
  [['carnival', 'festival'], '🎉'],
]

/** Pick a decorative emoji that best fits a landmark clue's text. */
export function clueEmoji(clue: string): string {
  const lc = clue.toLowerCase()
  for (const [keywords, emoji] of CLUE_EMOJI) {
    if (keywords.some((k) => lc.includes(k))) return emoji
  }
  return '🗺️'
}

function pickDistractors(correct: GeoItem, pool: GeoItem[], count: number): GeoItem[] {
  const sameContinent = pool.filter((p) => p.id !== correct.id && p.continent === correct.continent)
  if (sameContinent.length >= count) {
    return shuffle(sameContinent).slice(0, count)
  }
  // fallback to same continent across all difficulties using static full list, never cross continent for visual consistency especially in map mode
  const allSameContinent = (allGeoItems as GeoItem[]).filter(p => p.id !== correct.id && p.continent === correct.continent)
  if (allSameContinent.length >= count) {
    return shuffle(allSameContinent).slice(0, count)
  }
  // final fallback: allow duplicates from same continent to avoid cross-continent visual nonsense, better to repeat than show wrong continent on map
  const withDup: GeoItem[] = []
  while (withDup.length < count && allSameContinent.length > 0) {
    withDup.push(...shuffle(allSameContinent))
  }
  if (withDup.length >= count) return withDup.slice(0, count)
  // absolute last resort fallback to global pool to avoid crash, but this should rarely happen now
  const source = pool.filter((p) => p.id !== correct.id)
  return shuffle(source).slice(0, count)
}

function makeChoices(correctName: string, distractors: GeoItem[]): { choices: string[]; answerIndex: number } {
  const names = [correctName, ...distractors.map((d) => d.name)]
  const shuffled = shuffle(names)
  return { choices: shuffled, answerIndex: shuffled.indexOf(correctName) }
}

function generateFlagQuestion(item: GeoItem, pool: GeoItem[]): GeoQuestion {
  const distractors = pickDistractors(item, pool, 3)
  const { choices, answerIndex } = makeChoices(item.name, distractors)
  return {
    type: 'flag',
    prompt: 'Which country has this flag?',
    visual: { flagEmoji: item.flagEmoji, flagSvg: item.flagSvg },
    choices,
    answerIndex,
    itemId: item.id,
    funFact: item.funFact,
  }
}

function generateCapitalQuestion(item: GeoItem, pool: GeoItem[]): GeoQuestion {
  const distractors = pickDistractors(item, pool, 3)
  const capitalChoices = shuffle([item.capital, ...distractors.map((d) => d.capital)])
  return {
    type: 'capital',
    prompt: `What is the capital of ${item.name}?`,
    visual: { flagEmoji: item.flagEmoji },
    choices: capitalChoices,
    answerIndex: capitalChoices.indexOf(item.capital),
    itemId: item.id,
    funFact: item.funFact,
  }
}

function generateLandmarkQuestion(item: GeoItem, pool: GeoItem[]): GeoQuestion {
  const distractors = pickDistractors(item, pool, 3)
  const { choices, answerIndex } = makeChoices(item.name, distractors)
  const clue = shuffle(item.landmarkClues)[0]
  return {
    type: 'landmark',
    prompt: `Where would you find: ${clue}?`,
    visual: { icon: clueEmoji(clue) },
    choices,
    answerIndex,
    itemId: item.id,
    funFact: item.funFact,
  }
}

// Map Drop — carries real lat/lon for every candidate so the d3-geo renderer can
// project them onto an accurate, region-zoomed map. The correct answer is the
// candidate whose location the player must drop the flag on.
function generateMapQuestion(item: GeoItem, pool: GeoItem[]): GeoQuestion {
  const distractors = pickDistractors(item, pool, 3)
  const allOptions = shuffle([item, ...distractors])
  const answerIndex = allOptions.findIndex((o) => o.id === item.id)
  const mapItems = allOptions.map((o) => ({
    name: o.name,
    lat: o.latitude,
    lon: o.longitude,
    flagEmoji: o.flagEmoji,
  }))
  return {
    type: 'map',
    prompt: `Drop ${item.name}'s flag on the map`,
    visual: { flagEmoji: item.flagEmoji },
    choices: allOptions.map((o) => o.name),
    answerIndex,
    itemId: item.id,
    funFact: item.funFact,
    mapItems,
  }
}

// Landmark Hunt — show a landmark clue, drag the pin onto the correct country on
// the accurate map. Reuses the Map Drop candidate machinery.
function generateLandmarkMapQuestion(item: GeoItem, pool: GeoItem[]): GeoQuestion {
  const distractors = pickDistractors(item, pool, 3)
  const allOptions = shuffle([item, ...distractors])
  const answerIndex = allOptions.findIndex((o) => o.id === item.id)
  const mapItems = allOptions.map((o) => ({
    name: o.name,
    lat: o.latitude,
    lon: o.longitude,
    flagEmoji: o.flagEmoji,
  }))
  const clue = shuffle(item.landmarkClues)[0]
  return {
    type: 'landmarkmap',
    prompt: `Find this landmark's country: ${clue}`,
    visual: { icon: clueEmoji(clue) },
    choices: allOptions.map((o) => o.name),
    answerIndex,
    itemId: item.id,
    funFact: item.funFact,
    mapItems,
  }
}

// Capital Match — connect 4 countries to their 4 capitals. The round carries the
// pairs; the matching UI reports one correct/incorrect back into the play loop.
function generateCapitalMatchQuestion(item: GeoItem, pool: GeoItem[]): GeoQuestion {
  const distractors = pickDistractors(item, pool, 3)
  const all = shuffle([item, ...distractors])
  const pairs = all.map((o) => ({ country: o.name, capital: o.capital, flagEmoji: o.flagEmoji }))
  return {
    type: 'capitalmatch',
    prompt: 'Match each country to its capital',
    choices: all.map((o) => o.name),
    answerIndex: 0,
    itemId: item.id,
    funFact: item.funFact,
    pairs,
  }
}

const generators: Record<GeoQuestionType, (item: GeoItem, pool: GeoItem[]) => GeoQuestion> = {
  flag: generateFlagQuestion,
  capital: generateCapitalQuestion,
  landmark: generateLandmarkQuestion,
  map: generateMapQuestion,
  landmarkmap: generateLandmarkMapQuestion,
  capitalmatch: generateCapitalMatchQuestion,
}

const modeToTypes: Record<GeoMode, GeoQuestionType[]> = {
  mixed: ['flag', 'capital', 'landmark', 'map'],
  flags: ['flag'],
  capitals: ['capital'],
  landmarks: ['landmark'],
  maps: ['map'],
  landmarkmap: ['landmarkmap'],
  capitalmatch: ['capitalmatch'],
}

export function buildQuestionPool(items: GeoItem[], mode: GeoMode, difficulty: 1 | 2 | 3): GeoQuestion[] {
  const filtered = items.filter((i) => i.difficulty <= difficulty)
  if (filtered.length < 4) return []
  const shuffledItems = shuffle(filtered)
  const types = modeToTypes[mode]
  const pool: GeoQuestion[] = []
  for (let i = 0; i < Math.min(QUESTION_COUNT, shuffledItems.length); i++) {
    const item = shuffledItems[i]
    const type = shuffle(types)[0]
    pool.push(generators[type](item, filtered))
  }
  // If not enough unique items, fill by reusing with different types
  while (pool.length < QUESTION_COUNT && filtered.length > 0) {
    const item = shuffle(filtered)[0]
    const type = shuffle(types)[0]
    pool.push(generators[type](item, filtered))
  }
  return pool.slice(0, QUESTION_COUNT)
}

export function scoreStars(correct: number, total: number): number {
  const pct = total === 0 ? 0 : correct / total
  if (pct >= 0.9) return 3
  if (pct >= 0.7) return 2
  if (pct >= 0.5) return 1
  return 0
}

export function bestKey(mode: GeoMode, difficulty: 1 | 2 | 3): string {
  return `geo:${mode}:${difficulty}`
}
