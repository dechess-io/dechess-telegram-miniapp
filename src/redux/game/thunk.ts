import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { RootState } from '../store'
import { emitNewMove, isEligibleToPlay, isPromotionMove } from '../../components/Chess/Game/util'
import {
  getMoveOptions,
  resetMoveSelection,
  setFoundMove,
  setGame,
  setIsMove,
  setMoveFrom,
  setMoveTo,
  setNewMove,
  setOptionSquares,
  setRightClickedSquares,
  showPromotionDialog,
  switchPlayerTurn,
} from './action'
import { GameReducer } from './type'
import { convertToFigurineSan } from '../../utils/utils'
import { socket } from '../../services/socket'
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
      dispatch(handleMoveFromSelectionThunk(square))
      return getState().game
    } else if (!state.moveTo) {
      dispatch(handleMoveToSelectionThunk(square))
    }

    return getState().game
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

export const handleMoveThunk = (
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
    copyFoundMove.san = convertToFigurineSan(foundMove.san, foundMove.color)
    dispatch(
      setNewMove({
        from: state.moveFrom,
        to: square,
        isPromotionMove: isPromotionMove(foundMove, square),
        foundMove: copyFoundMove,
        square,
        additionalProps: {
          san: copyFoundMove.san,
          lastMove: Date.now(),
          startTime: Date.now(),
        },
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

export const setupSocketListenersThunk = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game
    const gameId = location.pathname.split('/')[2]

    // socket.connect()
    // socket.on('connection', () => {})
    // socket.on('newmove', (room: any) => {
    //   if (room.fen) {
    //     console.log(room)
    //     dispatch(setNewMove(room))
    //     dispatch(setPlayer1Timer(room.timers.player1Timer))
    //     dispatch(setPlayer2Timer(room.timers.player2Timer))
    //     dispatch(setTimer1(room.timer1))
    //     dispatch(setTimer2(room.timer2))
    //   }
    // })
    // socket.on('start', (data: any) => {
    //   if (data.start === true) {
    //     // dispatch(setIsStartGame(true));
    //   }
    // })
    // socket.on('opponentDisconnect', () => {})

    // socket.emit('joinGame', { game_id: gameId })

    // return () => {
    //   socket.off('connection')
    //   socket.off('newmove')
    //   socket.off('start')
    //   socket.off('opponentDisconnect')
    // }
  }
}

export const handlePromotionMoveThunk = (
  payload: any
): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState().game
    const { piece, additionTimePerMove, currentPlayerTurn } = payload
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
          {
            promotion: piece[1].toLowerCase() ?? 'q',
          },
          location.pathname.split('/')[2],
          state,
          currentPlayerTurn,
          additionTimePerMove
        )
        dispatch(switchPlayerTurn())
      }

      dispatch(resetMoveSelection())
      dispatch(showPromotionDialog(false))
    }
  }
}
