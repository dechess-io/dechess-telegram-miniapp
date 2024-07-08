import { useNavigate } from 'react-router-dom'
import Header from './components/Header/Header'
import Progress from './components/ProgressChart/Progress'
import { hasJWT } from './utils/utils'
import Button from './components/Button/Button'
import Footer from './components/Footer/Footer.tsx'
import { useEffect, useState } from 'react'
import { socket } from './services/socket.ts'
import GamePopup from './components/Chess/Popup/GamePopup.tsx'
import { App as MyApp } from 'konsta/react'
import './index.css'
import { KonstaProvider, Button as KonstaButton, Block, Card } from 'konsta/react'

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

  const renderActionButton = (label: string, iconSrc: string) => {
    return (
      <Card className="flex">
        <button className="bg-[linear-gradient(135deg,_#1F2428_0%,_#2E3E5E_100%)] text-[16px] text-black font-bold py-4 px-4 rounded-[16px] h-160 w-[180px] [box-shadow:0px_-4px_0px_0px_#00000033_inset]">
          <div className="h-full flex flex-col gap-3">
            <span className="text-white font-ibm">{label}</span>
            <div className="flex items-center justify-center">
              <img src={iconSrc} alt={label} className="h-80 w-auto" />
            </div>
          </div>
        </button>
      </Card>
    )
  }

  const renderGameMode = (title: string, imageSrc: string, rating: number) => {
    return (
      <Card className="p-1 flex flex-col items-center">
        <span className="text-white font-ibm">{title}</span>
        <div className="flex flex-row items-center gap-2">
          <img src={imageSrc} alt={title} className="h-24 w-24" />
          <span className="text-white font-ibm">{rating}</span>
        </div>
      </Card>
    )
  }

  return (
    <>
      <KonstaProvider theme="ios">
        <MyApp theme="ios" safeAreas>
          <Header />
          <Block className="bg-[#041d21] flex flex-col pt-6">
            <div className="border-none rounded-xl  mx-auto">
              <div className="w-full mx-auto flex flex-col items-center justify-center text-center text-white pt-12 pb-20">
                <Block className="flex flex-row bg-[linear-gradient(180deg,_#303030_0%,_#000000_100%)]  rounded-lg pl-2">
                  <div className="flex-auto ">
                    <Progress losses={3} totalGames={10} wins={7} />
                  </div>
                  <div className="flex-auto  flex items-center justify-center"></div>
                  <div className="flex-auto rounded-lg py-2">
                    <div>
                      <div>
                        <h3 className="font-ibm text-[16px]">Elo Rating</h3>
                      </div>
                      <div className="flex flex-col justify-between">
                        {renderGameMode('Rabit', '/QuickLock.svg', 500)}
                        {renderGameMode('Bullet', '/bullet.svg', 500)}
                        {renderGameMode('Blitz', '/Thunder.svg', 500)}
                      </div>
                    </div>
                  </div>
                </Block>
                <Block className="w-full pt-3">
                  <Block className="flex justify-between">
                    {renderActionButton('Leaderboard', '/Rank.svg')}
                    {renderActionButton('Quest', '/layer.svg')}
                  </Block>
                  <Block className="flex justify-between">
                    {renderActionButton('Play Versus Bot', '/ChessBoard.svg')}
                    {renderActionButton('Puzzles', '/Piece.svg')}
                  </Block>
                </Block>
                <div className="flex-auto p-4">
                  <KonstaButton
                    onClick={handlePlayClick}
                    className="bg-[linear-gradient(90.15deg,_#67E4FF_0.07%,_#009ED0_98.38%)] text-[20px] text-black font-bold py-2 px-6 rounded-[16px] h-64 w-[370px] border-b-4 border-blue-200 font-ibm"
                    disabled={!hasJWT()}
                  >
                    <span>Play</span>
                  </KonstaButton>
                </div>
              </div>
            </div>
          </Block>
          {showPopup && (
            <GamePopup
              showPopup={showPopup}
              setShowPopup={setShowPopup}
              title=""
              message="You have an unfinished game. Do you want to rejoin?"
              onCancel={handleCancel}
              onConfirm={handleRejoin}
            />
          )}
          <Footer />
        </MyApp>
      </KonstaProvider>
    </>
  )
}

export default App
