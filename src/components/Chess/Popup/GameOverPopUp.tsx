import { useNavigate } from 'react-router-dom'
import Popup from '../../Popup/Popup'
import { useEffect, useState } from 'react'

type GameOverPopUpProps = {
  game: any
  isGameOver: boolean
  isGameDraw: boolean
  player1: string
  player2: string
  wallet: any
  isWinner: boolean
  isLoser: boolean
}

const GameOverMessage: React.FC<{ message: string }> = ({ message }) => (
  <>
    <h2 className="text-white font-ibm pb-5">Game Over</h2>
    <span className="text-white font-ibm">{message}</span>
    <div className="flex flex-row pt-2">
      <div className="flex-auto p-1">
        <button
          className="bg-gray-900 font-bold rounded-lg h-[45px] w-127 hover:bg-blue-gradient"
          onClick={() => useNavigate()('/mode')}
        >
          <span className="text-white text-sm">New Game</span>
        </button>
      </div>
      <div className="flex-auto p-1">
        <button
          className="bg-gray-900 font-bold rounded-lg h-[45px] w-127 hover:bg-blue-gradient"
          onClick={() => useNavigate()('/')}
        >
          <span className="text-white text-sm">Game Overview</span>
        </button>
      </div>
    </div>
  </>
)

const GameOverPopUp: React.FC<GameOverPopUpProps> = ({
  game,
  isGameOver,
  isGameDraw,
  player1,
  player2,
  wallet,
  isWinner,
  isLoser,
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

  const renderMessage = () => {
    if (isWinner) return <GameOverMessage message="You Win!" />
    if (isLoser) return <GameOverMessage message="You Lose!" />
    if (game.isDraw() || isGameDraw) return <GameOverMessage message="Draw!" />
    if (game.isGameOver() || isGameOver) {
      const playerWon =
        (player1 === wallet?.account.address && game._turn === 'b') ||
        (player2 === wallet?.account.address && game._turn === 'w')
      return <GameOverMessage message={playerWon ? 'You Win!' : 'You Lose!'} />
    }
    return null
  }

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
                  {renderMessage()}
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
