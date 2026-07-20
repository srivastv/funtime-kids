export type Category = { id: string; name: string; icon: string }

export type Question = {
  id: string
  category: string
  prompt: string
  choices: string[]
  answerIndex: number
  difficulty: 1 | 2 | 3
}

export type TypingLesson = {
  id: string
  title: string
  text: string
  difficulty: 1 | 2 | 3
}

export type FallingWord = {
  word: string
  difficulty: 1 | 2 | 3
}

/** Guide shapes for drawing lessons, in normalized 0..1 coordinates. */
export type DrawShape =
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'poly'; points: Array<[number, number]>; close?: boolean }
  | { kind: 'curve'; x1: number; y1: number; cx: number; cy: number; x2: number; y2: number }

export type DrawStep = { instruction: string; shapes: DrawShape[] }

export type DrawingLesson = {
  id: string
  title: string
  icon: string
  steps: DrawStep[]
}

export type GeoItem = {
  id: string
  name: string
  capital: string
  continent: 'Europe' | 'Asia' | 'Africa' | 'North America' | 'South America' | 'Oceania' | 'Antarctica'
  flagEmoji?: string
  flagSvg?: string
  landmarkClues: string[]
  funFact: string
  latitude: number
  longitude: number
  difficulty: 1 | 2 | 3
  aliases?: string[]
}

export type GeoQuestionType = 'flag' | 'capital' | 'landmark' | 'map' | 'landmarkmap' | 'capitalmatch'

/** A candidate country for the Map Drop game, carrying real coordinates. */
export type GeoMapItem = { name: string; lat: number; lon: number; flagEmoji?: string }

export type GeoQuestion = {
  type: GeoQuestionType
  prompt: string
  visual?: {
    flagEmoji?: string
    flagSvg?: string
    /** A decorative emoji for the question (e.g. a clue-specific landmark icon). */
    icon?: string
  }
  choices: string[]
  answerIndex: number
  itemId: string
  funFact: string
  /** Candidates with real lat/lon — used by Map Drop / Landmark Hunt (d3-geo renderer). */
  mapItems?: GeoMapItem[]
  /** Country↔capital pairs — used by the Capital Match round. */
  pairs?: CapitalPair[]
}

export type GeoMode = 'mixed' | 'flags' | 'capitals' | 'landmarks' | 'maps' | 'landmarkmap' | 'capitalmatch'

/** One country↔capital pairing shown in a Capital Match round. */
export type CapitalPair = { country: string; capital: string; flagEmoji?: string }

export type OddTopic = 'plants' | 'rocks' | 'light' | 'sound' | 'forces' | 'animals'
export type OddExperimentType = 'predict-choice' | 'drag-sort' | 'slider-predict'

export type OddExperiment = {
  id: string
  topic: OddTopic
  title: string
  prompt: string
  type: OddExperimentType
  difficulty: 1 | 2 | 3
  config: {
    options?: string[]
    correctIndex?: number
    categories?: string[]
    items?: { label: string; category: string; emoji?: string }[]
    min?: number
    max?: number
    correctValue?: number
    tolerance?: number
    unit?: string
  }
  explanation: string
  funFact: string
}

export type OddMode = OddTopic | 'mixed'

export type NumberRiverOpType = '+' | '-' | '×' | '÷' | 'missing'

export type NumberRiverOp = {
  type: NumberRiverOpType
  value?: number
  display: string
}

export type NumberRiverLevel = {
  id: string
  target: number
  start?: number
  slots: number
  availableOps: NumberRiverOp[]
  difficulty: 1 | 2 | 3
  description?: string
  allowNegative?: boolean
}
