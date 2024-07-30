import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import ReactDialog from '../../Dialog/ReactDialog'
import { useAppSelector } from '../../../redux/store'
import { selectGame } from '../../../redux/game/reducer'

type GameOverPopUpProps = {
  wallet: any
  showPopup: boolean
  setShowPopup: any
}

const GameOverPopUpOriginal: React.FC<GameOverPopUpProps> = ({
  wallet,

  showPopup,
  setShowPopup,
}) => {
  const { board, isGameOver, isGameDraw, player1, player2, isWinner, isLoser } =
    useAppSelector(selectGame)
  const navigate = useNavigate()
  useEffect(() => {
    if (board.isGameOver() || isGameOver || board.isDraw() || isGameDraw) {
      setTimeout(() => {
        setShowPopup(true)
      }, 1000)
    }
  }, [board, isGameOver, isGameDraw])

  const renderMessage = () => {
    if (isWinner) return 'You Win!'
    if (isLoser) return 'You Lose!'
    if (board.isDraw() || isGameDraw) return 'Draw!'
    if (board.isGameOver() || isGameOver) {
      const playerWon =
        (player1 === wallet?.account.address && (board as any)._turn === 'b') ||
        (player2 === wallet?.account.address && (board as any)._turn === 'w')
      return playerWon ? 'You Win!' : 'You Lose!'
    }
    return null
  }

  return (
    <>
      <ReactDialog
        className="min-w-[22rem]"
        open={showPopup && (board.isGameOver() || board.isDraw() || isGameOver || isGameDraw)}
        onHide={() => setShowPopup(false)}
        onCancel={() => navigate('/')}
        onOk={() => navigate('/mode')}
        content={renderMessage()}
        title="Game Over"
        okContent="New Game"
        cancelContent="Game Overview"
      />
    </>
  )
}

const GameOverPopUp = React.memo(GameOverPopUpOriginal)
export default GameOverPopUp
