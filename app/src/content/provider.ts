import type { Category, Question, TypingLesson, FallingWord } from './types'

export interface ContentProvider {
  getQuizCategories(): Promise<Category[]>
  getQuizQuestions(category: string): Promise<Question[]>
  getTypingLessons(): Promise<TypingLesson[]>
  getFallingWords(): Promise<FallingWord[]>
}
