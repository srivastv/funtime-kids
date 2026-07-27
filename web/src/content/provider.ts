import type {
  Category,
  Question,
  TypingLesson,
  FallingWord,
  FallingLetter,
  DrawingLesson,
  GeoItem,
  OddExperiment,
  NumberRiverLevel,
}

export interface ContentProvider {
  getQuizCategories(): Promise<Category[]>
  getQuizQuestions(category: string): Promise<Question[]>
  getTypingLessons(): Promise<TypingLesson[]>
  getFallingWords(): Promise<FallingWord[]>
  getFallingLetters(): Promise<FallingLetter[]>
  getDrawings(): Promise<DrawingLesson[]>
  getGeographyItems(): Promise<GeoItem[]>
  getOddExperiments(): Promise<OddExperiment[]>
  getNumberRiverLevels(): Promise<NumberRiverLevel[]>
}
