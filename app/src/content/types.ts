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
