import Header from '../Header/Header'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePopups } from '../Popup/PopupProvider'
import { socket } from '../../services/socket'
import 'react-circular-progressbar/dist/styles.css'
import { formatTime, hasJWT } from '../../utils/utils'
import GameSpinner from '../Loading/Spinner'
import Button from '../Button/Button'
import ModeSection from './ModeSection'

const buttonsData = {
  bullet: [
    { id: 'bullet-1', label: '1 min', time: 1, increment: 0 },
    { id: 'bullet-2', label: '1|1', time: 1, increment: 1 },
    { id: 'bullet-3', label: '2|1', time: 2, increment: 1 },
  ],
  blitz: [
    { id: 'blitz-1', label: '3 min', time: 3, increment: 0 },
    { id: 'blitz-2', label: '3|2', time: 3, increment: 2 },
    { id: 'blitz-3', label: '5 min', time: 5, increment: 0 },
  ],
  rapid: [
    { id: 'rapid-1', label: '10 min', time: 10, increment: 0 },
    { id: 'rapid-2', label: '15|10', time: 15, increment: 10 },
    { id: 'rapid-3', label: '30 min', time: 30, increment: 0 },
  ],
  daily: [
    { id: 'daily-1', label: '10 min', time: 10, increment: 0 },
    { id: 'daily-2', label: '15|10', time: 15, increment: 10 },
    { id: 'daily-3', label: '30 min', time: 30, increment: 0 },
  ],
}

const Mode: React.FC<{}> = () => {
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [activeButton, setActiveButton] = useState(null)
  const [timeStep, setTimestep] = useState(0)
  const [additionTimePerMove, setAdditionTimePerMove] = useState(0)

  let timerInterval: any

  useEffect(() => {
    function onConnect() {}
    function onDisconnect() {}

    socket.on('connection', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connection', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  useEffect(() => {
    if (loading) {
      startTimer()
    } else {
      clearInterval(timerInterval)
    }

    return () => clearInterval(timerInterval)
  }, [loading])

  const startTimer = () => {
    timerInterval = setInterval(() => {
      setTotalSeconds((prevSeconds) => prevSeconds + 1)
    }, 1000)
  }

  const handleCancel = () => {
    socket.emit('cancelCreateGame', (response: any) => {
      if (response.status === 200) {
        setLoading(false)
        setTotalSeconds(0)
      }
    })
  }

  const onCreateGame = async () => {
    setLoading(true)

    socket.emit('createGame', { timeStep, additionTimePerMove }, (response: any) => {
      if (response.status === 200) {
        setLoading(false)
        navigate(`/game/${response.board.game_id}`)
      } else if (response.status === 202) {
        console.log('Waiting for an opponent...')
      } else {
        setLoading(false)
        console.error('Failed to create game')
      }
    })

    socket.on('createGame', async function (data) {
      if (data.status === 200) {
        setLoading(false)
        navigate(`/game/${data.board.game_id}`)
      }
    })
  }

  const handleButtonClick = (buttonId: any, timeStep: number, additionTime: number) => {
    setActiveButton(buttonId)
    setTimestep(timeStep)
    setAdditionTimePerMove(additionTime)
  }

  return (
    <>
      <Header />
      <div className="flex flex-col pt-4 bg-gray-1000">
        <div className="border-none rounded-xl bg-gray-1000 min-h-screen">
          <div className="mx-auto flex flex-col items-center justify-center text-center text-white px-6 py-12">
            {loading && (
              <>
                <GameSpinner />
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-50 z-50  font-ibm  rounded-lg">
                  <div className="time-counter pb-[10px]">{formatTime(totalSeconds)}</div>
                  <button
                    className="cancel-button flex items-center justify-center text-center font-bold py-2 px-6 rounded-lg h-[50px] w-[100px] bg-grey-300 border-b-4 border-grey-200"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            <div>
              <ModeSection
                imgSrc="/bullet.svg"
                title="Bullet"
                buttons={buttonsData.bullet}
                handleButtonClick={handleButtonClick}
                activeButton={activeButton}
              />
              <ModeSection
                imgSrc="/Thunder.svg"
                title="Blitz"
                buttons={buttonsData.blitz}
                handleButtonClick={handleButtonClick}
                activeButton={activeButton}
              />
              <ModeSection
                imgSrc="/QuickLock.svg"
                title="Rapid"
                buttons={buttonsData.rapid}
                handleButtonClick={handleButtonClick}
                activeButton={activeButton}
              />
              <ModeSection
                imgSrc="/Sun.svg"
                title="Daily"
                buttons={buttonsData.daily}
                handleButtonClick={handleButtonClick}
                activeButton={activeButton}
              />

              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/QuickLock.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Unlimited</span>
                </div>
                <div className="flex flex-row">
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'unlimited'
                          ? 'bg-blue-gradient border-b-4 border-blue-200'
                          : 'bg-grey-100 border-b-4 border-grey-200'
                      }`}
                      onClick={() => handleButtonClick('unlimited', 0, 0)}
                    >
                      <span className="text-white font-ibm">♾️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-auto p-4">
              <Button
                onClick={onCreateGame}
                className="bg-blue-gradient text-black font-bold py-2 px-6 rounded-lg h-64 w-[370px] border-b-4 border-blue-200 font-ibm"
                disabled={!hasJWT()}
              >
                <span className="text-black font-ibm">Start game</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Mode
