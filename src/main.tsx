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

// import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
// import { getFullnodeUrl } from '@mysten/sui/client'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mysten/dapp-kit/dist/index.css'
import Mode from './mode'
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react'

WebApp.ready()

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
      {/* <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig}>
          <WalletProvider> */}
      <TonConnectUIProvider
        manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json"
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
          twaReturnUrl: 'https://t.me/DemoDappWithTonConnectBot/demo',
        }}
      >
        <PopupProvider>
          <RouterProvider router={router}></RouterProvider>
        </PopupProvider>
      </TonConnectUIProvider>

      {/* </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider> */}
    </Provider>
  </React.StrictMode>
)
