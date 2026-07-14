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

export interface ContentProvider {
  getQuizCategories(): Promise<Category[]>
  getQuizQuestions(category: string): Promise<Question[]>
  getTypingLessons(): Promise<TypingLesson[]>
  getFallingWords(): Promise<FallingWord[]>
  getDrawings(): Promise<DrawingLesson[]>
  getGeographyItems(): Promise<GeoItem[]>
  getOddExperiments(): Promise<OddExperiment[]>
  getNumberRiverLevels(): Promise<NumberRiverLevel[]>
}
