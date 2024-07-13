import { useEffect, useState, useRef, useReducer } from 'react'
import { Chess, Square } from 'chess.js'
import { useLocation } from 'react-router-dom'
import { restApi } from '../../../services/api'
import { socket } from '../../../services/socket'
import GameOverPopUp from '../Popup/GameOverPopUp'
import {
  convertToFigurineSan,
  getLastUpdateTime,
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
import { App, Block, Page } from 'konsta/react'
import { isAndroid } from 'react-device-detect'
import { engine } from '../../../services/worker'

const Game: React.FC<{}> = () => {
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

  const location = useLocation()
  const wallet = useTonWallet()
  const [turn, setTurn] = useState('')
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [moveSquares, setMoveSquares] = useState({})
  const [showPopup, setShowPopup] = useState(false)
  const [isStartGame, setIsStartGame] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState('')
  const [isPopupDismissed, setIsPopupDismissed] = useState(false)
  const [additionTimePerMove, setAdditionTimePerMove] = useState(1)
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({})
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  engine.onmessage = function (event) {
    if (event.data.split(' ')[0] === 'bestmove') {
      console.log(event.data)
    }
  }

  const sendPositionToEngine = (position: any) => {
    engine.postMessage(`position fen ${position}`)
    engine.postMessage('go depth 5')
  }

  const [player1Timer, setPlayer1Timer] = useState(() =>
    getTimeFromLocalStorage('player1Timer', -1)
  )
  const [player2Timer, setPlayer2Timer] = useState(() =>
    getTimeFromLocalStorage('player2Timer', -1)
  )

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

  const dismissPopup = () => {
    setIsPopupDismissed(true)
  }

  useEffect(() => {
    const lastUpdateTime = getLastUpdateTime()
    const currentTime = Date.now()
    const elapsedTime = Math.floor((currentTime - lastUpdateTime) / 1000 + 0.5)

    if (currentPlayer === player1) {
      setPlayer1Timer((prevTimer) => Math.max(prevTimer - elapsedTime, 0))
      localStorage.setItem('lastUpdateTime', Date.now().toString())
    } else {
      setPlayer2Timer((prevTimer) => Math.max(prevTimer - elapsedTime, 0))
      localStorage.setItem('lastUpdateTime', Date.now().toString())
    }
  }, [])

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
      if (game && game.isGameOver()) return
      if (currentPlayer === player1 && player1Timer > 0) {
        intervalId = setInterval(() => {
          setPlayer1Timer((prevTimer) => Math.max(prevTimer - 1, 0))
          updateTime()
        }, 1000)
      } else if (currentPlayer === player2 && player2Timer > 0) {
        intervalId = setInterval(() => {
          setPlayer2Timer((prevTimer) => Math.max(prevTimer - 1, 0))
          updateTime()
        }, 1000)
      } else if (isPlayerTimeout()) {
        gameDispatch({ type: 'SET_GAME_OVER', payload: true })
        emitGameOver()
      }
    }

    return () => clearInterval(intervalId)
  }, [currentPlayer, player1Timer, player2Timer, isGameDraw, isGameOver])

  function isPlayerTimeout() {
    return (
      (currentPlayer === player1 && player1Timer === 0) ||
      (currentPlayer === player2 && player2Timer === 0)
    )
  }

  const emitGameOver = () => {
    socket.emit('endGame', {
      game_id: location.pathname.split('/')[2],
      isGameOver: isGameOver,
      isGameDraw: isGameDraw,
    })
  }

  const handleSwitchTurn = () => {
    setCurrentPlayer((prev) => (prev === player1 ? player2 : player1))
  }

  const currentPlayerTurn = () => {
    const orientation = isOrientation(wallet?.account.address, player1)
    if (orientation === 'white') {
      return turn === 'w' ? player1 : player2
    }
    return turn === 'b' ? player2 : player1
  }

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
          if (data.move_number === 1 && data.turn_player === 'w') {
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
  }, [turn, isGameOver])

  useEffect(() => {
    function onConnect() {}

    function onNewMove(room: any) {
      gameDispatch({ type: 'ADD_MOVES', payload: `${room.san}` })
      if (room.fen) {
        setTurn(room.turn)
        handleSwitchTurn()
        gameDispatch({ type: 'SET_GAME', payload: new Chess(room.fen) })
        setPlayer1Timer(room.timers.player1Timer)
        setPlayer2Timer(room.timers.player2Timer)
        gameDispatch({ type: 'ADD_GAME_HISTORY', payload: room.fen })
        setCurrentMoveIndex((prevIndex) => prevIndex + 1)
      }
    }

    function onStart(data: any) {
      if (data.start === true) {
        setIsStartGame(true)
      }
    }
    socket.connect()
    socket.on('connection', onConnect)
    socket.on('newmove', onNewMove)
    socket.on('start', onStart)

    socket.emit('joinGame', { game_id: location.pathname.split('/')[2] })

    return () => {
      socket.off('connection', onConnect)
      socket.off('newmove', onNewMove)
      socket.off('start', onStart)
    }
  }, [])

  function getMoveOptions(square: Square) {
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
  }

  function isEligibleToPlay() {
    if (isGameDraw || isGameOver || game.isDraw() || game.isGameOver()) return false

    if (currentMoveIndex < gameHistory.length - 1) return false

    const isPlayerTurn =
      (player1 === wallet?.account.address && (game as any)._turn === 'w') ||
      (player2 === wallet?.account.address && (game as any)._turn === 'b')
    return isPlayerTurn
  }

  function handleMoveFromSelection(square: Square) {
    const hasMoveOptions = getMoveOptions(square)
    if (hasMoveOptions) gameDispatch({ type: 'SET_MOVE_FROM', payload: square })
  }

  function handleMoveToSelection(square: Square) {
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
  }

  function makeMove(foundMove: any, square: Square) {
    setIsStartGame(true)
    let gameCopy = game
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

  function isPromotionMove(move: any, square: Square) {
    return (
      (move.color === 'w' && move.piece === 'p' && square[1] === '8') ||
      (move.color === 'b' && move.piece === 'p' && square[1] === '1')
    )
  }

  function emitMove(foundMove: any, square: Square, gameCopy: any) {
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
          currentPlayerTurn() === player1 ? player1Timer + additionTimePerMove : player1Timer,
        player2Timer:
          currentPlayerTurn() === player2 ? player2Timer + additionTimePerMove : player2Timer,
      },
      san: foundMove.san,
    })
    sendPositionToEngine(gameCopy.fen())
  }

  function onSquareClick(square: Square) {
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
  }

  function onPromotionPieceSelect(piece: any) {
    if (piece) {
      let gameCopy: any = game
      const newMove = gameCopy.move({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? 'q',
      })
      console.log('7s200:pro', { promotion: piece[1].toLowerCase() ?? 'q' })
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
              currentPlayerTurn() === player1 ? player1Timer + additionTimePerMove : player1Timer,
            player2Timer:
              currentPlayerTurn() === player2 ? player2Timer + additionTimePerMove : player2Timer,
          },
        })
        handleSwitchTurn()
      }
    }

    gameDispatch({ type: 'RESET_MOVE_SELECTION' })
    gameDispatch({ type: 'SHOW_PROMOTION_DIALOG', payload: false })
    return true
  }

  function onSquareRightClick(square: any) {
    const colour = 'rgba(123, 97, 255, 1)'
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    })
    // console.log("7s200:onSquareRightClick", rightClickedSquares);
  }

  function handlePreviousMove() {
    if (currentMoveIndex > 0) {
      const newGame = new Chess(gameHistory[currentMoveIndex - 1])
      gameDispatch({ type: 'SET_GAME', payload: newGame })
      setCurrentMoveIndex((prevIndex) => prevIndex - 1)
      dismissPopup()
    }
  }

  function handleNextMove() {
    if (currentMoveIndex < gameHistory.length - 1) {
      const newGame = new Chess(gameHistory[currentMoveIndex + 1])
      gameDispatch({ type: 'SET_GAME', payload: newGame })
      setCurrentMoveIndex((prevIndex) => prevIndex + 1)
      dismissPopup()
    }
  }

  const theme = isAndroid ? 'material' : 'ios'

  if (!game) {
    return <LoadingGame />
  } else {
    return (
      <>
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
      </>
    )
  }
}

export default Game
