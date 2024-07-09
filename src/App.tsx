import { useNavigate } from 'react-router-dom'
import Header from './components/Header/Header'
import Progress from './components/ProgressChart/Progress'
import { hasJWT } from './utils/utils'
import Footer from './components/Footer/Footer.tsx'
import { useEffect, useState } from 'react'
import { socket } from './services/socket.ts'
import { Dialog, DialogButton, List, ListGroup, ListItem, App as MyApp, Page } from 'konsta/react'
import './index.css'
import { KonstaProvider, Button, Block, Card } from 'konsta/react'
import ActionButton from './components/Button/ActionButton.tsx'
import GameModeButton from './components/Button/GameModeButton.tsx'

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

  return (
    <>
      <Page>
        <Header />
        <Block className="bg-[#041d21] flex flex-col pt-6">
          <div className="border-none rounded-xl">
            <div className="w-full flex flex-col items-center justify-center text-center text-white">
              <Block className="flex flex-row bg-[linear-gradient(180deg,_#303030_0%,_#000000_100%)]  rounded-lg pl-2">
                {/* <div className="flex-auto ">
                    <Progress losses={3} totalGames={10} wins={7} />
                  </div> */}
                <div className="flex-auto  flex items-center justify-center"></div>
                <div className="flex-auto rounded-lg py-2">
                  <div>
                    <div>
                      <h3 className="font-ibm text-[16px]">Elo Rating</h3>
                    </div>
                    <Block className="flex flex-col justify-between">
                      <GameModeButton title="Rabbit" imageSrc="/QuickLock.svg" rating={500} />
                      <GameModeButton title="Bullet" imageSrc="/bullet.svg" rating={500} />
                      <GameModeButton title="Blitz" imageSrc="/Thunder.svg" rating={500} />
                    </Block>
                  </div>
                </div>
                <div className="flex-auto rounded-lg py-2">
                  <div>
                    <div>
                      <h3 className="font-ibm text-[16px]">Elo Rating</h3>
                    </div>
                    <Block className="flex flex-col justify-between">
                      <GameModeButton title="Rabbit" imageSrc="/QuickLock.svg" rating={500} />
                      <GameModeButton title="Bullet" imageSrc="/bullet.svg" rating={500} />
                      <GameModeButton title="Blitz" imageSrc="/Thunder.svg" rating={500} />
                    </Block>
                  </div>
                </div>
              </Block>
              <Block
                strong
                inset
                className="grid grid-cols-2 gap-4 bg-none"
                style={{ background: 'transparent' }}
              >
                <ActionButton label="Leaderboard" iconSrc="/Rank.svg" />
                <ActionButton label="Quest" iconSrc="/layer.svg" />
                <ActionButton label="Play Versus Bot" iconSrc="/ChessBoard.svg" />
                <ActionButton label="Puzzles" iconSrc="/Piece.svg" />
              </Block>
              <Block>
                <Button
                  onClick={handlePlayClick}
                  className="bg-[linear-gradient(90.15deg,_#67E4FF_0.07%,_#009ED0_98.38%)] text-black font-bold py-2 px-6 rounded-[16px] border-b-4 border-blue-200 font-ibm"
                  disabled={!hasJWT()}
                >
                  <span className="text-sm md:text-base lg:text-lg">Play</span>
                </Button>
              </Block>
            </div>
          </div>
        </Block>

        <Dialog
          opened={showPopup}
          onBackdropClick={setShowPopup}
          title=""
          content="You have an unfinished game. Do you want to rejoin?"
          buttons={
            <>
              <DialogButton onClick={handleRejoin}>Yes</DialogButton>
              <DialogButton onClick={handleCancel}>No</DialogButton>
            </>
          }
        />
        <Footer />
      </Page>
    </>
  )
}

export default App
