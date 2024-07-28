import { Square } from 'chess.js'
import { getRemainingTime, getTimeFromLocalStorage } from '../../../utils/utils'
import { socket } from '../../../services/socket'

export const isPromotionMove = (move: any, square: Square) => {
  return (
    (move.color === 'w' && move.piece === 'p' && square[1] === '8') ||
    (move.color === 'b' && move.piece === 'p' && square[1] === '1')
  )
}

export const isOrientation = (address: string | undefined, player1: string) => {
  if (address === player1) {
    return 'white'
  } else {
    return 'black'
  }
}

export function emitNewMove(
  from: any,
  to: any,
  isPromotionMove: any,
  additionalProps = {},
  gameId: string,
  gameState: any,
  currentPlayerTurn: any,
  additionTimePerMove: any
) {
  const turn = gameState.board.turn()
  const fen = gameState.board.fen()

  const updatedPlayer1Timer =
    currentPlayerTurn === gameState.player1
      ? getRemainingTime(
          getTimeFromLocalStorage('timer1', 0),
          getTimeFromLocalStorage('startTime', 0)
        )
      : getTimeFromLocalStorage('timer1', 0)
  const updatedPlayer2Timer =
    currentPlayerTurn === gameState.player2
      ? getRemainingTime(
          getTimeFromLocalStorage('timer2', 0),
          getTimeFromLocalStorage('startTime', 0)
        )
      : getTimeFromLocalStorage('timer2', 0)

  const updatedTimer1 =
    currentPlayerTurn === gameState.player1
      ? getRemainingTime(
          getTimeFromLocalStorage('timer1', 0),
          getTimeFromLocalStorage('startTime', 0)
        )
      : getTimeFromLocalStorage('timer1', 0)
  const updatedTimer2 =
    currentPlayerTurn === gameState.player2
      ? getRemainingTime(
          getTimeFromLocalStorage('timer2', 0),
          getTimeFromLocalStorage('startTime', 0)
        )
      : getTimeFromLocalStorage('timer2', 0)

  console.table([updatedPlayer1Timer, updatedPlayer2Timer, updatedTimer1, updatedTimer2])

  socket.emit('move', {
    from,
    to,
    game_id: gameId,
    turn,
    address: '',
    fen,
    isPromotion: isPromotionMove,
    timers: {
      player1Timer: updatedPlayer1Timer,
      player2Timer: updatedPlayer2Timer,
    },
    startTime: Date.now(),
    timer1: updatedTimer1,
    timer2: updatedTimer2,
    san: (additionalProps as any).san,
  })
}

export const isEligibleToPlay = (gameState: any, wallet: any) => {
  if (
    gameState.isGameDraw ||
    gameState.isGameOver ||
    gameState.board.isDraw() ||
    gameState.board.isGameOver()
  )
    return false

  // if (currentMoveIndex < gameState.history.length) return false

  const isPlayerTurn =
    (gameState.player1 === wallet?.account.address && (gameState.board as any)._turn === 'w') ||
    (gameState.player2 === wallet?.account.address && (gameState.board as any)._turn === 'b')
  return isPlayerTurn
}

export const emitGameOver = (socket: any, gameState: any, gameId: string) => {
  socket.emit('endGame', {
    game_id: location.pathname.split('/')[2],
    isGameOver: gameState.isGameOver,
    isGameDraw: gameState.isGameDraw,
  })
}
