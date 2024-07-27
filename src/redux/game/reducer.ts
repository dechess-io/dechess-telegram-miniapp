import { createReducer } from '@reduxjs/toolkit'
import { defaultGameReducer, GameReducer } from './type'
import { RootState } from '../store'
import {
  setOptionSquares,
  setMoveFrom,
  setMoveTo,
  showPromotionDialog,
  resetMoveSelection,
  setGame,
  setGameHistory,
  setMoves,
  addMoves,
  setGameOver,
  setGameDraw,
  addGameHistory,
  setWinner,
  setLoser,
  setCurrentMoveIndex,
  setPlayer1,
  setPlayer2,
  setTurn,
  loadGame,
  setPreviousMove,
  setNextMove,
  setPlayerTurn,
  switchPlayerTurn,
  setNewMove,
  resetGame,
  getMoveOptions,
  setRightClickedSquares,
  setIsMove,
  setFoundMove,
} from './action'
import { Chess } from 'chess.js'

const gameReducer = createReducer(defaultGameReducer, (builder: any) => {
  builder
    .addCase(setOptionSquares, (state: GameReducer, action: any) => {
      state.optionSquares = action.payload
    })
    .addCase(setMoveFrom, (state: GameReducer, action: any) => {
      state.moveFrom = action.payload
      state.moveTo = undefined
    })
    .addCase(setMoveTo, (state: GameReducer, action: any) => {
      state.moveTo = action.payload
    })
    .addCase(showPromotionDialog, (state: GameReducer, action: any) => {
      state.showPromotionDialog = action.payload
    })
    .addCase(resetMoveSelection, (state: GameReducer) => {
      state.moveFrom = undefined
      state.moveTo = undefined
      state.optionSquares = {}
    })
    .addCase(setGame, (state: GameReducer, action: any) => {
      state.board = action.payload
    })
    .addCase(setGameHistory, (state: GameReducer, action: any) => {
      state.history = action.payload
    })
    .addCase(setMoves, (state: GameReducer, action: any) => {
      state.moves = action.payload
    })
    .addCase(addMoves, (state: GameReducer, action: any) => {
      state.moves.push(action.payload)
    })
    .addCase(setGameOver, (state: GameReducer, action: any) => {
      state.isGameOver = action.payload
    })
    .addCase(setGameDraw, (state: GameReducer, action: any) => {
      state.isGameDraw = action.payload
    })
    .addCase(addGameHistory, (state: GameReducer, action: any) => {
      state.history.push(action.payload)
    })
    .addCase(setWinner, (state: GameReducer, action: any) => {
      state.isWinner = action.payload
    })
    .addCase(setLoser, (state: GameReducer, action: any) => {
      state.isLoser = action.payload
    })
    .addCase(setCurrentMoveIndex, (state: GameReducer, action: any) => {
      state.moveIndex = action.payload
    })
    .addCase(setPlayer1, (state: GameReducer, action: any) => {
      state.player1 = action.payload
    })
    .addCase(setPlayer2, (state: GameReducer, action: any) => {
      state.player2 = action.payload
    })
    .addCase(setTurn, (state: GameReducer, action: any) => {
      state.turn = action.payload
    })
    .addCase(loadGame, (state: GameReducer, action: any) => {
      const {
        turn_player,
        fen,
        player_1,
        player_2,
        isGameDraw,
        isGameOver,
        history,
        winner,
        loser,
      } = action.payload

      ;(state.isGameOver = isGameOver),
        (state.isGameDraw = isGameDraw),
        (state.board = new Chess(fen)),
        (state.history = [...history]),
        (state.moveIndex = history.length - 1),
        (state.turn = turn_player),
        (state.isWinner = winner && localStorage.getItem('address') === winner),
        (state.isLoser = loser && localStorage.getItem('address') === loser),
        (state.player1 = player_1),
        (state.player2 = player_2),
        (state.playerTurn = turn_player === 'w' ? player_1 : player_2)
    })
    .addCase(setPreviousMove, (state: GameReducer) => {
      if (state.moveIndex <= 0) return
      state.moveIndex = state.moveIndex - 1
      state.board = new Chess(state.history[state.moveIndex - 1])
    })
    .addCase(setNextMove, (state: GameReducer) => {
      if (state.moveIndex >= state.history.length) return
      ;(state.moveIndex = state.moveIndex + 1),
        (state.board = new Chess(state.history[state.moveIndex + 1]))
    })
    .addCase(setPlayerTurn, (state: GameReducer, action: any) => {
      state.playerTurn = action.payload
    })
    .addCase(switchPlayerTurn, (state: GameReducer) => {
      state.playerTurn = state.playerTurn === state.player1 ? state.player2 : state.player1
    })
    .addCase(setNewMove, (state: GameReducer, action: any) => {
      state.moves = [...state.moves, action.payload.san]
      state.turn = action.payload.turn
      state.playerTurn = state.playerTurn === state.player1 ? state.player2 : state.player1
      state.board = new Chess(action.payload.fen)
      state.history = action.payload.history
      // (state.moveIndex = action.payload.history.length - 1)
    })
    .addCase(resetGame, (state: GameReducer) => {
      Object.assign(state, defaultGameReducer)
    })
    .addCase(getMoveOptions, (state: GameReducer, action: any) => {
      const moves = state.board.moves({ square: action.payload, verbose: true })
      if (moves.length === 0) {
        state.optionSquares = {}
        state.hasMoveOptions = false
      }
      const newSquares: any = {}
      moves.map((move: any) => {
        newSquares[move.to] = {
          background:
            state.board.get(move.to) &&
            state.board.get(move.to).color !== state.board.get(action.payload).color
              ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
              : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
          borderRadius: '50%',
        }
        return move
      })
      newSquares[action.payload] = {
        background: 'rgba(123, 97, 255, 1)',
      }
      state.optionSquares = newSquares
      state.hasMoveOptions = true
    })
    .addCase(setRightClickedSquares, (state: GameReducer, action: any) => {
      const colour = 'rgba(123, 97, 255, 1)'

      const square = action.payload
      state.rightClickedSquares = {
        ...state.rightClickedSquares,
        [square]:
          state.rightClickedSquares[square] &&
          state.rightClickedSquares[square].backgroundColor === colour
            ? undefined
            : { backgroundColor: colour },
      }
    })
    .addCase(setIsMove, (state: GameReducer, action: any) => {
      state.isMove = action.payload
    })
    .addCase(setFoundMove, (state: GameReducer, action: any) => {
      state.foundMove = action.payload
    })
})

export const selectGame = (state: RootState) => state.game

export default gameReducer
