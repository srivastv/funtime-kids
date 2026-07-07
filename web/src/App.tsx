import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './app/Layout'
import Home from './pages/Home'
import QuizPage from './games/quiz/QuizPage'
import TypingPage from './games/typing/TypingPage'
import FallingPage from './games/falling/FallingPage'
import DrawPage from './games/draw/DrawPage'

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
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
