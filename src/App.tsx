import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameItem from './components/Chess/GameItem'
import Header from './components/Header/Header'
import PopupCreateGame from './components/Popup/PopupCreateGame'
import { usePopups } from './components/Popup/PopupProvider'
import { truncateSuiTx } from './services/address'
import { socket } from './services/socket'
import { apiHeader } from './utils/utils'
import restApi from './services/api'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import Progress from './components/ProgressChart/Progress'

function App() {
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

  const handlePlayClick = () => {
    navigate('/mode')
  }

  const onCreateGame = async () => {
    // return addPopup({
    //   Component: () => {
    //     return <PopupCreateGame />
    //   },
    // })
    socket.emit('createGame', (response: any) => {
      if (response.status === 200) {
        navigate(`/game/${response.board.game_id}`)
        // setIsLoadingCreateGame(false)
        // removeAll()
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

  return (
    <>
      <Header />
      <div className="flex flex-col pt-4 bg-gray-1000">
        <div className="border-none rounded-xl bg-gray-1000 min-h-screen">
          <div className="mx-auto flex flex-col items-center justify-center text-center text-white px-6 py-12">
            <div className="flex flex-row bg-black-gradient w-398 h-227 rounded-lg">
              <div className="flex-auto ">
                <Progress losses={3} totalGames={10} wins={7} />
              </div>
              <div className="flex-auto  rounded-lg">
                <div>
                  <div>
                    <h3>Elo Rating</h3>
                  </div>
                  <div className="space-x-2 p-1">
                    <div className="bg-grey-100 flex flex-col items-center justify-center rounded-lg h-54 w-137">
                      <span className="text-white">Rabit</span>
                      <div className="flex flex-row items-center">
                        <img src="/QuickLock.png" alt="Leaderboard" className="h-24 w-24" />
                        <span className="text-white">500</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-x-2 p-1">
                    <div className="bg-grey-100 flex flex-col items-center justify-center rounded-lg h-54 w-137">
                      <span className="text-white">Bullet</span>
                      <div className="flex flex-row items-center">
                        <img src="/bullet.png" alt="Leaderboard" className="h-24 w-24" />
                        <span className="text-white">500</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-x-2 p-1">
                    <div className="bg-grey-100 flex flex-col items-center justify-center rounded-lg h-54 w-137">
                      <span className="text-white">Blitz</span>
                      <div className="flex flex-row items-center">
                        <img src="/Thunder.png" alt="Leaderboard" className="h-24 w-24" />
                        <span className="text-white">500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row">
              <div className="flex-auto p-2">
                <button className="bg-grey-100 text-black font-bold py-2 px-6 rounded-lg h-160 w-192">
                  <span className="text-white">Leaderboard</span>
                  <div className="flex items-center justify-center space-x-2">
                    <img src="/Group.png" alt="Leaderboard" className="h-80 w-80" />
                  </div>
                </button>
              </div>
              <div className="flex-auto p-2">
                <button className="bg-grey-100 text-black font-bold py-2 px-6 rounded-lg h-160 w-192">
                  <span className="text-white">Calendar</span>
                  <div className="flex items-center justify-center space-x-2">
                    <img src="/Calendar.png" alt="Calendar" className="h-80 w-80" />
                  </div>
                </button>
              </div>
            </div>
            <div className="flex flex-row p-2">
              <div className="flex-auto p-2">
                <button className="bg-grey-100 text-black font-bold py-2 px-6 rounded-lg h-160 w-192">
                  <span className="text-white">Robot</span>
                  <div className="flex items-center justify-center space-x-2">
                    <img src="/Robot.png" alt="Robot" className="h-80 w-80" />
                  </div>
                </button>
              </div>
              <div className="flex-auto p-2">
                <button className="bg-grey-100 text-black font-bold py-2 px-6 rounded-lg h-160 w-192">
                  <span className="text-white">Puzzle</span>
                  <div className="flex items-center justify-center space-x-2">
                    <img src="/Puzzle.png" alt="Puzzle" className="h-80 w-80" />
                  </div>
                </button>
              </div>
            </div>

            <div className="flex-auto p-4">
              <button
                className="bg-blue-gradient text-black font-bold py-2 px-6 rounded-lg h-64 w-398"
                onClick={() => handlePlayClick()}
              >
                <span>Play</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
