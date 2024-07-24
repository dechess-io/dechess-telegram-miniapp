import { useEffect, useState, useReducer, useMemo, useCallback } from 'react'
import { Chess, Square } from 'chess.js'
import { useLocation } from 'react-router-dom'
import { restApi } from '../../../services/api'
import { socket } from '../../../services/socket'
import GameOverPopUp from '../Popup/GameOverPopUp'
import { getRemainingTime, isThreefoldRepetition, setLocalStorage } from '../../../utils/utils'
import LoadingGame from '../../Loading/Loading'
import Header from '../../Header/Header'
import { useTonWallet } from '@tonconnect/ui-react'
import GameNavbar from '../Navbar/GameNavbar'
import GameBoard from './Board'
import { App, Notification } from 'konsta/react'
import { isAndroid } from 'react-device-detect'
import { useAppDispatch, useAppSelector } from '../../../redux/store'
import { selectTimer } from '../../../redux/timer/reducer'
import { setPlayer1Timer, setPlayer2Timer, setTimer1, setTimer2 } from '../../../redux/timer/action'
import { selectGame } from '../../../redux/game/reducer'
import {
  loadGame,
  resetMoveSelection,
  setGame,
  setGameOver,
  setMoveFrom,
  setMoveTo,
  setNewMove,
  setOptionSquares,
  setRightClickedSquares,
  showPromotionDialog,
  switchPlayerTurn,
  move,
} from '../../../redux/game/action'
import { emitNewMove, isEligibleToPlay, isOrientation, isPromotionMove } from './util'

