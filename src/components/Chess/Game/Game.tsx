import { useEffect, useState, useReducer, useMemo, useCallback } from 'react'
import { Chess, Square } from 'chess.js'
import { useLocation } from 'react-router-dom'
import { restApi } from '../../../services/api'
import { socket } from '../../../services/socket'
import GameOverPopUp from '../Popup/GameOverPopUp'
import {
  convertToFigurineSan,
  getTimeFromLocalStorage,
  isThreefoldRepetition,
} from '../../../utils/utils'
import LoadingGame from '../../Loading/Loading'
import Header from '../../Header/Header'
import { useTonWallet } from '@tonconnect/ui-react'
import GameNavbar from '../Navbar/GameNavbar'
import GameBoard from './Board'
import {
  gameReducer,
  initialGameState,
  isOrientation,
  toggleGameDraw,
  toggleGameOver,
} from '../../../redux/game/game_state.reducer'
import { App, Block, Dialog, Notification, Page } from 'konsta/react'
import { isAndroid } from 'react-device-detect'

const Game: React.FC<object> = () => {
  const [
    {
      optionSquares,
      moveFrom,
      moveTo,
      showPromotionDialog,
      isGameOver,
      isGameDraw,
      game,
      gameHistory,
      moves,
      isWinner,
      isLoser,
    },
    gameDispatch,
  ] = useReducer(gameReducer, initialGameState)
  const theme = useMemo(() => (isAndroid ? 'material' : 'ios'), [])

  const location = useLocation()
  const wallet = useTonWallet()
  const [turn, setTurn] = useState('')
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [moveSquares] = useState({})
  const [showPopup, setShowPopup] = useState(false)
  const [isStartGame, setIsStartGame] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState('')
  const [isPopupDismissed, setIsPopupDismissed] = useState(false)
  const [additionTimePerMove, setAdditionTimePerMove] = useState(1)
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({})
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [notificationCloseOnClick, setNotificationCloseOnClick] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [timer1, setTimer1] = useState(getTimeFromLocalStorage('timer1', 60))
  const [timer2, setTimer2] = useState(getTimeFromLocalStorage('timer2', 60))

  console.log(timer1)
  console.log(timer2)

  useEffect(() => {
    localStorage.setItem('timer1', timer1?.toString())
    localStorage.setItem('timer2', timer2?.toString())
  }, [timer1, timer2])

  const [opponentDisconnect, setOpponentDisconnect] = useState(false)

  const [player1Timer, setPlayer1Timer] = useState(() =>
    getTimeFromLocalStorage('player1Timer', -1)
  )

  const [player2Timer, setPlayer2Timer] = useState(() =>
    getTimeFromLocalStorage('player2Timer', -1)
  )

  const dismissPopup = useCallback(() => setIsPopupDismissed(true), [])

  const handleSwitchTurn = useCallback(
    () => setCurrentPlayer((prev) => (prev === player1 ? player2 : player1)),
    [player1, player2]
  )

  const isPlayerTimeout = useMemo(() => {
    return (
      (currentPlayer === player1 &&
        Math.max(timer1 - Math.floor((Date.now() - startTime) / 1000), 0) === 0) ||
      (currentPlayer === player2 &&
        Math.max(timer2 - Math.floor((Date.now() - startTime) / 1000), 0) === 0)
    )
  }, [currentPlayer, player1, player2, timer1, timer2, startTime])

  const emitGameOver = () => {
    socket.emit('endGame', {
      game_id: location.pathname.split('/')[2],
      isGameOver: isGameOver,
      isGameDraw: isGameDraw,
    })
  }

  const currentPlayerTurn = useMemo(() => {
    const orientation = isOrientation(wallet?.account.address, player1)
    if (orientation === 'white') {
      return turn === 'w' ? player1 : player2
    }
    return turn === 'b' ? player2 : player1
  }, [wallet, player1, player2, turn])

  const getMoveOptions = useCallback(
    (square: Square) => {
      const moves = game.moves({ square, verbose: true })

      if (moves.length === 0) {
        gameDispatch({ type: 'SET_OPTION_SQUARES', payload: {} })
        return false
      }

      const newSquares: any = {}

      moves.map((move: any) => {
        newSquares[move.to] = {
          background:
            game.get(move.to) && game.get(move.to).color !== game.get(square).color
              ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
              : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
          borderRadius: '50%',
        }

        return move
      })

      newSquares[square] = newSquares[square] = {
        background: 'rgba(123, 97, 255, 1)',
      }

      gameDispatch({ type: 'SET_OPTION_SQUARES', payload: newSquares })
      return true
    },
    [game]
  )

  const isEligibleToPlay = useCallback(() => {
    if (isGameDraw || isGameOver || game.isDraw() || game.isGameOver()) return false

    if (currentMoveIndex < gameHistory.length - 1) return false

    const isPlayerTurn =
      (player1 === wallet?.account.address && (game as any)._turn === 'w') ||
      (player2 === wallet?.account.address && (game as any)._turn === 'b')
    return isPlayerTurn
  }, [isGameDraw, isGameOver, game, gameHistory, currentMoveIndex, player1, player2, wallet])

  const handleMoveFromSelection = useCallback(
    (square: Square) => {
      const hasMoveOptions = getMoveOptions(square)
      if (hasMoveOptions) gameDispatch({ type: 'SET_MOVE_FROM', payload: square })
    },
    [getMoveOptions]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const makeMove = (foundMove: any, square: Square) => {
    setStartTime(Date.now())
    setIsStartGame(true)
    const gameCopy = game
    const move = gameCopy.move({
      from: moveFrom ? moveFrom : '',
      to: square,
      promotion: 'q',
    })

    foundMove.san = convertToFigurineSan(foundMove.san, foundMove.color)

    emitMove(foundMove, square, gameCopy)

    handleSwitchTurn()

    if (!move) {
      handleMoveFromSelection(square)
      return
    }

    gameDispatch({ type: 'SET_GAME', payload: gameCopy })
    gameDispatch({ type: 'RESET_MOVE_SELECTION' })
  }

  const handleMoveToSelection = useCallback(
    (square: Square) => {
      const moves = game.moves({
        square: moveFrom,
        verbose: true,
      })

      const foundMove = moves.find((m: any) => m.from === moveFrom && m.to === square) as any

      if (!foundMove) {
        const hasMoveOptions = getMoveOptions(square)
        gameDispatch({ type: 'SET_MOVE_FROM', payload: hasMoveOptions ? square : undefined })
        return
      }

      gameDispatch({ type: 'SET_MOVE_TO', payload: square })

      if (isPromotionMove(foundMove, square)) {
        gameDispatch({ type: 'SHOW_PROMOTION_DIALOG', payload: true })
        return
      }

      makeMove(foundMove, square)
    },
    [game, getMoveOptions, makeMove, moveFrom]
  )

  const isPromotionMove = (move: any, square: Square) => {
    return (
      (move.color === 'w' && move.piece === 'p' && square[1] === '8') ||
      (move.color === 'b' && move.piece === 'p' && square[1] === '1')
    )
  }

  const emitMove = (foundMove: any, square: Square, gameCopy: any) => {
    socket.emit('move', {
      from: moveFrom,
      to: square,
      game_id: location.pathname.split('/')[2],
      turn: game.turn(),
      address: '',
      fen: game.fen(),
      isPromotion: isPromotionMove(foundMove, square),
      timers: {
        player1Timer:
          currentPlayerTurn === player1 ? player1Timer + additionTimePerMove : player1Timer,
        player2Timer:
          currentPlayerTurn === player2 ? player2Timer + additionTimePerMove : player2Timer,
      },
      san: foundMove.san,
      lastMove: Date.now(),
      startTime: Date.now(),
    })
  }

  const onSquareClick = useCallback(
    (square: Square) => {
      if (!isEligibleToPlay()) return
      setRightClickedSquares({})
      if (!moveTo) {
        if (!moveFrom) {
          handleMoveFromSelection(square)
          return
        } else {
          handleMoveToSelection(square)
        }
      }
    },
    [isEligibleToPlay, moveTo, moveFrom, handleMoveFromSelection, handleMoveToSelection]
  )

  const onPromotionPieceSelect = (piece: any) => {
    if (piece) {
      const gameCopy: any = game
      const newMove = gameCopy.move({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? 'q',
      })

      if (newMove) {
        gameDispatch({ type: 'SET_GAME', payload: gameCopy })
        socket.emit('move', {
          from: moveFrom,
          to: moveTo,
          game_id: location.pathname.split('/')[2],
          turn: game.turn(),
          address: '',
          fen: game.fen(),
          isPromotion: true,
          promotion: piece[1].toLowerCase() ?? 'q',
          timers: {
            player1Timer:
              currentPlayerTurn === player1 ? player1Timer + additionTimePerMove : player1Timer,
            player2Timer:
              currentPlayerTurn === player2 ? player2Timer + additionTimePerMove : player2Timer,
          },
        })
        handleSwitchTurn()
      }
    }

    gameDispatch({ type: 'RESET_MOVE_SELECTION' })
    gameDispatch({ type: 'SHOW_PROMOTION_DIALOG', payload: false })
    return true
  }

  const onSquareRightClick = useCallback((square: any) => {
    const colour = 'rgba(123, 97, 255, 1)'
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    })
  }, [])

  const handlePreviousMove = useCallback(() => {
    if (currentMoveIndex > 0) {
      const newGame = new Chess(gameHistory[currentMoveIndex - 1])
      gameDispatch({ type: 'SET_GAME', payload: newGame })
      setCurrentMoveIndex((prevIndex) => prevIndex - 1)
      dismissPopup()
    }
  }, [currentMoveIndex, gameHistory, gameDispatch, dismissPopup])

  const handleNextMove = useCallback(() => {
    if (currentMoveIndex < gameHistory.length - 1) {
      const newGame = new Chess(gameHistory[currentMoveIndex + 1])
      gameDispatch({ type: 'SET_GAME', payload: newGame })
      setCurrentMoveIndex((prevIndex) => prevIndex + 1)
      dismissPopup()
    }
  }, [currentMoveIndex, gameHistory, gameDispatch, dismissPopup])

  useEffect(() => {
    if (isThreefoldRepetition(gameHistory)) {
      socket.emit('confirmDraw', { game_id: location.pathname.split('/')[2] })
    }
  }, [gameHistory])

  useEffect(() => {
    if (isGameOver || isGameDraw) {
      setShowPopup(true)
    }
  }, [isGameOver, isGameDraw])

  useEffect(() => {
    if (wallet) {
      localStorage.setItem('address', wallet.account?.address)
    }
  }, [wallet])

  useEffect(() => {
    localStorage.setItem('player1Timer', player1Timer.toString())
  }, [player1Timer])

  useEffect(() => {
    localStorage.setItem('player2Timer', player2Timer.toString())
  }, [player2Timer])

  useEffect(() => {
    let intervalId: any
    const updateTime = () => {
      localStorage.setItem('lastUpdateTime', Date.now().toString())
    }

    if (!isGameDraw && !isGameOver && isStartGame && !isWinner && !isLoser) {
      if (game?.isGameOver?.()) return
      if (
        currentPlayer === player1 &&
        Math.max(timer1 - Math.floor((Date.now() - startTime) / 1000), 0) > 0
      ) {
        intervalId = setInterval(() => {
          setPlayer1Timer(Math.max(timer1 - Math.floor((Date.now() - startTime) / 1000), 0))
          updateTime()
        }, 1000)
      } else if (
        currentPlayer === player2 &&
        Math.max(timer2 - Math.floor((Date.now() - startTime) / 1000), 0) > 0
      ) {
        intervalId = setInterval(() => {
          setPlayer2Timer(Math.max(timer2 - Math.floor((Date.now() - startTime) / 1000), 0))
          updateTime()
        }, 1000)
      } else if (isPlayerTimeout && !isGameOver) {
        gameDispatch({ type: 'SET_GAME_OVER', payload: true })
        emitGameOver()
      }
    }

    return () => clearInterval(intervalId)
  }, [currentPlayer, player1Timer, player2Timer, isGameDraw, isGameOver])

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
          setTurn(data.turn_player)
          setStartTime(data.startTime)
          gameDispatch({ type: 'SET_GAME', payload: new Chess(data.fen) })
          setPlayer1(data.player_1)
          setPlayer2(data.player_2)
          gameDispatch({ type: 'SET_GAME_DRAW', payload: data.isGameDraw })
          gameDispatch({ type: 'SET_GAME_OVER', payload: data.isGameOver })
          if (data.winner && localStorage.getItem('address') === data.winner) {
            gameDispatch({ type: 'SET_WINNER', payload: true })
          }
          if (data.loser && localStorage.getItem('address') === data.loser) {
            gameDispatch({ type: 'SET_LOSER', payload: true })
          }

          console.log(data)

          setTimer1(data.timer1)
          setTimer2(data.timer2)
          if (data.move_number === 1 && data.turn_player === 'w') {
            setTimer1(data.timers.player1Timer)
            setTimer2(data.timers.player2Timer)
            setPlayer1Timer(data.timers.player1Timer)
            setPlayer2Timer(data.timers.player2Timer)
            setAdditionTimePerMove(data.timePerMove)
          }

          if (!(data.move_number === 1 && data.turn_player === 'w')) {
            setIsStartGame(true)
          }

          setCurrentPlayer(currentPlayerTurn() === player1 ? player1 : player2)
        }
      })
      .catch((err) => {})
  }, [turn])

  useEffect(() => {
    const onConnect = () => {}

    const onNewMove = (room: any) => {
      gameDispatch({ type: 'ADD_MOVES', payload: `${room.san}` })
      if (room.fen) {
        setTurn(room.turn)
        handleSwitchTurn()
        gameDispatch({ type: 'SET_GAME', payload: new Chess(room.fen) })
        setPlayer1Timer(room.timers.player1Timer)
        setPlayer2Timer(room.timers.player2Timer)
        gameDispatch({ type: 'ADD_GAME_HISTORY', payload: room.fen })
        setCurrentMoveIndex((prevIndex) => prevIndex + 1)
        setStartTime(room.startTime)
        setTimer1(room.timer1)
        setTimer2(room.timer2)
      }
    }

    const onStart = (data: any) => {
      if (data.start === true) {
        setIsStartGame(true)
      }
    }

    let notificationTimeoutId: any

    const onOpponentDisconnect = () => {
      const opponentTimer = wallet?.account.address === player1 ? player2Timer : player1Timer

      if (opponentTimer < 30) {
        gameDispatch({ type: 'SET_GAME_OVER', payload: true })
        socket.emit('resign', {
          game_id: location.pathname.split('/')[2],
          isGameOver: true,
          isGameDraw: false,
          winner: wallet?.account.address === player1 ? player1 : player2,
          loser: wallet?.account.address === player1 ? player2 : player1,
        })
      } else {
        setOpponentDisconnect(true)
      }

      setNotificationCloseOnClick(true)
      clearTimeout(notificationTimeoutId)
      notificationTimeoutId = setTimeout(() => {
        setNotificationCloseOnClick(false)
      }, 3000)
    }

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

  if (!game) return <LoadingGame />

  return (
    <App theme={theme}>
      <Header />
      <GameBoard
        player1={player1}
        player2={player2}
        moveLists={moves}
        game={game}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        onPromotionPieceSelect={onPromotionPieceSelect}
        showPromotionDialog={showPromotionDialog}
        moveSquares={moveSquares}
        optionSquares={optionSquares}
        rightClickedSquares={rightClickedSquares}
        moveTo={moveTo}
        player1Timer={player1Timer}
        player2Timer={player2Timer}
        currentMoveIndex={currentMoveIndex}
      />
      <GameNavbar
        user={wallet?.account.address ? wallet?.account.address : ''}
        opponent={wallet?.account.address === player1 ? player2 : player1}
        toggleGameDraw={() => toggleGameDraw(isGameDraw, gameDispatch)}
        toggleGameOver={() => toggleGameOver(isGameOver, gameDispatch)}
        handlePreviousMove={handlePreviousMove}
        handleNextMove={handleNextMove}
        socket={socket}
        game={game}
        isMoved={moves.length !== 0}
        isWhite={player1 === wallet?.account.address}
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
        isWinner={isWinner}
        isLoser={isLoser}
        game={game}
        isGameOver={isGameOver}
        isGameDraw={isGameDraw}
        player1={player1}
        player2={player2}
        wallet={wallet}
      />
    </App>
  )
}

export default Game
