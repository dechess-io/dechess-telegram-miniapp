import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { RootState } from '../store'
import { emitNewMove, isEligibleToPlay, isPromotionMove } from '../../components/Chess/Game/util'
import {
  getMoveOptions,
  resetKingSquares,
  resetMoveSelection,
  setFoundMove,
  setGame,
  setIsMove,
  setKingSquares,
  setMoveFrom,
  setMoveTo,
  setNewMove,
  setOptionSquares,
  setRightClickedSquares,
  showPromotionDialog,
  switchPlayerTurn,
} from './action'
import { GameReducer } from './type'
import { convertToFigurineSan, indexToSquare } from '../../utils/utils'
import { socket } from '../../services/socket'
import { captureSound } from '../../services/move_sounds'
import { Chess } from 'chess.js'
export const onSquareClickThunk = (
  square: any,
  wallet: any
): ThunkAction<GameReducer, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game
    if (!isEligibleToPlay(state, wallet)) return getState().game

    dispatch(setRightClickedSquares({}))

    if (!state.moveFrom) {
      dispatch(setMoveFrom(square))
      dispatch(moveFromSelectionThunk(square))
      return getState().game
    } else if (!state.moveTo) {
      dispatch(moveToSelectionThunk(square))
    }

    return getState().game
  }
}

export const moveFromSelectionThunk = (
  payload: any
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game // Adjust 'game' to match your reducer's name

    dispatch(getMoveOptions(payload))
    if (state.hasMoveOptions) {
      dispatch(setMoveFrom(payload))
    }
  }
}

export const moveToSelectionThunk = (
  payload: any
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game

    const moves = state.board.moves({ square: state.moveFrom, verbose: true })
    const foundMove = moves.find((m: any) => m.from === state.moveFrom && m.to === payload)

    if (!foundMove) {
      dispatch(getMoveOptions(payload))
      dispatch(setMoveFrom(state.hasMoveOptions ? payload : undefined))
      return
    }

    dispatch(setMoveTo(payload))

    if (isPromotionMove(foundMove, payload)) {
      dispatch(showPromotionDialog(true))
      return
    }

    dispatch(setIsMove(true))
    dispatch(setFoundMove(foundMove))
  }
}

export const moveThunk = (
  payload: any
): ThunkAction<GameReducer, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game
    const { foundMove, square } = payload
    const gameCopy = state.board
    const move = gameCopy.move({
      from: state.moveFrom ? state.moveFrom : '',
      to: square,
      promotion: 'q',
    })
    let copyFoundMove = { ...foundMove }
    let convertSan = convertToFigurineSan(foundMove.san, foundMove.color)
    copyFoundMove.san = convertSan ? convertSan : foundMove.san
    dispatch(
      setNewMove({
        from: state.moveFrom,
        to: square,
        isPromotionMove: isPromotionMove(foundMove, square),
        foundMove: copyFoundMove,
        square,
        san: copyFoundMove.san,
      })
    )
    dispatch(switchPlayerTurn())
    if (!move) {
      dispatch(getMoveOptions(square))
      if (state.hasMoveOptions) {
        dispatch(setMoveFrom(square))
        dispatch(setMoveTo(undefined))
        return getState().game
      }
      return getState().game
    }

    dispatch(setGame(gameCopy))
    dispatch(setMoveFrom(square))
    dispatch(setMoveTo(undefined))
    dispatch(setIsMove(false))
    dispatch(setOptionSquares({}))

    return getState().game
  }
}

export const promotionMoveThunk = (
  payload: any
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game
    const { piece, additionTimePerMove, playerTimer1, playerTimer2 } = payload
    if (piece) {
      const gameCopy: any = state.board
      const newMove = gameCopy.move({
        from: state.moveFrom,
        to: state.moveTo,
        promotion: piece[1].toLowerCase() ?? 'q',
      })

      if (newMove) {
        dispatch(setGame(gameCopy))
        emitNewMove(
          state.moveFrom,
          state.moveTo,
          true,
          convertToFigurineSan(newMove.san, gameCopy.turn()),
          location.pathname.split('/')[2],
          state,
          additionTimePerMove,
          playerTimer1,
          playerTimer2,
          gameCopy.isCheck() || gameCopy.isCheckmate(),
          newMove.captured
        )
        dispatch(switchPlayerTurn())
      }

      dispatch(resetMoveSelection())
      dispatch(showPromotionDialog(false))
    }
  }
}

export const resetMoveSelectionThunk = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    dispatch(setMoveFrom(undefined))
    dispatch(setMoveTo(undefined))
    dispatch(showPromotionDialog(false))
    dispatch(setIsMove(false))
    dispatch(setOptionSquares({}))
  }
}

export const setKingSquaresThunk = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game
    dispatch(resetKingSquares())
    if ((state.board as any)._isKingAttacked('w')) {
      dispatch(setKingSquares(indexToSquare((state.board as any)._kings['w'])))
    } else if ((state.board as any)._isKingAttacked('b')) {
      dispatch(setKingSquares(indexToSquare((state.board as any)._kings['b'])))
    }
  }
}
