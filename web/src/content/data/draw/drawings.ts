import type { DrawShape, DrawingLesson } from '../../types'

// Compact constructors so coordinates stay readable. All values are 0..1.
const circle = (cx: number, cy: number, r: number): DrawShape => ({ kind: 'circle', cx, cy, r })
const ellipse = (cx: number, cy: number, rx: number, ry: number): DrawShape => ({ kind: 'ellipse', cx, cy, rx, ry })
const line = (x1: number, y1: number, x2: number, y2: number): DrawShape => ({ kind: 'line', x1, y1, x2, y2 })
const rect = (x: number, y: number, w: number, h: number): DrawShape => ({ kind: 'rect', x, y, w, h })
const poly = (points: Array<[number, number]>, close = true): DrawShape => ({ kind: 'poly', points, close })
const curve = (x1: number, y1: number, cx: number, cy: number, x2: number, y2: number): DrawShape => ({ kind: 'curve', x1, y1, cx, cy, x2, y2 })

export const DRAWINGS: DrawingLesson[] = [
  {
    id: 'cat',
    title: 'Cat',
    icon: '🐱',
    steps: [
      { instruction: 'Draw a big circle for the head.', shapes: [circle(0.5, 0.5, 0.28)] },
      {
        instruction: 'Add two pointy triangle ears on top.',
        shapes: [
          poly([[0.3, 0.28], [0.38, 0.1], [0.47, 0.31]]),
          poly([[0.53, 0.31], [0.62, 0.1], [0.7, 0.28]]),
        ],
      },
      {
        instruction: 'Draw two eyes and a little nose.',
        shapes: [
          circle(0.42, 0.48, 0.03),
          circle(0.58, 0.48, 0.03),
          poly([[0.47, 0.56], [0.53, 0.56], [0.5, 0.6]]),
        ],
      },
      {
        instruction: 'Add whiskers and a smile.',
        shapes: [
          line(0.24, 0.55, 0.4, 0.56),
          line(0.24, 0.61, 0.4, 0.59),
          line(0.76, 0.55, 0.6, 0.56),
          line(0.76, 0.61, 0.6, 0.59),
          curve(0.44, 0.62, 0.5, 0.68, 0.56, 0.62),
        ],
      },
    ],
  },
  {
    id: 'fish',
    title: 'Fish',
    icon: '🐟',
    steps: [
      { instruction: 'Draw an oval for the body.', shapes: [ellipse(0.45, 0.5, 0.28, 0.18)] },
      { instruction: 'Add a triangle tail at the back.', shapes: [poly([[0.72, 0.5], [0.9, 0.38], [0.9, 0.62]])] },
      {
        instruction: 'Draw an eye and a smile.',
        shapes: [circle(0.32, 0.45, 0.03), curve(0.28, 0.55, 0.34, 0.6, 0.42, 0.55)],
      },
      {
        instruction: 'Add a top fin and some bubbles.',
        shapes: [poly([[0.44, 0.35], [0.55, 0.22], [0.6, 0.36]]), circle(0.18, 0.35, 0.02), circle(0.13, 0.28, 0.015)],
      },
    ],
  },
  {
    id: 'flower',
    title: 'Flower',
    icon: '🌸',
    steps: [
      { instruction: 'Draw a circle in the middle.', shapes: [circle(0.5, 0.4, 0.09)] },
      {
        instruction: 'Add round petals all around it.',
        shapes: [
          circle(0.5, 0.24, 0.08),
          circle(0.5, 0.56, 0.08),
          circle(0.32, 0.4, 0.08),
          circle(0.68, 0.4, 0.08),
          circle(0.38, 0.28, 0.07),
          circle(0.62, 0.28, 0.07),
          circle(0.38, 0.52, 0.07),
          circle(0.62, 0.52, 0.07),
        ],
      },
      { instruction: 'Draw a long stem going down.', shapes: [line(0.5, 0.49, 0.5, 0.85)] },
      {
        instruction: 'Add two leaves on the stem.',
        shapes: [ellipse(0.4, 0.66, 0.07, 0.035), ellipse(0.6, 0.72, 0.07, 0.035)],
      },
    ],
  },
  {
    id: 'sun',
    title: 'Sun',
    icon: '☀️',
    steps: [
      { instruction: 'Draw a big circle.', shapes: [circle(0.5, 0.5, 0.22)] },
      {
        instruction: 'Add sun rays poking out all around.',
        shapes: [
          line(0.5, 0.24, 0.5, 0.12),
          line(0.5, 0.76, 0.5, 0.88),
          line(0.24, 0.5, 0.12, 0.5),
          line(0.76, 0.5, 0.88, 0.5),
          line(0.34, 0.34, 0.25, 0.25),
          line(0.66, 0.34, 0.75, 0.25),
          line(0.34, 0.66, 0.25, 0.75),
          line(0.66, 0.66, 0.75, 0.75),
        ],
      },
      {
        instruction: 'Draw two eyes and a happy smile.',
        shapes: [circle(0.43, 0.46, 0.025), circle(0.57, 0.46, 0.025), curve(0.42, 0.55, 0.5, 0.63, 0.58, 0.55)],
      },
    ],
  },
  {
    id: 'house',
    title: 'House',
    icon: '🏠',
    steps: [
      { instruction: 'Draw a square for the walls.', shapes: [rect(0.28, 0.45, 0.44, 0.4)] },
      { instruction: 'Add a triangle roof on top.', shapes: [poly([[0.24, 0.45], [0.5, 0.24], [0.76, 0.45]])] },
      { instruction: 'Draw a door.', shapes: [rect(0.44, 0.62, 0.12, 0.23)] },
      {
        instruction: 'Add two windows.',
        shapes: [rect(0.33, 0.52, 0.1, 0.1), rect(0.57, 0.52, 0.1, 0.1)],
      },
    ],
  },
  {
    id: 'boat',
    title: 'Boat',
    icon: '⛵',
    steps: [
      { instruction: 'Draw the boat bottom (a wide bowl shape).', shapes: [poly([[0.25, 0.6], [0.75, 0.6], [0.68, 0.75], [0.32, 0.75]])] },
      { instruction: 'Draw a tall mast going up.', shapes: [line(0.5, 0.6, 0.5, 0.2)] },
      { instruction: 'Add a triangle sail.', shapes: [poly([[0.5, 0.24], [0.5, 0.56], [0.28, 0.56]])] },
      {
        instruction: 'Draw some wavy water.',
        shapes: [curve(0.12, 0.82, 0.22, 0.77, 0.32, 0.82), curve(0.32, 0.82, 0.42, 0.87, 0.52, 0.82)],
      },
    ],
  },
  {
    id: 'star',
    title: 'Star',
    icon: '⭐',
    steps: [
      {
        instruction: 'Draw a big five-pointed star.',
        shapes: [
          poly([
            [0.5, 0.17],
            [0.571, 0.353],
            [0.766, 0.363],
            [0.614, 0.487],
            [0.665, 0.677],
            [0.5, 0.57],
            [0.335, 0.677],
            [0.386, 0.487],
            [0.234, 0.363],
            [0.43, 0.353],
          ]),
        ],
      },
      {
        instruction: 'Give your star a happy face!',
        shapes: [circle(0.44, 0.4, 0.02), circle(0.56, 0.4, 0.02), curve(0.44, 0.47, 0.5, 0.52, 0.56, 0.47)],
      },
    ],
  },
  {
    id: 'balloon',
    title: 'Balloon',
    icon: '🎈',
    steps: [
      { instruction: 'Draw a big round balloon.', shapes: [ellipse(0.5, 0.4, 0.2, 0.24)] },
      { instruction: 'Add a little knot at the bottom.', shapes: [poly([[0.47, 0.64], [0.53, 0.64], [0.5, 0.68]])] },
      { instruction: 'Draw a wavy string hanging down.', shapes: [curve(0.5, 0.68, 0.62, 0.8, 0.45, 0.92)] },
      {
        instruction: 'Draw a smiley face on it.',
        shapes: [circle(0.44, 0.36, 0.02), circle(0.56, 0.36, 0.02), curve(0.44, 0.44, 0.5, 0.5, 0.56, 0.44)],
      },
    ],
  },
]
