import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import App from './App'
import Game from './components/Chess/Game'
import PopupProvider from './components/Popup/PopupProvider'
import WebApp from '@twa-dev/sdk'
import { store } from './redux/store'
import './styles/main.scss'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import Mode from './mode'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
WebApp.ready()
WebApp.expand()

const networkConfig = {
  testnet: {
    url: 'https://fullnode.testnet.sui.io:443',
  },
  mainnet: {
    url: 'https://fullnode.mainnet.sui.io:443',
  },
}
const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    element: (
      <PopupProvider>
        <Outlet />
      </PopupProvider>
    ),
    children: [
      {
        path: '/',
        element: <App />,
      },
      { path: '/game/:id', element: <Game /> },
      { path: '/mode', element: <Mode /> },
      // { path: '/tournament', element: <TournamentBoard /> },
      // { path: "/tournament", element: <Tournament2 /> },
    ],
  },
])

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig}>
          <WalletProvider>
            <PopupProvider>
              <TonConnectUIProvider
                manifestUrl="https://miniapp.dechess.io/tonconnect-manifest.json"
                actionsConfiguration={{ twaReturnUrl: 'https://t.me/dechess_bot' }}
              >
                <RouterProvider router={router}></RouterProvider>
              </TonConnectUIProvider>
            </PopupProvider>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)
