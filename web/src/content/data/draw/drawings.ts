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
  {
    id: 'plant-diagram',
    title: 'Plant Parts',
    icon: '🌿',
    steps: [
      { instruction: 'Draw roots at bottom as wiggly lines.', shapes: [line(0.5,0.75,0.4,0.9), line(0.5,0.75,0.5,0.92), line(0.5,0.75,0.6,0.9)] },
      { instruction: 'Draw stem going up.', shapes: [line(0.5,0.75,0.5,0.4)] },
      { instruction: 'Add two leaves on stem.', shapes: [ellipse(0.4,0.6,0.08,0.04), ellipse(0.6,0.55,0.08,0.04)] },
      { instruction: 'Draw flower on top with petals.', shapes: [circle(0.5,0.32,0.07), circle(0.5,0.18,0.06), circle(0.5,0.46,0.06), circle(0.36,0.32,0.06), circle(0.64,0.32,0.06)] },
    ],
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    icon: '🦴',
    steps: [
      { instruction: 'Draw oval skull at top.', shapes: [ellipse(0.5,0.25,0.12,0.14)] },
      { instruction: 'Draw spine line down middle.', shapes: [line(0.5,0.39,0.5,0.7)] },
      { instruction: 'Add rib cage lines.', shapes: [line(0.38,0.45,0.62,0.45), line(0.36,0.52,0.64,0.52), line(0.37,0.59,0.63,0.59)] },
      { instruction: 'Draw arm bones and leg bones.', shapes: [line(0.38,0.45,0.28,0.6), line(0.62,0.45,0.72,0.6), line(0.44,0.7,0.4,0.88), line(0.56,0.7,0.6,0.88)] },
    ],
  },
  {
    id: 'water-cycle',
    title: 'Water Cycle',
    icon: '💧',
    steps: [
      { instruction: 'Draw sun in corner.', shapes: [circle(0.8,0.2,0.1)] },
      { instruction: 'Draw cloud with three puffs.', shapes: [circle(0.35,0.3,0.08), circle(0.45,0.28,0.1), circle(0.55,0.3,0.08)] },
      { instruction: 'Draw rain falling down.', shapes: [line(0.38,0.38,0.36,0.46), line(0.45,0.38,0.43,0.46), line(0.52,0.38,0.5,0.46)] },
      { instruction: 'Draw wavy river and arrow up for evaporation.', shapes: [curve(0.2,0.75,0.35,0.7,0.5,0.75), curve(0.5,0.75,0.65,0.8,0.8,0.75), line(0.65,0.55,0.65,0.4), poly([[0.6,0.45],[0.7,0.45],[0.65,0.38]])] },
    ],
  },
  {
    id: 'rock-layers',
    title: 'Rock Layers',
    icon: '🪨',
    steps: [
      { instruction: 'Draw three wavy layers for sedimentary rock.', shapes: [rect(0.2,0.3,0.6,0.12), rect(0.2,0.44,0.6,0.12), rect(0.2,0.58,0.6,0.14)] },
      { instruction: 'Add fossil shell shape in middle layer.', shapes: [curve(0.4,0.5,0.45,0.46,0.5,0.5), curve(0.5,0.5,0.55,0.46,0.6,0.5)] },
      { instruction: 'Draw soil top layer with grass.', shapes: [rect(0.2,0.22,0.6,0.08), line(0.3,0.22,0.3,0.16), line(0.5,0.22,0.5,0.14), line(0.7,0.22,0.7,0.17)] },
    ],
  },
  {
    id: 'magnet',
    title: 'Magnet Bar',
    icon: '🧲',
    steps: [
      { instruction: 'Draw long rectangle bar magnet.', shapes: [rect(0.25,0.42,0.5,0.16)] },
      { instruction: 'Mark N on left end and S on right.', shapes: [line(0.25,0.42,0.25,0.58), line(0.75,0.42,0.75,0.58)] },
      { instruction: 'Draw curved field lines looping top and bottom.', shapes: [curve(0.3,0.42,0.5,0.2,0.7,0.42), curve(0.3,0.58,0.5,0.8,0.7,0.58)] },
      { instruction: 'Add small paperclips attracted near poles.', shapes: [rect(0.18,0.4,0.04,0.02), rect(0.18,0.46,0.04,0.02), rect(0.78,0.4,0.04,0.02), rect(0.78,0.52,0.04,0.02)] },
    ],
  },
  {
    id: 'light-ray',
    title: 'Light Ray',
    icon: '💡',
    steps: [
      { instruction: 'Draw flat mirror line in middle.', shapes: [line(0.2,0.5,0.8,0.5)] },
      { instruction: 'Draw incoming ray arrow to mirror at angle.', shapes: [line(0.3,0.2,0.45,0.5), poly([[0.42,0.42],[0.48,0.48],[0.4,0.48]])] },
      { instruction: 'Draw reflected ray bouncing off same angle.', shapes: [line(0.45,0.5,0.6,0.2), poly([[0.57,0.28],[0.52,0.22],[0.6,0.24]])] },
      { instruction: 'Label angle in equals angle out with arcs.', shapes: [curve(0.45,0.5,0.42,0.44,0.38,0.44), curve(0.45,0.5,0.48,0.44,0.52,0.44)] },
    ],
  },
  {
    id: 'uk-map',
    title: 'UK Map',
    icon: '🗺️',
    steps: [
      { instruction: 'Draw outline shape for Great Britain blob.', shapes: [poly([[0.4,0.2],[0.6,0.22],[0.65,0.4],[0.58,0.7],[0.42,0.72],[0.35,0.5]])] },
      { instruction: 'Add little box for Northern Ireland on left.', shapes: [rect(0.28,0.42,0.08,0.1)] },
      { instruction: 'Mark four capital dots.', shapes: [circle(0.52,0.6,0.015), circle(0.48,0.32,0.015), circle(0.42,0.5,0.015), circle(0.3,0.47,0.015)] },
      { instruction: 'Label England Scotland Wales NI initial letters.', shapes: [line(0.5,0.55,0.5,0.65), line(0.46,0.28,0.46,0.36)] },
    ],
  },
  {
    id: 'europe-map',
    title: 'Europe Outline',
    icon: '🌍',
    steps: [
      { instruction: 'Draw rough Europe blob shape.', shapes: [poly([[0.3,0.3],[0.7,0.25],[0.78,0.45],[0.65,0.72],[0.4,0.75],[0.25,0.55]])] },
      { instruction: 'Add UK island off northwest.', shapes: [poly([[0.28,0.35],[0.35,0.33],[0.33,0.45],[0.26,0.47]])] },
      { instruction: 'Mark France Spain Italy Germany with dots.', shapes: [circle(0.42,0.48,0.015), circle(0.35,0.6,0.015), circle(0.52,0.58,0.015), circle(0.5,0.4,0.015)] },
    ],
  },
  {
    id: 'compass',
    title: 'Compass Rose',
    icon: '🧭',
    steps: [
      { instruction: 'Draw circle outer ring.', shapes: [circle(0.5,0.5,0.28)] },
      { instruction: 'Draw N S E W cross lines.', shapes: [line(0.5,0.22,0.5,0.78), line(0.22,0.5,0.78,0.5)] },
      { instruction: 'Add arrow heads for north and east.', shapes: [poly([[0.5,0.18],[0.46,0.26],[0.54,0.26]]), poly([[0.82,0.5],[0.74,0.46],[0.74,0.54]])] },
      { instruction: 'Label N E S W initial positions with small lines.', shapes: [line(0.5,0.78,0.5,0.82), line(0.22,0.5,0.18,0.5)] },
    ],
  },
  {
    id: 'right-angle',
    title: 'Right Angle',
    icon: '📐',
    steps: [
      { instruction: 'Draw horizontal base line.', shapes: [line(0.25,0.65,0.75,0.65)] },
      { instruction: 'Draw vertical line up from left end forming L shape.', shapes: [line(0.25,0.65,0.25,0.3)] },
      { instruction: 'Add small square at corner to show right angle 90 degrees.', shapes: [poly([[0.25,0.65],[0.32,0.65],[0.32,0.58],[0.25,0.58]])] },
      { instruction: 'Label 90 degrees with arc.', shapes: [curve(0.25,0.65,0.3,0.6,0.32,0.58)] },
    ],
  },
  {
    id: 'parallel',
    title: 'Parallel Lines',
    icon: '〰️',
    steps: [
      { instruction: 'Draw top horizontal line.', shapes: [line(0.2,0.35,0.8,0.35)] },
      { instruction: 'Draw bottom horizontal line same length below parallel.', shapes: [line(0.2,0.55,0.8,0.55)] },
      { instruction: 'Add arrow marks to show they never meet are parallel.', shapes: [line(0.4,0.33,0.4,0.37), line(0.6,0.33,0.6,0.37), line(0.4,0.53,0.4,0.57), line(0.6,0.53,0.6,0.57)] },
      { instruction: 'Draw a third line crossing them to show perpendicular example on left.', shapes: [line(0.25,0.25,0.25,0.75)] },
    ],
  },
  {
    id: 'fraction-circle',
    title: 'Fraction Circle',
    icon: '🥧',
    steps: [
      { instruction: 'Draw big circle outline.', shapes: [circle(0.5,0.5,0.25)] },
      { instruction: 'Draw vertical line dividing halves.', shapes: [line(0.5,0.25,0.5,0.75)] },
      { instruction: 'Draw horizontal line dividing quarters.', shapes: [line(0.25,0.5,0.75,0.5)] },
      { instruction: 'Shade one quarter to show 1/4.', shapes: [poly([[0.5,0.5],[0.5,0.25],[0.75,0.25],[0.75,0.5]])] },
    ],
  },
  {
    id: 'clock-face',
    title: 'Clock Face',
    icon: '⏰',
    steps: [
      { instruction: 'Draw big circle for clock.', shapes: [circle(0.5,0.5,0.28)] },
      { instruction: 'Add 12 3 6 9 markers as small lines.', shapes: [line(0.5,0.22,0.5,0.26), line(0.78,0.5,0.74,0.5), line(0.5,0.78,0.5,0.74), line(0.22,0.5,0.26,0.5)] },
      { instruction: 'Draw hour hand pointing at 3 and minute at 12 for 3 o clock.', shapes: [line(0.5,0.5,0.68,0.5), line(0.5,0.5,0.5,0.28)] },
      { instruction: 'Add Roman numerals XII III VI IX at top right bottom left.', shapes: [line(0.48,0.22,0.52,0.22), line(0.78,0.48,0.78,0.52)] },
    ],
  },
  {
    id: 'sunflower',
    title: 'Sunflower Art',
    icon: '🌻',
    steps: [
      { instruction: 'Draw centre circle.', shapes: [circle(0.5,0.4,0.1)] },
      { instruction: 'Add petals around like sunflower Van Gogh style.', shapes: [ellipse(0.5,0.22,0.06,0.12), ellipse(0.5,0.58,0.06,0.12), ellipse(0.32,0.4,0.12,0.06), ellipse(0.68,0.4,0.12,0.06), ellipse(0.37,0.27,0.05,0.1), ellipse(0.63,0.27,0.05,0.1), ellipse(0.37,0.53,0.05,0.1), ellipse(0.63,0.53,0.05,0.1)] },
      { instruction: 'Draw thick stem down.', shapes: [line(0.5,0.5,0.5,0.85)] },
      { instruction: 'Add large leaf each side.', shapes: [ellipse(0.38,0.65,0.1,0.05), ellipse(0.62,0.72,0.1,0.05)] },
    ],
  },
  {
    id: 'mondrian',
    title: 'Mondrian Grid',
    icon: '🟥',
    steps: [
      { instruction: 'Draw big outer rectangle frame.', shapes: [rect(0.2,0.2,0.6,0.6)] },
      { instruction: 'Add vertical black lines dividing into columns.', shapes: [line(0.45,0.2,0.45,0.8), line(0.62,0.2,0.62,0.8)] },
      { instruction: 'Add horizontal black lines dividing into rows.', shapes: [line(0.2,0.42,0.8,0.42), line(0.2,0.62,0.8,0.62)] },
      { instruction: 'Imagine colouring top left red top right blue bottom yellow white rest like Piet Mondrian art.', shapes: [rect(0.2,0.2,0.25,0.22), rect(0.62,0.2,0.18,0.22), rect(0.2,0.62,0.25,0.18)] },
    ],
  },
]
