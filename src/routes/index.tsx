import { createBrowserRouter } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import MainLayout from '../layouts/MainLayout'
import App from '../App'
import Login from '../components/Login'
import Game from '../components/Chess/Game/Game'
import Mode from '../components/Mode/Mode'
import BotGame from '../components/Chess/BotGame/BotGame'
import Puzzle from '../components/Chess/Puzzle/Puzzle'
import AuthLayout from '../layouts/AuthLayout'

export const router = createBrowserRouter([
  {
    children: [
      {
        path: '/',
        element: (
          <PrivateRoute
            element={
              <MainLayout>
                <App />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/login',
        element: (
          <AuthLayout>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: '/game/:id',
        element: (
          <PrivateRoute
            element={
              <MainLayout isFooter={false}>
                <Game />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/mode',
        element: (
          <PrivateRoute
            element={
              <MainLayout>
                <Mode isBotMode={false} />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/bot',
        element: (
          <PrivateRoute
            element={
              <MainLayout>
                <Mode isBotMode={true} />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/game-bot',
        element: (
          <PrivateRoute
            element={
              <MainLayout isFooter={false}>
                <BotGame />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/puzzle',
        element: (
          <PrivateRoute
            element={
              <MainLayout>
                <Puzzle />
              </MainLayout>
            }
          />
        ),
      },
    ],
  },
])
