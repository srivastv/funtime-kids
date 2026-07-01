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
