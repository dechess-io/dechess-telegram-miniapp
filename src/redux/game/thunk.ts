import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { RootState } from '../store'
import { isEligibleToPlay, isPromotionMove } from '../../components/Chess/Game/util'
import {
  getMoveOptions,
  setFoundMove,
  setIsMove,
  setMoveFrom,
  setMoveTo,
  setRightClickedSquares,
  showPromotionDialog,
} from './action'
export const onSquareClickThunk = (
  square: any,
  wallet: any
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game // Adjust 'game' to match your reducer's name
    if (!isEligibleToPlay(state, wallet)) return

    dispatch(setRightClickedSquares({}))

    if (!state.moveTo) {
      if (!state.moveFrom) {
        dispatch(handleMoveFromSelectionThunk(square))
        return
      } else {
        dispatch(handleMoveToSelectionThunk(square))
      }
    }
  }
}

export const handleMoveFromSelectionThunk = (
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

export const handleMoveToSelectionThunk = (
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
