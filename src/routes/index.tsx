import { createBrowserRouter } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import MainLayout from '../layouts/MainLayout'
import Game from '../components/Chess/Game/Game'
import Mode from '../components/Mode/Mode'
import BotGame from '../components/Chess/BotGame/BotGame'
import Puzzle from '../components/Chess/Puzzle/Puzzle'
import AuthLayout from '../layouts/AuthLayout'
import MainPage from '../pages/MainPage'
import Login from '../pages/Login'
import WalletPage from '../pages/WalletPage'
import ReferralPage from '../pages/ReferralPage'
import ProfilePage from '../pages/Profile/ProfilePage'

export const router = createBrowserRouter([
  {
    children: [
      {
        path: '/',
        element: (
          <PrivateRoute
            element={
              <MainLayout isFooter={false}>
                <MainPage />
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
        path: '/wallet',
        element: (
          <PrivateRoute
            element={
              <MainLayout isFooter={false}>
                <WalletPage />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/referral',
        element: (
          <PrivateRoute
            element={
              <MainLayout isFooter={false}>
                <ReferralPage />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/profile',
        element: (
          <PrivateRoute
            element={
              <MainLayout isFooter={false}>
                <ProfilePage />
              </MainLayout>
            }
          />
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
