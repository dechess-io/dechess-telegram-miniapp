import Header from '../Header/Header'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePopups } from '../Popup/PopupProvider'
import { socket } from '../../services/socket'
import 'react-circular-progressbar/dist/styles.css'
import { hasJWT } from '../../utils/utils'
import GameSpinner from '../Loading/Spinner'
const Mode: React.FC<{}> = () => {
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [activeButton, setActiveButton] = useState(null)

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

    socket.emit('createGame', (response: any) => {
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

  const handleButtonClick = (buttonId: any) => {
    setActiveButton(buttonId)
  }

  const renderButton = (buttonId: string, label: string) => {
    return (
      <div className="flex-auto p-1">
        <button
          className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
            activeButton === buttonId
              ? 'bg-blue-gradient border-b-4 border-blue-200'
              : 'bg-grey-100 border-b-4 border-grey-200'
          }`}
          onClick={() => handleButtonClick(buttonId)}
        >
          <span className="text-white font-ibm">{label}</span>
        </button>
      </div>
    )
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
                  <div className="time-counter pb-[20px]">
                    <span id="minutes">
                      {String(Math.floor(totalSeconds / 60)).padStart(2, '0')}
                    </span>
                    :<span id="seconds">{String(totalSeconds % 60).padStart(2, '0')}</span>
                  </div>
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
              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/bullet.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Bullet</span>
                </div>
                <div className="flex flex-row">
                  {renderButton('bullet-1', '1 min')}
                  {renderButton('bullet-2', '1|1')}
                  {renderButton('bullet-3', '2|1')}
                </div>
              </div>
              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/Thunder.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Blitz</span>
                </div>
                <div className="flex flex-row">
                  {renderButton('blitz-1', '3 min')}
                  {renderButton('blitz-2', '3|2')}
                  {renderButton('blitz-3', '5 min')}
                </div>
              </div>
              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/QuickLock.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Rapid</span>
                </div>
                <div className="flex flex-row">
                  {renderButton('rapid-1', '10 min')}
                  {renderButton('rapid-2', '15|10')}
                  {renderButton('rapid-3', '30 min')}
                </div>
              </div>
              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/Sun.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Daily</span>
                </div>
                <div className="flex flex-row">
                  {renderButton('daily-1', '1 day')}
                  {renderButton('daily-2', '3 days')}
                  {renderButton('daily-3', '7 days')}
                </div>
              </div>

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
                      onClick={() => handleButtonClick('unlimited')}
                    >
                      <span className="text-white font-ibm">♾️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-auto p-4">
              <button
                className="bg-blue-gradient text-black font-bold py-2 px-6 rounded-lg h-64 w-[370px] border-b-4 border-blue-200"
                onClick={() => onCreateGame()}
                disabled={!hasJWT()}
              >
                <span className="text-black font-ibm">Start game</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Mode
