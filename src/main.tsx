import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import { store } from './redux/store'

import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react'
import eruda from 'eruda'
import { router } from './routes'
import PopupProvider from './components/Chess/Popup/PopupProvider'

eruda.init()
WebApp.ready()
WebApp.expand()
WebApp.MainButton.enable()
WebApp.enableClosingConfirmation()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
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
        <PopupProvider>
          <RouterProvider router={router}></RouterProvider>
        </PopupProvider>
      </TonConnectUIProvider>
    </Provider>
  </React.StrictMode>
)
