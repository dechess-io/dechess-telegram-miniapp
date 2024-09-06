import { useEffect, useState, useCallback, useRef } from 'react'
import { Square } from 'chess.js'
import { useFetcher, useLocation } from 'react-router-dom'
import { restApi } from '../../../services/api'
import { socket } from '../../../services/socket'
import GameOverPopUp from '../Popup/GameOverPopUp'
import { convertToFigurineSan, isThreefoldRepetition, setLocalStorage } from '../../../utils/utils'
import LoadingGame from '../../Loading/Loading'
import { useTonWallet } from '@tonconnect/ui-react'
import GameNavbar from '../Navbar/GameNavbar'
import GameBoard from './Board'
import { Notification, Page } from 'konsta/react'
import { useAppDispatch, useAppSelector } from '../../../redux/store'
import { selectGame } from '../../../redux/game/reducer'
import {
  loadGame,
  resetKingSquares,
  setGameOver,
  setLoser,
  setMoveFrom,
  setMoveTo,
  setOpponentMove,
  setRightClickedSquares,
  setWinner,
  switchPlayerTurn,
} from '../../../redux/game/action'
import { emitNewMove, isCheckMate, isPromotionMove } from './util'
import { useTimer } from 'react-timer-hook'

import {
  moveThunk,
  promotionMoveThunk,
  onSquareClickThunk,
  resetMoveSelectionThunk,
  setKingSquaresThunk,
} from '../../../redux/game/thunk'
import {
  captureSound,
  checkSound,
  gameOverSound,
  gameStartSound,
  opponentMoveSound,
  promoteSound,
  selfMoveSound,
} from '../../../services/move_sounds'
import WebApp from '@twa-dev/sdk'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { isTMA } from '@telegram-apps/sdk'
let data: any = {}
const Game: React.FC<object> = () => {
  const gameState = useAppSelector(selectGame)
  const gameDispatch = useAppDispatch()
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
  const [progress, setProgress] = useState(120)
  const [chatId, setChatId] = useState(WebApp.initDataUnsafe.chat?.id)

  const fetchData = async () => {
    const isTma = await isTMA()
    console.log('isTma', isTma)
    if (isTma) {
      try {
        console.log('data', data)
        data = retrieveLaunchParams()
      } catch (error) {
        console.error('Failed to retrieve Telegram launch parameters:', error)
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const timer1 = useTimer({
    expiryTimestamp: new Date(Date.now() + 60 * 1000 * 2),
    autoStart: false,
    onExpire: () => {
      gameDispatch(setGameOver(true))
      if (wallet?.account.address === gameState.player1) {
        gameDispatch(setLoser(true))
        gameOverSound.play()
        socket.emit('gameOver', {
          game_id: location.pathname.split('/')[2],
          winner: gameState.player2,
          loser: gameState.player1,
        })
      } else {
        gameDispatch(setWinner(true))
        gameOverSound.play()
        socket.emit('gameOver', {
          game_id: location.pathname.split('/')[2],
          winner: gameState.player1,
          loser: gameState.player2,
        })
      }
    },
  })

  const timer2 = useTimer({
    expiryTimestamp: new Date(Date.now() + 60 * 1000 * 2),
    autoStart: false,
    onExpire: () => {
      gameDispatch(setGameOver(true))
      if (wallet?.account.address === gameState.player2) {
        gameDispatch(setLoser(true))
        gameOverSound.play()
        socket.emit('gameOver', {
          game_id: location.pathname.split('/')[2],
          winner: gameState.player1,
          loser: gameState.player2,
        })
      } else {
        gameDispatch(setWinner(true))
        gameOverSound.play()
        socket.emit('gameOver', {
          game_id: location.pathname.split('/')[2],
          winner: gameState.player2,
          loser: gameState.player1,
        })
      }
    },
  })

  useEffect(() => {
    if (gameState.isGameOver) {
      timer1.pause()
      timer2.pause()
      fetchData()
      const chat_id = data?.initData?.user?.id
      if (chat_id) {
        socket.emit('chatId', {
          chatId: chat_id,
          gameId: location.pathname.split('/')[2],
        })
      }
    }
  }, [gameState.isGameOver])

  const timer1Ref = useRef(timer1)
  const timer2Ref = useRef(timer2)

  console.log(wallet?.account.address)

  useEffect(() => {
    timer1Ref.current = timer1
    timer2Ref.current = timer2
  }, [timer1, timer2])

  const countDown = useTimer({
    expiryTimestamp: new Date(Date.now() + 60 * 1000 * 2),
    autoStart: true,
    onExpire: () => {
      gameDispatch(setGameOver(true))
      gameDispatch(setWinner(true))
      if (wallet?.account.address === gameState.player1) {
        gameOverSound.play()
        socket.emit('gameOver', {
          game_id: location.pathname.split('/')[2],
          winner: gameState.player1,
          loser: gameState.player2,
        })
      } else {
        gameOverSound.play()
        socket.emit('gameOver', {
          game_id: location.pathname.split('/')[2],
          winner: gameState.player2,
          loser: gameState.player1,
        })
      }
    },
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const makeMove = useCallback(
    (foundMove: any, square: Square) => {
      console.log('makeMove')

      const newState = gameDispatch(moveThunk({ foundMove, square }))
      const { moveFrom, square: newMoveSquare, isPromotionMove, san } = newState.newMove

      emitNewMove(
        moveFrom,
        newMoveSquare,
        isPromotionMove,
        san,
        location.pathname.split('/')[2],
        newState,
        additionTimePerMove,
        timer1.minutes * 60 + timer1.seconds,
        timer2.minutes * 60 + timer2.seconds,
        newState.board.isCheck() || newState.board.isCheckmate(),
        foundMove.captured
      )

      if (newState.board.isCheck() || newState.board.isCheckmate()) {
        console.log('check')
        checkSound.play()
        return
      } else if (foundMove.captured) {
        captureSound.play()
        return
      } else {
        selfMoveSound.play()
        return
      }
    },
    [
      additionTimePerMove,
      gameDispatch,
      location.pathname,
      timer1.minutes,
      timer1.seconds,
      timer2.minutes,
      timer2.seconds,
    ]
  )

  const onSquareClicks = useCallback(
    (square: any) => {
      console.log('squareClick')
      if (gameState.moveIndex !== gameState.history.length - 1) return
      const { isMove, foundMove } = gameDispatch(onSquareClickThunk(square, wallet))
      if (isMove) {
        makeMove(foundMove, square)
      }
    },
    [gameDispatch, makeMove, wallet]
  )

  const isGameContinue = () => {
    return (
      !gameState.isGameDraw &&
      !gameState.isGameOver &&
      !gameState.isWinner &&
      !gameState.isLoser &&
      !showProgressBar &&
      isStartGame
    )
  }

  const onPromotionPieceSelect = useCallback(
    (piece: any) => {
      if (!piece) {
        gameDispatch(resetMoveSelectionThunk())
        return
      }

      promoteSound.play()

      gameDispatch(
        promotionMoveThunk({
          piece,
          additionTimePerMove,
          currentPlayerTurn: gameState.playerTurn,
          playerTimer1: timer1.minutes * 60 + timer1.seconds,
          playerTimer2: timer2.minutes * 60 + timer2.seconds,
        })
      )
    },
    [
      additionTimePerMove,
      gameDispatch,
      gameState.playerTurn,
      timer1.minutes,
      timer1.seconds,
      timer2.minutes,
      timer2.seconds,
    ]
  )

  const onSquareRightClick = useCallback(
    (square: any) => {
      gameDispatch(setRightClickedSquares(square))
    },
    [gameDispatch]
  )

  useEffect(() => {
    if (isCheckMate(gameState.board)) {
      gameDispatch(setKingSquaresThunk())
    } else {
      gameDispatch(resetKingSquares())
    }
  }, [gameState.board.fen()])

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
          // gameStartSound.play()
          gameDispatch(loadGame(data))
          setStartTime(Date.now())
          timer1.restart(new Date(Date.now() + data.playerTimer1 * 1000), true)
          timer2.restart(new Date(Date.now() + data.playerTimer2 * 1000), true)
          timer1.pause()
          timer2.pause()

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
      gameOverSound.play()
    }
  }, [gameState.isGameOver, gameState.isGameDraw])

  useEffect(() => {
    if (wallet) {
      setLocalStorage('address', wallet.account?.address)
    }
  }, [wallet])

  useEffect(() => {
    if (isGameContinue()) {
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
  }, [
    gameState.turn,
    timer1.minutes,
    timer1.seconds,
    timer2.minutes,
    timer2.seconds,
    showProgressBar,
    gameState.playerTurn,
    gameState,
  ])

  useEffect(() => {
    const gameId = location.pathname.split('/')[2]

    socket.connect()
    socket.on('connection', () => {})

    socket.on('joinGame', (data: any) => {
      setShowProgressBar(false)
      countDown.pause()
    })

    socket.on('newmove', (room: any) => {
      if (room.fen) {
        gameDispatch(setOpponentMove(room))
        if (room.isCheck) {
          checkSound.play()
        } else if (room.isCapture) {
          captureSound.play()
        } else if (room.isPromotion) {
          promoteSound.play()
        } else {
          opponentMoveSound.play()
        }
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
      timer1.pause()
      timer2.pause()
      let countDownTime: any = new Date(
        Date.now() + (countDown.minutes * 60 + countDown.seconds) * 1000
      )
      const { minutes: timer1Minutes, seconds: timer1Seconds } = timer1Ref.current
      const { minutes: timer2Minutes, seconds: timer2Seconds } = timer2Ref.current
      let userTime = Math.min(
        timer1Minutes * 60 + timer1Seconds,
        timer2Minutes * 60 + timer2Seconds
      )

      if (countDown.minutes * 60 + countDown.seconds > userTime) {
        countDownTime = new Date(Date.now() + userTime * 1000)
        setProgress(userTime)
      }
      countDown.restart(countDownTime)
    })

    socket.emit('joinGame', { game_id: gameId })

    return () => {
      socket.off('connection')
      socket.off('newmove')
      socket.off('start')
      socket.off('opponentDisconnect')
    }
  }, [])

  const isDraggablePiece = function ({ piece, sourceSquare }: any) {
    if (piece[0] != 'w' && gameState.player1 === wallet?.account.address) return false
    if (piece[0] != 'b' && gameState.player2 === wallet?.account.address) return false
    if (gameState.moveIndex !== gameState.history.length - 1) return false

    return true
  }

  const onDragOverSquare = function (square: any) {
    gameDispatch(setMoveTo(square))
  }

  const onPieceDragBegin = function (piece: any, sourceSquare: any) {
    gameDispatch(setMoveFrom(sourceSquare))
  }

  const onPieceDragEnd = function (piece: any, sourceSquare: any) {}

  const onPieceDrop = function (sourceSquare: any, targetSquare: any, piece: any) {
    const gameCopy = gameState.board
    const moves = gameState.board.moves({ square: sourceSquare, verbose: true })
    const foundMove = moves.find((move) => move.to === targetSquare)
    if (!foundMove) return false
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    })

    if (
      (gameCopy.isCheckmate() || gameCopy.isCheck()) &&
      !gameCopy.isGameOver() &&
      !gameCopy.isDraw()
    ) {
      checkSound.play()
    } else if (foundMove.captured && !gameCopy.isGameOver() && !gameCopy.isDraw()) {
      captureSound.play()
    } else if (!gameCopy.isGameOver() && !gameCopy.isDraw()) {
      selfMoveSound.play()
    }

    emitNewMove(
      sourceSquare,
      targetSquare,
      true,
      convertToFigurineSan(foundMove.san, gameCopy.turn()),
      location.pathname.split('/')[2],
      gameState,
      additionTimePerMove,
      timer1.minutes * 60 + timer1.seconds,
      timer2.minutes * 60 + timer2.seconds,
      gameCopy.isCheck() || gameCopy.isCheckmate(),
      foundMove.captured ? true : false
    )
    gameDispatch(switchPlayerTurn())

    return true
  }

  if (!gameState.board) return <LoadingGame />

  return (
    <>
      <Page
        className="h-screen bg-cover bg-center flex flex-col items-center justify-between bg-contain"
        style={{ backgroundImage: 'url(./images/bg-game.png)' }}
      >
        <img
          className="max-w-[120px] max-h-[40px]"
          src="/images/logo-dechess.svg"
          alt="DeChess Logo"
        />
        <GameBoard
          player1Timer={timer1.minutes * 60 + timer1.seconds}
          player2Timer={timer2.minutes * 60 + timer2.seconds}
          onSquareClick={onSquareClicks}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          moveSquares={moveSquares}
          showProgressBar={showProgressBar}
          progressBar={((countDown.seconds + countDown.minutes * 60) * 100) / progress}
          isDraggablePiece={isDraggablePiece}
          onDragOverSquare={onDragOverSquare}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          onPieceDrop={onPieceDrop}
        />
        <GameNavbar
          isBot={false}
          user={wallet?.account.address ? wallet?.account.address : ''}
          opponent={
            wallet?.account.address === gameState.player1 ? gameState.player2 : gameState.player1
          }
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
          setIsPopupDismissed={setIsPopupDismissed}
          isBotMode={false}
        />
      </Page>
    </>
  )
}

export default Game
