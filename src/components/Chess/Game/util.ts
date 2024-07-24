import { Square } from 'chess.js'
import { getRemainingTime } from '../../../utils/utils'

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
  socket: any,
  from: any,
  to: any,
  isPromotionMove: any,
  foundMove: any,
  square: any,
  additionalProps = {},
  gameId: string,
  gameState: any,
  currentPlayerTurn: any,
  player1Timer: any,
  player2Timer: any,
  additionTimePerMove: any,
  timer1: any,
  timer2: any,
  startTime: any
) {
  const turn = gameState.board.turn()
  const fen = gameState.board.fen()

  socket.emit('move', {
    from,
    to,
    game_id: gameId,
    turn,
    address: '',
    fen,
    isPromotion: isPromotionMove,
    timers: {
      player1Timer:
        currentPlayerTurn === gameState.player1 ? player1Timer + additionTimePerMove : player1Timer,
      player2Timer:
        currentPlayerTurn === gameState.player2 ? player2Timer + additionTimePerMove : player2Timer,
    },
    timer1: currentPlayerTurn === gameState.player1 ? getRemainingTime(timer1, startTime) : timer1,
    timer2: currentPlayerTurn === gameState.player2 ? getRemainingTime(timer2, startTime) : timer2,
    ...additionalProps,
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
