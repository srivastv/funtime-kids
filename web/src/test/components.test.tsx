import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CapitalMatchCard from '../games/geo/CapitalMatchCard'
import TypingRace from '../games/typing/TypingRace'
import DrawCanvas from '../games/draw/DrawCanvas'
import { sampleLesson } from '../games/draw/trace'
import LabHub from '../games/odd/LabHub'
import PlantGrower from '../games/odd/PlantGrower'
import CircuitBuilder from '../games/odd/CircuitBuilder'
import SoundLab from '../games/odd/SoundLab'
import CodePage from '../games/code/CodePage'
import RobotGame from '../games/code/RobotGame'
import { ROUTE_LEVELS } from '../games/code/levels'
import type { GeoQuestion, TypingLesson, DrawingLesson } from '../content/types'

// jsdom has no Web Audio; stub the sound module so components can call it freely.
vi.mock('../lib/sound', () => ({
  sound: new Proxy({}, { get: () => () => {} }),
  startMusic: () => {},
  stopMusic: () => {},
}))

describe('CapitalMatchCard', () => {
  const question: GeoQuestion = {
    type: 'capitalmatch',
    prompt: 'Match each country to its capital',
    choices: ['France', 'Spain', 'Italy', 'Germany'],
    answerIndex: 0,
    itemId: 'france',
    funFact: 'fact',
    pairs: [
      { country: 'France', capital: 'Paris' },
      { country: 'Spain', capital: 'Madrid' },
      { country: 'Italy', capital: 'Rome' },
      { country: 'Germany', capital: 'Berlin' },
    ],
  }

  it('renders countries and capitals and reports correct when all matched right', () => {
    const onAnswer = vi.fn()
    render(<CapitalMatchCard question={question} index={0} total={10} lives={3} onAnswer={onAnswer} feedback={null} />)
    expect(screen.getByText(/Match each country/)).toBeInTheDocument()

    for (const { country, capital } of question.pairs!) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(country) }))
      fireEvent.click(screen.getByRole('button', { name: new RegExp(capital) }))
    }
    fireEvent.click(screen.getByRole('button', { name: /Check my matches/ }))
    expect(onAnswer).toHaveBeenCalledWith(0)
  })

  it('reports incorrect when a match is wrong', () => {
    const onAnswer = vi.fn()
    render(<CapitalMatchCard question={question} index={0} total={10} lives={3} onAnswer={onAnswer} feedback={null} />)
    // Deliberately mis-match France→Madrid, then the rest correctly.
    const wrong = [
      ['France', 'Madrid'],
      ['Spain', 'Paris'],
      ['Italy', 'Rome'],
      ['Germany', 'Berlin'],
    ]
    for (const [country, capital] of wrong) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(country) }))
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^🏛️ ${capital}`) }))
    }
    fireEvent.click(screen.getByRole('button', { name: /Check my matches/ }))
    expect(onAnswer).toHaveBeenCalledWith(-1)
  })
})

describe('TypingRace', () => {
  const lesson: TypingLesson = { id: 't1', title: 'Test', text: 'hi there', difficulty: 1 }

  it('finishes and reports a win when the text is typed', () => {
    const onFinish = vi.fn()
    render(<TypingRace lesson={lesson} onFinish={onFinish} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: lesson.text } })
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onFinish.mock.calls[0][0]).toMatchObject({ won: true, accuracy: 100 })
  })
})

describe('DrawCanvas trace mode', () => {
  const lesson: DrawingLesson = {
    id: 'line',
    title: 'Line',
    icon: '➖',
    steps: [{ instruction: 'draw', shapes: [{ kind: 'line', x1: 0.1, y1: 0.5, x2: 0.9, y2: 0.5 }] }],
  }

  it('shows the Score button in trace mode', () => {
    render(
      <DrawCanvas
        lesson={lesson}
        stepIndex={lesson.steps.length}
        trace={{ target: sampleLesson(lesson.steps, 400), bestKey: 'draw:trace:line' }}
      />,
    )
    expect(screen.getByRole('button', { name: /Score my drawing/ })).toBeInTheDocument()
  })
})

describe('Science Lab stations', () => {
  it('LabHub shows the four stations and reports the picked one', () => {
    const onPick = vi.fn()
    render(<LabHub onPick={onPick} />)
    for (const name of ['Science Quiz', 'Sound & Pitch Lab', 'Circuit Builder', 'Plant Grower']) {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: /Circuit Builder/ }))
    expect(onPick).toHaveBeenCalledWith('circuit')
  })

  it('PlantGrower advances a day when Next Day is tapped', () => {
    render(<PlantGrower onExit={() => {}} onHome={() => {}} />)
    expect(screen.getByText('🌱 Plant Grower')).toBeInTheDocument()
    expect(screen.getByText('Day 0')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Water/ }))
    fireEvent.click(screen.getByRole('button', { name: /Next Day/ }))
    expect(screen.getByText('Day 1')).toBeInTheDocument()
  })

  it('CircuitBuilder renders the first puzzle with a Test button', () => {
    render(<CircuitBuilder onExit={() => {}} onHome={() => {}} />)
    expect(screen.getByText('⚡ Circuit Builder')).toBeInTheDocument()
    expect(screen.getByText(/Circuit 1 \/ 5/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Test circuit/ })).toBeInTheDocument()
  })

  it('SoundLab renders the xylophone and a Copy the Tune button', () => {
    render(<SoundLab onExit={() => {}} onHome={() => {}} />)
    expect(screen.getByText('🔊 Sound & Pitch Lab')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copy the Tune/ })).toBeInTheDocument()
    // eight xylophone bars (C D E F G A B C)
    expect(screen.getAllByRole('button', { name: /^Note / }).length).toBe(8)
  })
})

describe('Code Lab', () => {
  it('CodePage hub shows the three challenges and opens one', () => {
    render(<MemoryRouter><CodePage /></MemoryRouter>)
    for (const name of ['Robot Route', 'Debug It!']) {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: /Robot Route/ }))
    expect(screen.getByText('🤖 Robot Route')).toBeInTheDocument()
  })

  it('RobotGame builds a program from the arrow palette', () => {
    render(<RobotGame levels={ROUTE_LEVELS} title="Robot Route" icon="🤖" storageKey="test:route" onExit={() => {}} onHome={() => {}} />)
    expect(screen.getByText(/0 blocks/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Add right/ }))
    fireEvent.click(screen.getByRole('button', { name: /Add right/ }))
    expect(screen.getByText(/2 blocks/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Run/ })).toBeInTheDocument()
  })

})
