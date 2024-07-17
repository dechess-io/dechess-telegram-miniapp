import { useNavigate } from 'react-router-dom'
import Header from './components/Header/Header'
import Progress from './components/ProgressChart/Progress'
import { hasJWT } from './utils/utils'
import Footer from './components/Footer/Footer.tsx'
import { useEffect, useState } from 'react'
import { socket } from './services/socket.ts'
import { Page } from 'konsta/react'
import './index.css'
import { Button, Block, App as KonstaApp } from 'konsta/react'
import ActionButton from './components/Button/ActionButton.tsx'
import GameModeButton from './components/Button/GameModeButton.tsx'
import { isAndroid } from 'react-device-detect'
import ReactDialog from './components/Dialog/ReactDialog.tsx'

function App() {
  const navigate = useNavigate()
  const [showPopup, setShowPopup] = useState(false)
  const [data, setData] = useState<any>()
  const handlePlayClick = () => {
    navigate('/mode')
  }

  useEffect(() => {
    socket.emit('reconnect')
  }, [])

  useEffect(() => {
    socket.on('rejoinGame', (data) => {
      if (data.status === 200 && data.game_id) {
        setData(data)
        setTimeout(() => {
          setShowPopup(true)
        }, 1500)
      }
    })
  }, [])

  const handleRejoin = () => {
    navigate('/game/' + data.game_id)
    setShowPopup(false)
  }

  const handleCancel = () => {
    setShowPopup(false)
    socket.emit('resign', {
      game_id: data.game_id,
      isGameOver: true,
      isGameDraw: false,
      winner: data.opponent,
      loser: data.user,
    })
  }

  const theme = isAndroid ? 'material' : 'ios'

  const actionButtonsConfig = [
    { label: 'Leaderboard', iconSrc: '/Rank.svg', navigateTo: '/' },
    { label: 'Quest', iconSrc: '/layer.svg', navigateTo: '/' },
    { label: 'Play Versus Bot', iconSrc: '/ChessBoard.svg', navigateTo: '/bot' },
    { label: 'Puzzles', iconSrc: '/Piece.svg', navigateTo: '/' },
  ]

  const createActionButton = (config: any) => (
    <ActionButton
      key={config.label}
      label={config.label}
      iconSrc={config.iconSrc}
      onClick={() => navigate(config.navigateTo)}
    />
  )

  return (
    <>
      <KonstaApp theme={theme}>
        <Page className="overflow-auto hide-scrollbar">
          <Header />
          <ReactDialog
            open={showPopup}
            onHide={() => setShowPopup(false)}
            title=""
            content="You have an unfinished game. Do you want to rejoin?"
            onOk={handleRejoin}
            onCancel={handleCancel}
          />
          <Block
            className="bg-[#041d21] flex flex-col pb-[20px]"
            style={{ paddingRight: '0', paddingLeft: '0' }}
          >
            <div className="border-none rounded-xl">
              <div className="w-full flex flex-col items-center justify-center text-center text-white">
                <Block>
                  <div className="flex flex-row bg-[linear-gradient(180deg,_#303030_0%,_#000000_100%)] rounded-lg ">
                    <div className="flex-auto ">
                      <Progress losses={3} totalGames={10} wins={7} />
                    </div>
                    <div className="flex-auto rounded-lg">
                      <div>
                        <div>
                          <h3 className="font-ibm text-[16px] pb-4">Elo Rating</h3>
                        </div>
                        <div className="flex flex-col justify-between">
                          <GameModeButton title="Rabbit" imageSrc="/QuickLock.svg" rating={500} />
                          <GameModeButton title="Bullet" imageSrc="/bullet.svg" rating={500} />
                          <GameModeButton title="Blitz" imageSrc="/Thunder.svg" rating={500} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Block>
                <Block>
                  <div
                    className="grid grid-cols-2 gap-2 pb-2"
                    style={{ background: 'transparent' }}
                  >
                    {actionButtonsConfig.map(createActionButton)}
                  </div>
                  <Button
                    onClick={handlePlayClick}
                    className="bg-[linear-gradient(90.15deg,_#67E4FF_0.07%,_#009ED0_98.38%)] text-black font-bold rounded-[16px] border-b-4 border-blue-200 font-ibm "
                    disabled={!hasJWT()}
                  >
                    <span className="text-sm md:text-base lg:text-lg">Play</span>
                  </Button>
                </Block>
              </div>
            </div>
          </Block>

          <Footer />
        </Page>
      </KonstaApp>
    </>
  )
}

export default App
