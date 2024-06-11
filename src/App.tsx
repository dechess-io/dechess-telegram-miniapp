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

  const onCreateGame = async () => {
    return addPopup({
      Component: () => {
        return <PopupCreateGame />
      },
    })
  }

  return (
    <>
      <Header />
      <div className="flex flex-col pt-4 bg-black h-screen">
        <div className="border-none rounded-xl bg-gray-1000 min-h-screen">
          <div className="mx-auto flex flex-col items-center justify-center text-center text-white px-6 py-12">
            <div>
              <h1>Nguyen Le</h1>
            </div>

            <div className="flex flex-row">
              <div className="flex-auto p-4">
                <div className="w-100 h-100 justify-center items-center">
                  <CircularProgressbar value={60} />
                </div>
              </div>
              <div className="flex-auto p-4">
                <div>
                  <div>
                    <h3>ELO RATING</h3>
                  </div>
                  <div className="space-x-4 p-1">
                    <button
                      className="bg-gray-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
                      onClick={() => onCreateGame()}
                    >
                      Elo 1500
                    </button>
                  </div>
                  <div className="space-x-4 p-1">
                    <button
                      className="bg-gray-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
                      onClick={() => onCreateGame()}
                    >
                      Elo 1500
                    </button>
                  </div>
                  <div className="space-x-4 p-1">
                    <button
                      className="bg-gray-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
                      onClick={() => onCreateGame()}
                    >
                      Elo 1500
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row">
              <div className="flex-auto p-4">
                <div className="space-x-4">
                  <button
                    className="bg-vanilla-100 text-black font-bold py-2 px-6 rounded-lg h-55 w-155"
                    onClick={() => onCreateGame()}
                  >
                    Leaderboard
                  </button>
                </div>
              </div>
              <div className="flex-auto p-4">
                <div className="space-x-4">
                  <button
                    className="bg-vanilla-100 text-black font-bold py-2 px-6 rounded-lg h-55 w-155"
                    onClick={() => onCreateGame()}
                  >
                    Quest
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h1 className="font-semibold text-3xl leading-6 mt-5">Chess Mode</h1>
            </div>

            <div>
              <div className="space-x-4">
                <button
                  className="bg-gray-900 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg m-5 h-100 w-342"
                  onClick={() => onCreateGame()}
                >
                  Play
                </button>
              </div>
              <div className="space-x-4">
                <button
                  className="bg-gray-900 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg m-5 h-100 w-342"
                  onClick={() => onCreateGame()}
                >
                  Play versus bot
                </button>
              </div>
              <div className="space-x-4">
                <button
                  className="bg-gray-900 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg m-5 h-100 w-342"
                  onClick={() => onCreateGame()}
                >
                  Puzzles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
