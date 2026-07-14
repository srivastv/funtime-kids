import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './app/Layout'
import Home from './pages/Home'
import Backpack from './pages/Backpack'
import QuizPage from './games/quiz/QuizPage'
import TypingPage from './games/typing/TypingPage'
import FallingPage from './games/falling/FallingPage'
import DrawPage from './games/draw/DrawPage'
import GeoPage from './games/geo/GeoPage'
import OddSciencePage from './games/odd/OddSciencePage'
import NumberRiverPage from './games/numberriver/NumberRiverPage'
import CodePage from './games/code/CodePage'
import MathsPage from './games/maths/MathsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'typing', element: <TypingPage /> },
      { path: 'falling', element: <FallingPage /> },
      { path: 'draw', element: <DrawPage /> },
      { path: 'geo', element: <GeoPage /> },
      { path: 'odd', element: <OddSciencePage /> },
      { path: 'numberriver', element: <NumberRiverPage /> },
      { path: 'code', element: <CodePage /> },
      { path: 'maths', element: <MathsPage /> },
      { path: 'backpack', element: <Backpack /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
