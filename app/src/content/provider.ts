import type {
  Category,
  Question,
  TypingLesson,
  FallingWord,
  DrawingLesson,
} from './types'

export interface ContentProvider {
  getQuizCategories(): Promise<Category[]>
  getQuizQuestions(category: string): Promise<Question[]>
  getTypingLessons(): Promise<TypingLesson[]>
  getFallingWords(): Promise<FallingWord[]>
  getDrawings(): Promise<DrawingLesson[]>
}
