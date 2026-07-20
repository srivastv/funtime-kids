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
import maths from './data/quiz/maths.json'
import english from './data/quiz/english.json'
import plantsQuiz from './data/quiz/plants.json'
import rocksQuiz from './data/quiz/rocks.json'
import lightQuiz from './data/quiz/light.json'
import forcesQuiz from './data/quiz/forces.json'
import geographyQuiz from './data/quiz/geography.json'
import computing from './data/quiz/computing.json'
import lessons from './data/typing/lessons.json'
import fallingWords from './data/falling/words.json'
import { DRAWINGS } from './data/draw/drawings'
import geographyItems from './data/geography/items.json'
import plants from './data/odd/plants.json'
import rocks from './data/odd/rocks.json'
import light from './data/odd/light.json'
import sound from './data/odd/sound.json'
import forces from './data/odd/forces.json'
import animalsOdd from './data/odd/animals.json'
import numberRiverLevels from './data/numberriver/levels.json'

const banks: Record<string, Question[]> = {
  animals: animals as Question[],
  maths: maths as Question[],
  english: english as Question[],
  plants: plantsQuiz as Question[],
  rocks: rocksQuiz as Question[],
  light: lightQuiz as Question[],
  forces: forcesQuiz as Question[],
  geography: geographyQuiz as Question[],
  computing: computing as Question[],
}

const categories: Category[] = [
  { id: 'maths', name: 'Maths', icon: '➕' },
  { id: 'english', name: 'English', icon: '📚' },
  { id: 'animals', name: 'Animals & Humans', icon: '🐾' },
  { id: 'plants', name: 'Plants', icon: '🌱' },
  { id: 'rocks', name: 'Rocks', icon: '🪨' },
  { id: 'light', name: 'Light', icon: '💡' },
  { id: 'forces', name: 'Forces & Magnets', icon: '🧲' },
  { id: 'geography', name: 'Geography', icon: '🗺️' },
  { id: 'computing', name: 'Computing', icon: '💻' },
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
      ...(light as OddExperiment[]),
      ...(sound as OddExperiment[]),
      ...(forces as OddExperiment[]),
      ...(animalsOdd as OddExperiment[]),
    ]
  },
  async getNumberRiverLevels(): Promise<NumberRiverLevel[]> {
    return numberRiverLevels as NumberRiverLevel[]
  },
}
