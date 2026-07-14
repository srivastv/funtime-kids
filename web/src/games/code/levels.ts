import type { Level } from './robot'

// x = column (0 = left), y = row (0 = top). Robot starts top-left-ish and must
// reach the goal 🧀, collecting every gem 💎, without hitting walls 🧱.
export const ROUTE_LEVELS: Level[] = [
  {
    id: 'r1', cols: 3, rows: 3, start: { x: 0, y: 0 }, goal: { x: 2, y: 0 }, walls: [], gems: [],
    hint: 'Go straight to the right!',
  },
  {
    id: 'r2', cols: 4, rows: 3, start: { x: 0, y: 0 }, goal: { x: 3, y: 2 }, walls: [], gems: [],
    hint: 'Right, then down.',
  },
  {
    id: 'r3', cols: 4, rows: 3, start: { x: 0, y: 0 }, goal: { x: 3, y: 0 }, walls: [{ x: 2, y: 0 }], gems: [],
    hint: 'A wall! Go around it.',
  },
  {
    id: 'r4', cols: 4, rows: 4, start: { x: 0, y: 0 }, goal: { x: 0, y: 3 }, walls: [], gems: [{ x: 2, y: 0 }],
    hint: 'Grab the gem first, then head to the cheese.',
  },
  {
    id: 'r5', cols: 5, rows: 4, start: { x: 0, y: 0 }, goal: { x: 3, y: 3 }, walls: [{ x: 1, y: 1 }, { x: 3, y: 1 }], gems: [{ x: 4, y: 0 }],
    hint: 'Plan your turns around the walls.',
  },
  // Level-2: loops. Build the pattern once, then set how many times to Repeat it.
  {
    id: 'r6', cols: 6, rows: 3, start: { x: 0, y: 1 }, goal: { x: 5, y: 1 }, walls: [], gems: [], allowRepeat: true,
    hint: 'Use Repeat to travel far with just one block!',
  },
  {
    id: 'r7', cols: 5, rows: 5, start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, walls: [], gems: [], allowRepeat: true,
    hint: 'A repeating staircase — build one step, then repeat it.',
  },
]

// Debug It! — each program is almost right. Fix it so the robot reaches the cheese.
export const DEBUG_LEVELS: Level[] = [
  {
    id: 'd1', cols: 3, rows: 3, start: { x: 0, y: 0 }, goal: { x: 2, y: 2 }, walls: [], gems: [],
    buggy: { commands: ['R', 'R', 'D'] }, // missing a final Down
    hint: 'The robot stops one step short…',
  },
  {
    id: 'd2', cols: 3, rows: 3, start: { x: 0, y: 0 }, goal: { x: 2, y: 0 }, walls: [], gems: [],
    buggy: { commands: ['R', 'D', 'R'] }, // wrong middle block — should be R,R
    hint: 'One arrow points the wrong way.',
  },
  {
    id: 'd3', cols: 4, rows: 3, start: { x: 0, y: 0 }, goal: { x: 3, y: 2 }, walls: [{ x: 1, y: 0 }], gems: [],
    buggy: { commands: ['R', 'R', 'R', 'D', 'D'] }, // first R crashes into the wall
    hint: 'The very first move crashes. Go down first!',
  },
  {
    id: 'd4', cols: 4, rows: 4, start: { x: 0, y: 0 }, goal: { x: 0, y: 3 }, walls: [], gems: [{ x: 2, y: 0 }],
    buggy: { commands: ['D', 'D', 'D'] }, // forgets to collect the gem
    hint: 'It skipped the gem!',
  },
]
