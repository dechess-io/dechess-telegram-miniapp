import Header from './components/Header/Header'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameItem from './components/Chess/GameItem'
import PopupCreateGame from './components/Popup/PopupCreateGame'
import { usePopups } from './components/Popup/PopupProvider'
import { truncateSuiTx } from './services/address'
import { socket } from './services/socket'
import { apiHeader } from './utils/utils'
import restApi from './services/api'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
const Mode: React.FC<{}> = () => {
  const navigate = useNavigate()
  const { addPopup } = usePopups()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

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
  if (!games) {
    return <>Loading...</>
  }

  const onCreateGame = async () => {
    setLoading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 1
      })
    }, 100)

    socket.emit('createGame', (response: any) => {
      if (response.status === 200) {
        setLoading(false)
        clearInterval(interval)
        navigate(`/game/${response.board.game_id}`)
      } else if (response.status === 202) {
        console.log('Waiting for an opponent...')
      } else {
        setLoading(false)
        clearInterval(interval)
        console.error('Failed to create game')
      }
    })

    socket.on('createGame', async function (data) {
      if (data.status === 200) {
        setLoading(false)
        clearInterval(interval)
        navigate(`/game/${data.board.game_id}`)
      }
    })
  }
  const [activeButton, setActiveButton] = useState(null)

  const handleButtonClick = (buttonId: any) => {
    setActiveButton(buttonId)
  }

  return (
    <>
      <Header />
      <div className="flex flex-col pt-4 bg-gray-1000">
        <div className="border-none rounded-xl bg-gray-1000 min-h-screen">
          <div className="mx-auto flex flex-col items-center justify-center text-center text-white px-6 py-12">
            {loading && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 pb-[250px]">
                <div className="absolute top-[33.33%] transform -translate-y-1/2 w-[300px]  bg-black rounded-full h-6  ">
                  <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 text-white font-ibm">
                    Queuing...
                  </span>
                  <div
                    className="bg-blue-gradient h-6 rounded-full border-2 border-white"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            <div>
              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/bullet.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Bullet</span>
                </div>
                <div className="flex flex-row">
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'bullet-1' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('bullet-1')}
                    >
                      <span className="text-white font-ibm">1 min</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'bullet-2' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('bullet-2')}
                    >
                      <span className="text-white font-ibm text-[20px]">1|1</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'bullet-3' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('bullet-3')}
                    >
                      <span className="text-white font-ibm">2|1</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/Thunder.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Blitz</span>
                </div>
                <div className="flex flex-row">
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'blitz-1' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('blitz-1')}
                    >
                      <span className="text-white font-ibm">3 min</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'blitz-2' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('blitz-2')}
                    >
                      <span className="text-white font-ibm">3|2</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'blitz-3' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('blitz-3')}
                    >
                      <span className="text-white font-ibm">5 min</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/QuickLock.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Rapid</span>
                </div>
                <div className="flex flex-row">
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'rapid-1' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('rapid-1')}
                    >
                      <span className="text-white font-ibm">10 min</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'rapid-2' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('rapid-2')}
                    >
                      <span className="text-white font-ibm">15|10</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'rapid-3' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('rapid-3')}
                    >
                      <span className="text-white font-ibm">30 min</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex flex-row items-center pl-4">
                  <img src="/Sun.svg" alt="Leaderboard" className="h-24 w-24" />
                  <span className="text-white pl-2 font-ibm">Daily</span>
                </div>
                <div className="flex flex-row">
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'daily-1' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('daily-1')}
                    >
                      <span className="text-white font-ibm">1 day</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'daily-2' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('daily-2')}
                    >
                      <span className="text-white font-ibm">3 days</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'daily-3' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('daily-3')}
                    >
                      <span className="text-white font-ibm">7 days</span>
                    </button>
                  </div>
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
                        activeButton === 'unlimited' ? 'bg-blue-gradient' : 'bg-grey-100'
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
                className="bg-blue-gradient text-black font-bold py-2 px-6 rounded-lg h-64 w-[370px]"
                onClick={() => onCreateGame()}
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
