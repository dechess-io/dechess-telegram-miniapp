import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import App from './App'
import Game from './components/Chess/Game/Game'
import Mode from './components/Mode/Mode'
import WebApp from '@twa-dev/sdk'
import { store } from './redux/store'
// import  Telegram from 'telegram-webapps'
// import './styles/main.scss'

// import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
// import { getFullnodeUrl } from '@mysten/sui/client'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react'
import BotGame from './components/Chess/BotGame/BotGame'
// import './index.css'

WebApp.ready()
WebApp.expand()
WebApp.MainButton.enable()
WebApp.enableClosingConfirmation()
// (Telegram as any).disableVerticalSwipes();

// const networkConfig = {
//   testnet: {
//     url: 'https://fullnode.testnet.sui.io:443',
//   },
//   mainnet: {
//     url: 'https://fullnode.mainnet.sui.io:443',
//   },
// }
// const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    children: [
      {
        path: '/',
        element: <App />,
      },
      { path: '/game/:id', element: <Game /> },
      { path: '/mode', element: <Mode isBotMode={false} /> },
      { path: '/bot', element: <Mode isBotMode={true} /> },
      { path: '/game-bot', element: <BotGame /> },
      // { path: '/tournament', element: <TournamentBoard /> },
      // { path: "/tournament", element: <Tournament2 /> },
    ],
  },
])

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig}>
          <WalletProvider> */}
      <TonConnectUIProvider
        manifestUrl="https://miniapp.dechess.io/tonconnect-manifest.json"
        uiPreferences={{ theme: THEME.DARK }}
        walletsListConfiguration={{
          includeWallets: [
            {
              appName: 'safepalwallet',
              name: 'SafePal',
              imageUrl: 'https://s.pvcliping.com/web/public_image/SafePal_x288.png',
              tondns: '',
              aboutUrl: 'https://www.safepal.com',
              universalLink: 'https://link.safepal.io/ton-connect',
              jsBridgeKey: 'safepalwallet',
              bridgeUrl: 'https://ton-bridge.safepal.com/tonbridge/v1/bridge',
              platforms: ['ios', 'android', 'chrome', 'firefox'],
            },
            {
              appName: 'bitgetTonWallet',
              name: 'Bitget Wallet',
              imageUrl:
                'https://raw.githubusercontent.com/bitkeepwallet/download/main/logo/png/bitget%20wallet_logo_iOS.png',
              aboutUrl: 'https://web3.bitget.com',
              deepLink: 'bitkeep://',
              jsBridgeKey: 'bitgetTonWallet',
              bridgeUrl: 'https://bridge.tonapi.io/bridge',
              platforms: ['ios', 'android', 'chrome'],
              universalLink: 'https://bkcode.vip/ton-connect',
            },
            {
              appName: 'tonwallet',
              name: 'TON Wallet',
              imageUrl: 'https://wallet.ton.org/assets/ui/qr-logo.png',
              aboutUrl:
                'https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd',
              universalLink: 'https://wallet.ton.org/ton-connect',
              jsBridgeKey: 'tonwallet',
              bridgeUrl: 'https://bridge.tonapi.io/bridge',
              platforms: ['chrome', 'android'],
            },
          ],
        }}
        actionsConfiguration={{
          twaReturnUrl: 'https://t.me/dechess_bot',
        }}
      >
        <RouterProvider router={router}></RouterProvider>
      </TonConnectUIProvider>

      {/* </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider> */}
    </Provider>
  </React.StrictMode>
)
