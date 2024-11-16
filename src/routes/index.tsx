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
import MintNFTPage from '../pages/MintNFTPage'
import QuestPage from '../pages/QuestPage'
import EarnPage from '../pages/EarnPage'

export const router = createBrowserRouter([
  {
    children: [
      {
        path: '/',
        element: (
          <PrivateRoute
            element={
              <MainLayout>
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
              <MainLayout>
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
              <MainLayout>
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
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/mint-nft',
        element: (
          <PrivateRoute
            element={
              <MainLayout>
                <MintNFTPage />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/quest',
        element: (
          <PrivateRoute
            element={
              <MainLayout>
                <QuestPage />
              </MainLayout>
            }
          />
        ),
      },
      {
        path: '/earn',
        element: (
          <PrivateRoute
            element={
              <MainLayout>
                <EarnPage />
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
              <MainLayout>
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
              <MainLayout>
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
