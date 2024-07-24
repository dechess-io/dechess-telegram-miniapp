import { createAction } from '@reduxjs/toolkit'
import { Chess, Square } from 'chess.js'

export const setOptionSquares = createAction<{ [key: string]: any }>('/game/set-option-squares')
export const setMoveFrom = createAction<Square | undefined>('/game/set-move-from')
export const setMoveTo = createAction<Square | undefined>('/game/set-move-to')
export const showPromotionDialog = createAction<boolean>('/game/show-promotion-dialog')
export const resetMoveSelection = createAction('/game/reset-move-selection')
export const setGame = createAction<Chess>('/game/set-game')
export const setGameHistory = createAction<string[]>('/game/set-game-history')
export const setMoves = createAction<string[]>('/game/set-moves')
export const addMoves = createAction<string>('/game/add-moves')
export const setGameOver = createAction<boolean>('/game/set-game-over')
export const setGameDraw = createAction<boolean>('/game/set-game-draw')
export const addGameHistory = createAction<string>('/game/add-game-history')
export const setWinner = createAction<boolean>('/game/set-winner')
export const setLoser = createAction<boolean>('/game/set-loser')
export const setCurrentMoveIndex = createAction<number>('/game/set-current-move-index')
export const setPlayer1 = createAction<string>('/game/set-player-1')
export const setPlayer2 = createAction<string>('/game/set-player-2')
export const setTurn = createAction<'w' | 'b'>('/game/set-turn')
export const loadGame = createAction<any>('/game/load-game')
export const setPreviousMove = createAction('/game/set-previous-move')
export const setNextMove = createAction('/game/set-next-move')
export const setPlayerTurn = createAction<string>('/game/set-player-turn')
export const switchPlayerTurn = createAction('/game/switch-player-turn')
export const setNewMove = createAction<any>('/game/set-new-move')
export const resetGame = createAction('/game/reset-game')
export const handleMoveFromSelection = createAction<Square>('/game/handle-move-from-selection')
export const handleMoveToSelection = createAction<Square>('/game/handle-move-to-selection')
export const move = createAction<{ foundMove: any; square: Square }>('/game/make-move')
export const getMoveOptions = createAction<Square>('/game/get-move-options')
export const isPromotionMove = createAction<{ move: any; square: Square }>(
  '/game/is-promotion-move'
)
export const emitNewMove = createAction<{
  from: any
  to: any
  isPromotionMove: any
  foundMove: any
  square: any
  additionalProps: any
}>('/game/emit-new-move')
export const onSquareClick = createAction<Square>('/game/on-square-click')
export const setRightClickedSquares = createAction<{ [key: string]: any }>(
  '/game/set-right-clicked-squares'
)
