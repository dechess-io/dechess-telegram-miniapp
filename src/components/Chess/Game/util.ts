import { Square } from 'chess.js'
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
  san: string,
  gameId: string,
  gameState: any,
  additionTimePerMove: any,
  playerTimer1: any,
  playerTimer2: any,
  isCheck: boolean,
  isCapture: boolean,
  fakeFrom: any
) {
  const turn = gameState.board.turn()
  const fen = gameState.board.fen()
  console.log(turn + 'Hello')
  socket.emit('move', {
    from,
    to,
    game_id: gameId,
    turn,
    address: '',
    fen,
    isPromotion: isPromotionMove,
    startTime: Date.now(),
    playerTimer1: turn === 'w' ? playerTimer1 : playerTimer1 + additionTimePerMove,
    playerTimer2: turn === 'w' ? playerTimer2 + additionTimePerMove : playerTimer2,
    san,
    isCheck,
    isCapture,
    fakeFrom,
  })
}

export const isEligibleToPlay = (gameState: any, address: any) => {
  if (
    gameState.isGameDraw ||
    gameState.isGameOver ||
    gameState.board.isDraw() ||
    gameState.board.isGameOver()
  )
    return false

  // if (currentMoveIndex < gameState.history.length) return false

  const isPlayerTurn =
    (gameState.player1 === address && (gameState.board as any)._turn === 'w') ||
    (gameState.player2 === address && (gameState.board as any)._turn === 'b')
  return isPlayerTurn
}

export const isCheckMate = (board: any) => {
  return board.isCheck() || board.isCheckmate()
}
