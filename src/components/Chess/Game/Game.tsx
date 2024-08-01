import { useEffect, useState, useReducer, useMemo, useCallback } from 'react'
import { Chess, Square } from 'chess.js'
import { useLocation } from 'react-router-dom'
import { restApi } from '../../../services/api'
import { socket } from '../../../services/socket'
import GameOverPopUp from '../Popup/GameOverPopUp'
import { indexToSquare, isThreefoldRepetition, setLocalStorage } from '../../../utils/utils'
import LoadingGame from '../../Loading/Loading'
import Header from '../../Header/Header'
import { useTonWallet } from '@tonconnect/ui-react'
import GameNavbar from '../Navbar/GameNavbar'
import GameBoard from './Board'
import { App, Notification } from 'konsta/react'
import { isAndroid } from 'react-device-detect'
import { useAppDispatch, useAppSelector } from '../../../redux/store'
import { selectGame, squares } from '../../../redux/game/reducer'
import {
  loadGame,
  setGameOver,
  setKingSquares,
  setOpponentMove,
  setRightClickedSquares,
} from '../../../redux/game/action'
import { emitGameOver, emitNewMove, isOrientation } from './util'
import { useTimer } from 'react-timer-hook'

import {
  handleMoveThunk,
  handlePromotionMoveThunk,
  onSquareClickThunk,
} from '../../../redux/game/thunk'

const Game: React.FC<object> = () => {
  const gameState = useAppSelector(selectGame)
  const gameDispatch = useAppDispatch()
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

  const {
    seconds: timer1Seconds,
    minutes: timer1Minutes,
    start: startTimer1,
    pause: pauseTimer1,
    restart: restartTimer1,
  } = useTimer({ expiryTimestamp: new Date(Date.now() + 100000), autoStart: false })

  const {
    seconds: timer2Seconds,
    minutes: timer2Minutes,
    start: startTimer2,
    pause: pauseTimer2,
    restart: restartTimer2,
  } = useTimer({ expiryTimestamp: new Date(Date.now() + 100000), autoStart: false })

  // const [opponentDisconnect, setOpponentDisconnect] = useState(false)

  const isPlayerTimeout = () => {
    return (
      (gameState.playerTurn === gameState.player1 && timer1Minutes * 60 + timer1Seconds === 0) ||
      (gameState.playerTurn === gameState.player2 && timer2Minutes * 60 + timer2Seconds === 0)
    )
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const makeMove = (foundMove: any, square: Square) => {
    const newState = gameDispatch(handleMoveThunk({ foundMove, square }))
    const { moveFrom, square: newMoveSquare, isPromotionMove, san } = newState.newMove
    emitNewMove(
      moveFrom,
      newMoveSquare,
      isPromotionMove,
      san,
      location.pathname.split('/')[2],
      newState,
      newState.playerTurn,
      additionTimePerMove,
      timer1Minutes * 60 + timer1Seconds,
      timer2Minutes * 60 + timer2Seconds
    )
  }

  const onSquareClicks = (square: Square) => {
    const { isMove, foundMove } = gameDispatch(onSquareClickThunk(square, wallet))
    if (isMove) {
      makeMove(foundMove, square)
    }
  }

  const onPromotionPieceSelect = (piece: any) => {
    gameDispatch(
      handlePromotionMoveThunk({
        piece,
        additionTimePerMove,
        currentPlayerTurn: gameState.playerTurn,
      })
    )
  }

  const onSquareRightClick = (square: any) => {
    gameDispatch(setRightClickedSquares(square))
  }

  useEffect(() => {
    if (gameState.board.isCheck() || gameState.board.isCheckmate()) {
      gameDispatch(setKingSquares(indexToSquare((gameState.board as any)._kings['w'])))
      gameDispatch(setKingSquares(indexToSquare((gameState.board as any)._kings['b'])))
    }
  }, [gameState.board.isCheck() || gameState.board.isCheckmate()])

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
          gameDispatch(loadGame(data))
          setStartTime(Date.now())
          restartTimer1(new Date(Date.now() + data.playerTimer1 * 1000))
          restartTimer2(new Date(Date.now() + data.playerTimer2 * 1000))

          if (data.move_number === 1 && data.turn_player === 'w') {
            setAdditionTimePerMove(data.timePerMove)
          }

          if (!(data.move_number === 1 && data.turn_player === 'w')) {
            setIsStartGame(true)
          }
        }
      })
  }, [gameState.turn])

  // useEffect(() => {
  //   if (isThreefoldRepetition(gameState.history)) {
  //     socket.emit('confirmDraw', { game_id: location.pathname.split('/')[2] })
  //   }
  // }, [gameState.history])

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
    if (
      !gameState.isGameDraw &&
      !gameState.isGameOver &&
      !gameState.isWinner &&
      !gameState.isLoser
    ) {
      if (gameState.playerTurn === gameState.player1 && timer1Minutes * 60 + timer1Seconds > 0) {
        startTimer1()
        pauseTimer2()
      } else if (
        gameState.playerTurn === gameState.player2 &&
        timer2Minutes * 60 + timer2Seconds > 0
      ) {
        startTimer2()
        pauseTimer1()
      } else if (isPlayerTimeout() && !gameState.isGameOver) {
        // gameDispatch(setGameOver(true))
        // emitGameOver(socket, gameState, location.pathname.split('/')[2])
      }
    }

    return () => {}
  }, [gameState.turn, timer1Minutes, timer1Seconds, timer2Minutes, timer2Seconds])

  useEffect(() => {
    const gameId = location.pathname.split('/')[2]

    socket.connect()
    socket.on('connection', () => {})
    socket.on('newmove', (room: any) => {
      if (room.fen) {
        gameDispatch(setOpponentMove(room))
        if (gameState.playerTurn === gameState.player1) {
          restartTimer1(new Date(Date.now() + room.player1Timer * 1000))
          pauseTimer2()
        } else {
          restartTimer2(new Date(Date.now() + room.player2Timer * 1000))
          pauseTimer1()
        }
      }
    })
    socket.on('start', (data: any) => {
      if (data.start === true) {
        // setIsStartGame(true);
      }
    })
    socket.on('opponentDisconnect', () => {})

    socket.emit('joinGame', { game_id: gameId })

    return () => {
      socket.off('connection')
      socket.off('newmove')
      socket.off('start')
      socket.off('opponentDisconnect')
    }
  }, [])

  if (!gameState.board) return <LoadingGame />

  return (
    <App theme={theme}>
      {/* <Header /> */}
      <GameBoard
        player1Timer={timer1Minutes * 60 + timer1Seconds}
        player2Timer={timer2Minutes * 60 + timer2Seconds}
        onSquareClick={onSquareClicks}
        onSquareRightClick={onSquareRightClick}
        onPromotionPieceSelect={onPromotionPieceSelect}
        showPromotionDialog={gameState.showPromotionDialog}
        moveSquares={moveSquares}
        kingSquares={gameState.kingSquares}
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
