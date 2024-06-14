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

  function hasJWT() {
    let flag = false
    localStorage.getItem('token') ? (flag = true) : (flag = false)
    return flag
  }

  const [games, setGames] = useState([])

  useEffect(() => {
    hasJWT() &&
      restApi
        .get(`/get-game-v2`, { headers: apiHeader })
        .then((res) => {
          console.log('7s200:games', games)
          if (res.data.status === 200) {
            setGames(res.data.games)
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            localStorage.removeItem('token')
          }
        })
  }, [])

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

  const onShowGames = () => {
    let temp = null
    if (games.length > 0) {
      temp = games.map((e, i) => {
        return (
          <div key={i} className="cursor-pointer relative">
            {(e as any).game_id && (
              <div className=" top-4	 bg-blue-400 text-center font-bold w-[200px] mx-auto border border-none rounded-xl">
                Match ID: {truncateSuiTx((e as any).game_id)}
              </div>
            )}

            <div
              className="mx-auto bg-red-100"
              key={i}
              style={{ height: '250px', width: '250px', cursor: 'pointer', padding: '10px' }}
              onClick={() => onHandleJoinGame((e as any).game_id)}
            >
              <GameItem fen={(e as any).fen} />
            </div>
            <div className="flex justify-between max-w-[250px] mx-auto">
              {(e as any).isPaymentMatch && (
                <div className=" bg-green-500 text-center font-bold w-[150px] mx-auto border border-none rounded-xl text-white">
                  Stake:{' '}
                </div>
              )}
            </div>
            {!(e as any).isPaymentMatch && (
              <div className="bg-blue-400 text-center font-bold w-[150px] mx-auto border border-none rounded-xl">
                Free match
              </div>
            )}
          </div>
        )
      })
    }
    return temp
  }

  const onHandleJoinGame = async (game_id: string) => {
    socket.emit('joinGame', { game_id: game_id })
    navigate(`/game/${game_id}`)
  }

  const onCreateGame = async () => {
    console.log('hello')
    socket.emit('createGame', (response: any) => {
      console.log(response)
      if (response.status === 200) {
        navigate(`/game/${response.board.game_id}`)
      } else if (response.status === 202) {
        console.log('Waiting for an opponent...')
      } else {
        console.error('Failed to create game')
        // setIsLoadingCreateGame(false)
      }
    })

    socket.on('createGame', async function (data) {
      if (data.status === 200) {
        navigate(`/game/${data.board.game_id}`)
        // setIsLoadingCreateGame(false)
        // removeAll()
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
                      <span className="text-white font-ibm">1|1</span>
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
                      <span className="text-white font-ibm">10 min</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'daily-2' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('daily-2')}
                    >
                      <span className="text-white font-ibm">15|10</span>
                    </button>
                  </div>
                  <div className="flex-auto p-1">
                    <button
                      className={`font-bold py-2 px-6 rounded-lg h-54 w-[115px] ${
                        activeButton === 'daily-3' ? 'bg-blue-gradient' : 'bg-grey-100'
                      }`}
                      onClick={() => handleButtonClick('daily-3')}
                    >
                      <span className="text-white font-ibm">30 min</span>
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
