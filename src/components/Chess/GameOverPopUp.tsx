import { useNavigate } from 'react-router-dom'
import Popup from '../Popup/Popup'
import { useEffect, useState } from 'react'

type GameOverPopUpProps = {
  game: any
  isGameOver: boolean
  isGameDraw: boolean
  player1: string
  player2: string
  wallet: any
}

const GameOverPopUp: React.FC<GameOverPopUpProps> = ({
  game,
  isGameOver,
  isGameDraw,
  player1,
  player2,
  wallet,
}) => {
  const navigate = useNavigate()

  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (game.isGameOver() || isGameOver || game.isDraw() || isGameDraw) {
      setTimeout(() => {
        setShowPopup(true)
      }, 1000)
    }
  }, [game, isGameOver, isGameDraw])

  return (
    <>
      {showPopup && (
        <div>
          {(game.isGameOver() || game.isDraw() || isGameOver || isGameDraw) && (
            <div className={`absolute top-1/4`}>
              <Popup className="bg-grey-100 w-[364px] h-[200px]">
                <button
                  className="absolute top-0 right-3 text-white"
                  onClick={() => setShowPopup(false)}
                >
                  X
                </button>
                <h1 className="mb-4 text-center font-bold text-[20px] font-ibm">
                  {(game.isGameOver() || isGameOver) && !(game.isDraw() || isGameDraw) && (
                    <div>
                      <h2 className="text-white font-ibm pb-5">Game Over</h2>
                      <span className="text-white font-ibm">
                        {(player1 === wallet?.account.address && game._turn === 'b') ||
                        (player2 === wallet?.account.address && game._turn === 'w')
                          ? 'You Win'
                          : 'You Lose'}
                      </span>
                      <div className="flex flex-row pt-2">
                        <div className="flex-auto p-1">
                          <button
                            className={`bg-gray-900 font-bold  rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                            onClick={() => navigate('/mode')}
                          >
                            <span className="text-white text-sm">New Game</span>
                          </button>
                        </div>
                        <div className="flex-auto p-1">
                          <button
                            className={`bg-gray-900 font-bold rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                            onClick={() => navigate('/')}
                          >
                            <span className="text-white text-sm">Game Overview</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(game.isDraw() || isGameDraw) && (
                    <div>
                      <h2 className="text-white font-ibm pb-5">Game Over</h2>
                      <span className="text-white font-ibm">Draw !</span>
                      <div className="flex flex-row pt-2">
                        <div className="flex-auto p-1">
                          <button
                            className={`bg-gray-900 font-bold  rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                            onClick={() => navigate('/mode')}
                          >
                            <span className="text-white text-sm">New Game</span>
                          </button>
                        </div>
                        <div className="flex-auto p-1">
                          <button
                            className={`bg-gray-900 font-bold rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                            onClick={() => navigate('/')}
                          >
                            <span className="text-white text-sm">Game Overview</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </h1>
              </Popup>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default GameOverPopUp
