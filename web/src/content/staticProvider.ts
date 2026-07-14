import type {
  Category,
  Question,
  TypingLesson,
  FallingWord,
  DrawingLesson,
  GeoItem,
  OddExperiment,
  NumberRiverLevel,
} from './types'
import type { ContentProvider } from './provider'
import { shuffle } from '../lib/shuffle'
import animals from './data/quiz/animals.json'
import space from './data/quiz/space.json'
import maths from './data/quiz/maths.json'
import lessons from './data/typing/lessons.json'
import fallingWords from './data/falling/words.json'
import { DRAWINGS } from './data/draw/drawings'
import geographyItems from './data/geography/items.json'
import plants from './data/odd/plants.json'
import rocks from './data/odd/rocks.json'
import lightSound from './data/odd/light_sound.json'
import numberRiverLevels from './data/numberriver/levels.json'

const banks: Record<string, Question[]> = {
  animals: animals as Question[],
  space: space as Question[],
  maths: maths as Question[],
}

const categories: Category[] = [
  { id: 'animals', name: 'Animals', icon: '🐾' },
  { id: 'space', name: 'Space', icon: '🚀' },
  { id: 'maths', name: 'Maths', icon: '➕' },
  { id: 'mixed', name: 'Mixed', icon: '🎲' },
]

export const staticProvider: ContentProvider = {
  async getQuizCategories() {
    return categories
  },
  async getQuizQuestions(category: string) {
    if (category === 'mixed') return shuffle(Object.values(banks).flat())
    return banks[category] ?? []
  },
  async getTypingLessons() {
    return lessons as TypingLesson[]
  },
  async getFallingWords() {
    return fallingWords as FallingWord[]
  },
  async getDrawings(): Promise<DrawingLesson[]> {
    return DRAWINGS
  },
  async getGeographyItems(): Promise<GeoItem[]> {
    return geographyItems as GeoItem[]
  },
  async getOddExperiments(): Promise<OddExperiment[]> {
    return [
      ...(plants as OddExperiment[]),
      ...(rocks as OddExperiment[]),
      ...(lightSound as OddExperiment[]),
    ]
  },
  async getNumberRiverLevels(): Promise<NumberRiverLevel[]> {
    return numberRiverLevels as NumberRiverLevel[]
  },
}