const Game: React.FC<object> = () => {
  const gameState = useAppSelector(selectGame)
  const gameDispatch = useAppDispatch()
  const { timer1, timer2, player1Timer, player2Timer } = useAppSelector(selectTimer)
  const timerDispatch = useAppDispatch()
  const theme = useMemo(() => (isAndroid ? 'material' : 'ios'), [])
  const location = useLocation()
  const wallet = useTonWallet()
  const [moveSquares] = useState({})
  const [showPopup, setShowPopup] = useState(false)
  const [isStartGame, setIsStartGame] = useState(false)
  const [isPopupDismissed, setIsPopupDismissed] = useState(false)
  const [additionTimePerMove, setAdditionTimePerMove] = useState(1)
  const [notificationCloseOnClick, setNotificationCloseOnClick] = useState(false)
  const [startTime, setStartTime] = useState(0)

  // const [opponentDisconnect, setOpponentDisconnect] = useState(false)

  useEffect(() => {
    restApi
      .get('/load-game-v2', {
        params: {
          game_id: location.pathname.split('/')[2],
        },
      })
      .then(async (res) => {
        if (res.status === 200) {
          const data = res.data.game
          setStartTime(data.startTime)
          gameDispatch(loadGame(data))
          timerDispatch(setTimer1(data.timer1))
          timerDispatch(setTimer2(data.timer2))
          if (data.move_number === 1 && data.turn_player === 'w') {
            timerDispatch(setTimer1(data.timers.player1Timer))
            timerDispatch(setTimer2(data.timers.player2Timer))
            timerDispatch(setPlayer1Timer(data.timers.player1Timer))
            timerDispatch(setPlayer2Timer(data.timers.player2Timer))
            setAdditionTimePerMove(data.timePerMove)
          }

          if (!(data.move_number === 1 && data.turn_player === 'w')) {
            setIsStartGame(true)
          }
        }
      })
  }, [gameState.turn])

  const dismissPopup = useCallback(() => setIsPopupDismissed(true), [])

  const handleSwitchTurn = useCallback(
    () => gameDispatch(switchPlayerTurn()),
    [gameState.player1, gameState.player2]
  )

  const isPlayerTimeout = useMemo(() => {
    return (
      (gameState.playerTurn === gameState.player1 && getRemainingTime(timer1, startTime) === 0) ||
      (gameState.playerTurn === gameState.player2 && getRemainingTime(timer2, startTime) === 0)
    )
  }, [gameState.playerTurn, gameState.player1, gameState.player2, timer1, timer2, startTime])

  const emitGameOver = () => {
    socket.emit('endGame', {
      game_id: location.pathname.split('/')[2],
      isGameOver: gameState.isGameOver,
      isGameDraw: gameState.isGameDraw,
    })
  }

  const currentPlayerTurn = useMemo(() => {
    const orientation = isOrientation(wallet?.account.address, gameState.player1)
    if (orientation === 'white') {
      return gameState.turn === 'w' ? gameState.player1 : gameState.player2
    }
    return gameState.turn === 'b' ? gameState.player2 : gameState.player1
  }, [wallet, gameState.player1, gameState.player2, gameState.turn])

  const getMoveOptions = useCallback(
    (square: Square) => {
      const moves = gameState.board.moves({ square, verbose: true })

      if (moves.length === 0) {
        gameDispatch(setOptionSquares({}))
        return false
      }

      const newSquares: any = {}

      moves.map((move: any) => {
        newSquares[move.to] = {
          background:
            gameState.board.get(move.to) &&
            gameState.board.get(move.to).color !== gameState.board.get(square).color
              ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
              : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
          borderRadius: '50%',
        }

        return move
      })

      newSquares[square] = newSquares[square] = {
        background: 'rgba(123, 97, 255, 1)',
      }
      gameDispatch(setOptionSquares(newSquares))
      return true
    },
    [gameState.board]
  )

  const handleMoveFromSelection = useCallback(
    (square: Square) => {
      const hasMoveOptions = getMoveOptions(square)
      if (hasMoveOptions) gameDispatch(setMoveFrom(square))
    },
    [getMoveOptions]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const makeMove = (foundMove: any, square: Square) => {
    setStartTime(Date.now())
    setIsStartGame(true)
    gameDispatch(move({ foundMove, square }))
    const { moveFrom, square: newMoveSquare, isPromotionMove, additionalProps } = gameState.newMove
    emitNewMove(
      socket,
      moveFrom,
      newMoveSquare,
      isPromotionMove,
      foundMove,
      newMoveSquare,
      additionalProps,
      location.pathname.split('/')[2],
      gameState,
      currentPlayerTurn,
      player1Timer,
      player2Timer,
      additionTimePerMove,
      timer1,
      timer2,
      startTime
    )
  }

  const handleMoveToSelection = useCallback(
    (square: Square) => {
      const moves = gameState.board.moves({
        square: gameState.moveFrom,
        verbose: true,
      })

      const foundMove = moves.find(
        (m: any) => m.from === gameState.moveFrom && m.to === square
      ) as any

      if (!foundMove) {
        const hasMoveOptions = getMoveOptions(square)
        gameDispatch(setMoveFrom(hasMoveOptions ? square : undefined))
        return
      }

      gameDispatch(setMoveTo(square))

      if (isPromotionMove(foundMove, square)) {
        gameDispatch(showPromotionDialog(true))
        return
      }

      makeMove(foundMove, square)
    },
    [gameState.board, getMoveOptions, makeMove, gameState.moveFrom]
  )

  const onSquareClick = useCallback(
    (square: Square) => {
      if (!isEligibleToPlay(gameState, wallet)) return
      gameDispatch(setRightClickedSquares({}))
      if (!gameState.moveTo) {
        if (!gameState.moveFrom) {
          handleMoveFromSelection(square)
          return
        } else {
          handleMoveToSelection(square)
        }
      }
    },
    [
      isEligibleToPlay,
      gameState.moveTo,
      gameState.moveFrom,
      handleMoveFromSelection,
      handleMoveToSelection,
    ]
  )

  const onPromotionPieceSelect = (piece: any) => {
    if (piece) {
      const gameCopy: any = gameState.board
      const newMove = gameCopy.move({
        from: gameState.moveFrom,
        to: gameState.moveTo,
        promotion: piece[1].toLowerCase() ?? 'q',
      })

      if (newMove) {
        gameDispatch(setGame(gameCopy))
        emitNewMove(
          socket,
          gameState.moveFrom,
          gameState.moveTo,
          true,
          null,
          null,
          {
            promotion: piece[1].toLowerCase() ?? 'q',
          },
          location.pathname.split('/')[2],
          gameState,
          currentPlayerTurn,
          player1Timer,
          player2Timer,
          additionTimePerMove,
          timer1,
          timer2,
          startTime
        )
        handleSwitchTurn()
      }
    }

    gameDispatch(resetMoveSelection())
    gameDispatch(showPromotionDialog(false))
    return true
  }

  const onSquareRightClick = useCallback((square: any) => {
    const colour = 'rgba(123, 97, 255, 1)'
    gameDispatch(
      setRightClickedSquares({
        ...gameState.rightClickedSquares,
        [square]:
          gameState.rightClickedSquares[square] &&
          gameState.rightClickedSquares[square].backgroundColor === colour
            ? undefined
            : { backgroundColor: colour },
      })
    )
  }, [])

  useEffect(() => {
    if (isThreefoldRepetition(gameState.history)) {
      socket.emit('confirmDraw', { game_id: location.pathname.split('/')[2] })
    }
  }, [gameState.history])

  useEffect(() => {
    if (gameState.isGameOver || gameState.isGameDraw) {
      setShowPopup(true)
    }
  }, [gameState.isGameOver, gameState.isGameDraw])

  useEffect(() => {
    if (wallet) {
      setLocalStorage('address', wallet.account?.address)
    }
  }, [wallet])

  useEffect(() => {
    setLocalStorage('player1Timer', player1Timer)
  }, [player1Timer])

  useEffect(() => {
    setLocalStorage('player2Timer', player2Timer)
  }, [player2Timer])

  useEffect(() => {
    let intervalId: any
    if (GameOver()) {
      if (gameState.playerTurn === gameState.player1 && getRemainingTime(timer1, startTime) > 0) {
        intervalId = setInterval(() => {
          timerDispatch(setPlayer1Timer(getRemainingTime(timer1, startTime)))
        }, 1000)
      } else if (
        gameState.playerTurn === gameState.player2 &&
        getRemainingTime(timer2, startTime) > 0
      ) {
        intervalId = setInterval(() => {
          timerDispatch(setPlayer2Timer(getRemainingTime(timer2, startTime)))
        }, 1000)
      } else if (isPlayerTimeout && !gameState.isGameOver) {
        gameDispatch(setGameOver(true))
        emitGameOver()
      }
    }

    return () => clearInterval(intervalId)
  }, [gameState.playerTurn, player1Timer, player2Timer, gameState.isGameDraw, gameState.isGameOver])

  const GameOver = () => {
    return (
      !gameState.isGameDraw && !gameState.isGameOver && !gameState.isWinner && !gameState.isLoser
    )
  }

  useEffect(() => {
    const onConnect = () => {}

    const onNewMove = (room: any) => {
      if (room.fen) {
        gameDispatch(setNewMove(room))
        timerDispatch(setPlayer1Timer(room.timers.player1Timer))
        timerDispatch(setPlayer2Timer(room.timers.player2Timer))
        setStartTime(room.startTime)
        timerDispatch(setTimer1(room.timer1))
        timerDispatch(setTimer2(room.timer2))
      }
    }

    const onStart = (data: any) => {
      if (data.start === true) {
        setIsStartGame(true)
      }
    }

    let notificationTimeoutId: any

    const onOpponentDisconnect = () => {}

    socket.connect()
    socket.on('connection', onConnect)
    socket.on('newmove', onNewMove)
    socket.on('start', onStart)
    socket.on('opponentDisconnect', onOpponentDisconnect)

    socket.emit('joinGame', { game_id: location.pathname.split('/')[2] })

    return () => {
      socket.off('connection', onConnect)
      socket.off('newmove', onNewMove)
      socket.off('start', onStart)
      socket.off('opponentDisconnect', onOpponentDisconnect)
      // Clear the timeout when the component unmounts
      clearTimeout(notificationTimeoutId)
    }
  }, [])

  useEffect(() => {
    setLocalStorage('timer1', timer1)
    setLocalStorage('timer2', timer2)
  }, [timer1, timer2])

  if (!gameState.board) return <LoadingGame />

  return (
    <App theme={theme}>
      <Header />
      <GameBoard
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        onPromotionPieceSelect={onPromotionPieceSelect}
        showPromotionDialog={gameState.showPromotionDialog}
        moveSquares={moveSquares}
        optionSquares={gameState.optionSquares}
        rightClickedSquares={gameState.rightClickedSquares}
      />
      <GameNavbar
        user={wallet?.account.address ? wallet?.account.address : ''}
        opponent={
          wallet?.account.address === gameState.player1 ? gameState.player2 : gameState.player1
        }
        socket={socket}
        isMoved={gameState.moves.length !== 0}
        isWhite={gameState.player1 === wallet?.account.address}
      />
      <Notification
        opened={notificationCloseOnClick}
        icon={<img src="/Logo.svg" className="h-4 w-4" />}
        title="Dechess"
        titleRightText="now"
        subtitle="Your opponent has disconnected"
        onClick={() => setNotificationCloseOnClick(false)}
      />
      <GameOverPopUp
        setShowPopup={setShowPopup}
        showPopup={showPopup && !isPopupDismissed}
        wallet={wallet}
      />
    </App>
  )
}

export default Game
