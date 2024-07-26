import { useEffect, useState, useRef, useReducer } from 'react'
import { Chess, Square } from 'chess.js'
import GameOverPopUp from '../Popup/GameOverPopUp'
import { convertToFigurineSan, isThreefoldRepetition } from '../../../utils/utils'
import LoadingGame from '../../Loading/Loading'
import Header from '../../Header/Header'
import { useTonWallet } from '@tonconnect/ui-react'
import GameNavbar from '../Navbar/GameNavbar'
import GameBoard from '../Game/Board'
import { App, Block, Page } from 'konsta/react'
import { isAndroid } from 'react-device-detect'
import { engine } from '../../../services/worker'
import { useLocation, useParams } from 'react-router-dom'
import { socket } from '../../../services/socket'
import { useAppDispatch, useAppSelector } from '../../../redux/store'
import { selectGame } from '../../../redux/game/reducer'
import {
  addGameHistory,
  addMoves,
  resetGame,
  resetMoveSelection,
  setGame,
  setGameDraw,
  setGameOver,
  setMoveFrom,
  setMoveTo,
  setOptionSquares,
  showPromotionDialog,
} from '../../../redux/game/action'

const BotGame: React.FC<{}> = () => {
  const location = useLocation()
  const {
    optionSquares,
    moveFrom,
    moveTo,
    showPromotionDialog: showPromotion,
    isGameOver,
    isGameDraw,
    board,
    history: history,
    moves,
    isWinner,
    isLoser,
  } = useAppSelector(selectGame)
  const gameDispatch = useAppDispatch()

  // Parse the query parameters
  const queryParams = new URLSearchParams(location.search)

  const wallet = useTonWallet()
  const [turn, setTurn] = useState(wallet?.account.address ? wallet.account.address : 'player1')
  const [player1, setPlayer1] = useState(
    wallet?.account.address ? wallet.account.address : 'player1'
  )
  const [player2, setPlayer2] = useState('bot')
  const [moveSquares, setMoveSquares] = useState({})
  const [showPopup, setShowPopup] = useState(false)
  const [isStartGame, setIsStartGame] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(
    wallet?.account.address ? wallet.account.address : 'player1'
  )
  const [isPopupDismissed, setIsPopupDismissed] = useState(false)
  const [additionTimePerMove] = useState(Number(queryParams.get('increment')))
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({})
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [startTime, setStartTime] = useState(
    Number(localStorage.getItem('startTime'))
      ? Number(localStorage.getItem('startTime'))
      : Date.now()
  )
  const [timer1, setTimer1] = useState(
    Number(localStorage.getItem('timer1'))
      ? Number(localStorage.getItem('timer1'))
      : Number(queryParams.get('time')) * 60
  )
  const [timer2, setTimer2] = useState(
    Number(localStorage.getItem('timer2'))
      ? Number(localStorage.getItem('timer2'))
      : Number(queryParams.get('time')) * 60
  )
  const [player1Timer, setPlayer1Timer] = useState(
    Number(localStorage.getItem('player1Timer'))
      ? Number(localStorage.getItem('player1Timer'))
      : Number(queryParams.get('time')) * 60
  )
  const [player2Timer, setPlayer2Timer] = useState(
    Number(localStorage.getItem('player2Timer'))
      ? Number(localStorage.getItem('player2Timer'))
      : Number(queryParams.get('time')) * 60
  )

  engine.onmessage = function (event) {
    if (event.data.split(' ')[0] === 'bestmove') {
      const data = event.data.split(' ')
      let gameCopy = board
      setTimeout(() => {
        gameCopy.move({
          from: data[1].substring(0, 2) ? data[1].substring(0, 2) : '',
          to: data[1].substring(2, 4),
        })
        setStartTime(Date.now() - additionTimePerMove)
        localStorage.setItem('startTime', startTime.toString())
        setTimer2(timer2 - Math.floor((Date.now() - startTime) / 1000))

        gameDispatch(setGame(gameCopy))
        gameDispatch(resetMoveSelection())
        gameDispatch(addMoves(convertToFigurineSan(data[1], 'b')))
        gameDispatch(addGameHistory(gameCopy.fen()))
        gameDispatch(setGameOver(gameCopy.isGameOver()))
        setCurrentMoveIndex((prevIndex) => prevIndex + 1)
        handleSwitchTurn()
      }, 4500)
    }
  }

  const sendPositionToEngine = (position: any) => {
    engine.postMessage(`position fen ${position}`)
    engine.postMessage('go depth 5')
  }

  useEffect(() => {
    localStorage.setItem('timer1', timer1.toString())
    localStorage.setItem('timer2', timer2.toString())
  }, [timer1, timer2])

  useEffect(() => {
    localStorage.setItem('player1Timer', player1Timer.toString())
  }, [player1Timer])

  useEffect(() => {
    localStorage.setItem('player2Timer', player2Timer.toString())
  }, [player2Timer])

  useEffect(() => {
    if (isThreefoldRepetition(history)) {
      gameDispatch(setGameDraw(true))
    }
  }, [history])

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
    let intervalId: any

    console.log(player1Timer)

    if (!isGameDraw && !isGameOver && isStartGame && !isWinner && !isLoser) {
      if (board?.isGameOver?.()) return
      if (
        currentPlayer === player1 &&
        Math.max(timer1 - Math.floor((Date.now() - startTime) / 1000), 0) > 0
      ) {
        intervalId = setInterval(() => {
          setPlayer1Timer(Math.max(timer1 - Math.floor((Date.now() - startTime) / 1000), 0))
        }, 1000)
      } else if (
        currentPlayer === player2 &&
        Math.max(timer2 - Math.floor((Date.now() - startTime) / 1000), 0) > 0
      ) {
        intervalId = setInterval(() => {
          setPlayer2Timer(Math.max(timer2 - Math.floor((Date.now() - startTime) / 1000), 0))
        }, 1000)
      } else if (isPlayerTimeout() && !isGameOver) {
        gameDispatch(setGameOver(true))
        emitGameOver()
      }
    }

    return () => clearInterval(intervalId)
  }, [currentPlayer, player1Timer, player2Timer, isGameDraw, isGameOver])

  function isPlayerTimeout() {
    return (
      (currentPlayer === player1 &&
        Math.max(timer1 - Math.floor((Date.now() - startTime) / 1000), 0) === 0) ||
      (currentPlayer === player2 &&
        Math.max(timer2 - Math.floor((Date.now() - startTime) / 1000), 0) === 0)
    )
  }

  const emitGameOver = () => {
    gameDispatch(setGameOver(true))
  }

  const handleSwitchTurn = () => {
    setCurrentPlayer((prev) => (prev === player1 ? player2 : player1))
  }

  function getMoveOptions(square: Square) {
    const moves = board.moves({ square, verbose: true })

    if (moves.length === 0) {
      gameDispatch(setOptionSquares({}))
      return false
    }

    const newSquares: any = {}

    moves.map((move: any) => {
      newSquares[move.to] = {
        background:
          board.get(move.to) && board.get(move.to).color !== board.get(square).color
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
  }

  function isEligibleToPlay() {
    if (isGameDraw || isGameOver || board.isDraw() || board.isGameOver()) return false

    // if (currentMoveIndex < gameHistory.length - 1) return false

    const isPlayerTurn =
      (player1 === wallet?.account.address && (board as any)._turn === 'w') ||
      (player2 === wallet?.account.address && (board as any)._turn === 'b')
    return isPlayerTurn
  }

  function handleMoveFromSelection(square: Square) {
    const hasMoveOptions = getMoveOptions(square)
    if (hasMoveOptions) gameDispatch(setMoveFrom(square))
  }

  function handleMoveToSelection(square: Square) {
    const moves = board.moves({
      square: moveFrom,
      verbose: true,
    })

    const foundMove = moves.find((m: any) => m.from === moveFrom && m.to === square) as any

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
  }

  function makeMove(foundMove: any, square: Square) {
    setIsStartGame(true)
    setStartTime(Date.now() - additionTimePerMove)
    localStorage.setItem('startTime', startTime.toString())
    setTimer1(timer1 - Math.floor((Date.now() - startTime) / 1000))
    let gameCopy = board
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
    setCurrentMoveIndex((prevIndex) => prevIndex + 1)
    gameDispatch(addMoves(foundMove.san))
    gameDispatch(addGameHistory(gameCopy.fen()))
    gameDispatch(setGame(gameCopy))
    gameDispatch(setGameOver(gameCopy.isGameOver()))
    gameDispatch(resetMoveSelection())
  }

  function isPromotionMove(move: any, square: Square) {
    return (
      (move.color === 'w' && move.piece === 'p' && square[1] === '8') ||
      (move.color === 'b' && move.piece === 'p' && square[1] === '1')
    )
  }

  function emitMove(foundMove: any, square: Square, gameCopy: any) {
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
      let gameCopy: any = board
      const newMove = gameCopy.move({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? 'q',
      })
      console.log('7s200:pro', { promotion: piece[1].toLowerCase() ?? 'q' })
      if (newMove) {
        gameDispatch(setGame(gameCopy))
        handleSwitchTurn()
      }
    }

    gameDispatch(resetMoveSelection())
    gameDispatch(showPromotionDialog(false))
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

  const theme = isAndroid ? 'material' : 'ios'

  if (!board) {
    return <LoadingGame />
  } else {
    return (
      <App theme={theme}>
        <Header />
        <GameBoard
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          showPromotionDialog={showPromotion}
          moveSquares={moveSquares}
          optionSquares={optionSquares}
          rightClickedSquares={rightClickedSquares}
        />
        <GameNavbar
          user={wallet?.account.address ? wallet?.account.address : 'player1'}
          opponent={wallet?.account.address === player1 ? player2 : player1}
          socket={socket}
          isMoved={moves.length !== 0}
          isWhite={player1 === wallet?.account.address}
        />
        <GameOverPopUp
          setShowPopup={setShowPopup}
          showPopup={showPopup && !isPopupDismissed}
          wallet={wallet}
        />
      </App>
    )
  }
}

export default BotGame
