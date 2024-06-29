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
  showPopup: boolean
  setShowPopup: any
}

const GameOverMessage: React.FC<{ message: string }> = ({ message }) => {
  const navigate = useNavigate()
  return (
    <>
      <span className="text-white font-ibm pb-5 block">Game Over</span>
      <span className="text-white font-ibm">{message}</span>
      <div className="flex flex-row pt-2">
        <div className="flex-auto p-1">
          <button
            className="bg-gray-900 font-bold rounded-lg h-[45px] w-127 border-b-4 border-grey-300 hover:bg-blue-gradient hover:border-blue-200"
            onClick={() => navigate('/mode')}
          >
            <span className="text-white text-sm">New Game</span>
          </button>
        </div>
        <div className="flex-auto p-1">
          <button
            className="bg-gray-900 font-bold rounded-lg h-[45px] w-127 border-b-4 border-grey-300 hover:bg-blue-gradient hover:border-blue-200"
            onClick={() => navigate('/')}
          >
            <span className="text-white text-sm">Game Overview</span>
          </button>
        </div>
      </div>
    </>
  )
}

const GameOverPopUp: React.FC<GameOverPopUpProps> = ({
  game,
  isGameOver,
  isGameDraw,
  player1,
  player2,
  wallet,
  isWinner,
  isLoser,
  showPopup,
  setShowPopup,
}) => {
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
            <div
              className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50`}
            >
              <Popup className="relative bg-blue-100 w-[90%] max-w-md h-[200px] p-4 border-b-4 border-grey-200">
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
