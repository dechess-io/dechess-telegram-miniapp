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
import { App, Block, Notification } from 'konsta/react'
import { isAndroid } from 'react-device-detect'
import { useAppDispatch, useAppSelector } from '../../../redux/store'
import { selectGame, squares } from '../../../redux/game/reducer'
import {
  loadGame,
  resetKingSquares,
  setGameOver,
  setKingSquares,
  setOpponentMove,
  setRightClickedSquares,
  setWinner,
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
  const [showProgressBar, setShowProgressBar] = useState(false)

  const timer1 = useTimer({
    expiryTimestamp: new Date(Date.now() + 100000),
    autoStart: false,
    onExpire: () => {
      gameDispatch(setGameOver(true))
    },
  })

  const timer2 = useTimer({
    expiryTimestamp: new Date(Date.now() + 100000),
    autoStart: false,
    onExpire: () => {
      gameDispatch(setGameOver(true))
    },
  })

  const countDown = useTimer({
    expiryTimestamp: new Date(Date.now() + 60 * 1000 * 2),
    autoStart: true,
    onExpire: () => {
      gameDispatch(setGameOver(true))
    },
  })

  // const [opponentDisconnect, setOpponentDisconnect] = useState(false)

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
      timer1.minutes * 60 + timer1.seconds,
      timer2.minutes * 60 + timer2.seconds
    )
  }

  const onSquareClicks = (square: any) => {
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
        playerTimer1: timer1.minutes * 60 + timer1.seconds,
        playerTimer2: timer2.minutes * 60 + timer2.seconds,
      })
    )
  }

  const onSquareRightClick = (square: any) => {
    gameDispatch(setRightClickedSquares(square))
  }

  useEffect(() => {
    if (gameState.board.isCheck() || gameState.board.isCheckmate()) {
      if ((gameState.board as any)._isKingAttacked('w')) {
        gameDispatch(setKingSquares(indexToSquare((gameState.board as any)._kings['w'])))
      } else if ((gameState.board as any)._isKingAttacked('b')) {
        gameDispatch(setKingSquares(indexToSquare((gameState.board as any)._kings['b'])))
      }
    } else {
      gameDispatch(resetKingSquares())
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
          timer1.restart(new Date(Date.now() + data.playerTimer1 * 1000), true)
          timer2.restart(new Date(Date.now() + data.playerTimer2 * 1000), true)

          if (data.move_number === 1 && data.turn_player === 'w') {
            setAdditionTimePerMove(data.timePerMove)
          }

          if (!(data.move_number === 1 && data.turn_player === 'w')) {
            setIsStartGame(true)
          }
        }
      })
  }, [gameState.turn])

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
    if (
      !gameState.isGameDraw &&
      !gameState.isGameOver &&
      !gameState.isWinner &&
      !gameState.isLoser
    ) {
      if (gameState.playerTurn === gameState.player1 && timer1.minutes * 60 + timer1.seconds > 0) {
        timer1.resume()
        timer2.pause()
      } else if (
        gameState.playerTurn === gameState.player2 &&
        timer2.minutes * 60 + timer2.seconds > 0
      ) {
        timer2.resume()
        timer1.pause()
      }
    }

    return () => {}
  }, [gameState.turn, timer1.minutes, timer1.seconds, timer2.minutes, timer2.seconds])

  useEffect(() => {
    const gameId = location.pathname.split('/')[2]

    socket.connect()
    socket.on('connection', () => {
      setShowProgressBar(false)
    })

    socket.on('joinGame', (data: any) => {
      console.log('Opponent rejoin')
      setShowProgressBar(false)
    })

    socket.on('newmove', (room: any) => {
      if (room.fen) {
        gameDispatch(setOpponentMove(room))
        if (gameState.playerTurn === gameState.player1) {
          timer1.restart(new Date(Date.now() + room.player1Timer * 1000))
          timer2.pause()
        } else {
          timer2.restart(new Date(Date.now() + room.player2Timer * 1000))
          timer1.pause()
        }
      }
    })
    socket.on('opponentDisconnect', () => {
      setNotificationCloseOnClick(true)
      setTimeout(() => {
        setNotificationCloseOnClick(false)
      }, 2000)

      setShowProgressBar(true)
      countDown.restart(new Date(Date.now() + 60 * 1000 * 2))
    })

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
      <Header />
      <GameBoard
        player1Timer={timer1.minutes * 60 + timer1.seconds}
        player2Timer={timer2.minutes * 60 + timer2.seconds}
        onSquareClick={onSquareClicks}
        onSquareRightClick={onSquareRightClick}
        onPromotionPieceSelect={onPromotionPieceSelect}
        moveSquares={moveSquares}
        showProgressBar={showProgressBar}
        progressBar={countDown.seconds + countDown.minutes * 60}
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
      <GameOverPopUp setShowPopup={setShowPopup} showPopup={showPopup && !isPopupDismissed} />
    </App>
  )
}

export default Game
