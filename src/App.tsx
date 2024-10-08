import { useNavigate } from 'react-router-dom'
import Progress from './components/ProgressChart/Progress'
import { hasJWT } from './utils/utils'
import { useEffect, useMemo, useState } from 'react'
import { socket } from './services/socket.ts'
import './index.css'
import ActionButton from './components/Button/ActionButton.tsx'
import GameModeButton from './components/Button/GameModeButton.tsx'
import ReactDialog from './components/Dialog/ReactDialog.tsx'
import { Block } from 'konsta/react'
import Button from './components/Button/Button.tsx'
import MainMenu from './pages/Login.tsx'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets'
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

function App() {
  const navigate = useNavigate()
  const [showPopup, setShowPopup] = useState(false)
  const [data, setData] = useState<any>()
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/anza-xyz/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new UnsafeBurnerWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  )
  // const handlePlayClick = () => {
  //   navigate('/mode')
  // }

  // useEffect(() => {
  //   socket.emit('reconnect')
  // }, [])

  // useEffect(() => {
  //   socket.on('rejoinGame', (data) => {
  //     if (data.status === 200 && data.game_id) {
  //       setData(data)
  //       setTimeout(() => {
  //         setShowPopup(true)
  //       }, 1500)
  //     }
  //   })
  // }, [])

  // const handleRejoin = () => {
  //   socket.emit('joinGame', { game_id: data.game_id })
  //   navigate('/game/' + data.game_id)
  //   setShowPopup(false)
  // }

  // const handleCancel = () => {
  //   setShowPopup(false)
  //   socket.emit('resign', {
  //     game_id: data.game_id,
  //     isGameOver: true,
  //     isGameDraw: false,
  //     winner: data.opponent,
  //     loser: data.user,
  //   })
  // }

  // const actionButtonsConfig = useMemo(
  //   () => [
  //     { label: 'Leaderboard', iconSrc: '/Rank.svg', navigateTo: '/' },
  //     { label: 'Quest', iconSrc: '/layer.svg', navigateTo: '/' },
  //     { label: 'Play Versus Bot', iconSrc: '/ChessBoard.svg', navigateTo: '/bot' },
  //     { label: 'Puzzles', iconSrc: '/Piece.svg', navigateTo: '/' },
  //   ],
  //   []
  // )

  // const createActionButton = (config: any) => (
  //   <ActionButton
  //     key={config.label}
  //     label={config.label}
  //     iconSrc={config.iconSrc}
  //     onClick={() => navigate(config.navigateTo)}
  //   />
  // )

  return (
    <>
      {/* <ReactDialog
        open={showPopup}
        onHide={() => setShowPopup(false)}
        title=""
        content="You have an unfinished game. Do you want to rejoin?"
        onOk={handleRejoin}
        onCancel={handleCancel}
      /> */}
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <WalletMultiButton />
            <WalletDisconnectButton />
            {/* Your app's components go here, nested within the context providers. */}
            <MainMenu />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  )
}

export default App
