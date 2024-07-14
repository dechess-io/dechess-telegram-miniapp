import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Dialog, DialogButton } from 'konsta/react'

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
  const navigate = useNavigate()
  useEffect(() => {
    if (game.isGameOver() || isGameOver || game.isDraw() || isGameDraw) {
      setTimeout(() => {
        setShowPopup(true)
      }, 1000)
    }
  }, [game, isGameOver, isGameDraw])

  const renderMessage = () => {
    if (isWinner) return 'You Win!'
    if (isLoser) return 'You Lose!'
    if (game.isDraw() || isGameDraw) return 'Draw!'
    if (game.isGameOver() || isGameOver) {
      const playerWon =
        (player1 === wallet?.account.address && game._turn === 'b') ||
        (player2 === wallet?.account.address && game._turn === 'w')
      return playerWon ? 'You Win!' : 'You Lose!'
    }
    return null
  }

  return (
    <>
      <Dialog
        opened={showPopup && (game.isGameOver() || game.isDraw() || isGameOver || isGameDraw)}
        onBackdropClick={() => setShowPopup(false)}
        title="Game Over"
        content={renderMessage()}
        buttons={
          <>
            <DialogButton onClick={() => navigate('/mode')}>New Game</DialogButton>
            <DialogButton onClick={() => navigate('/')}>Game Overview</DialogButton>
          </>
        }
      />
    </>
  )
}

export default GameOverPopUp
