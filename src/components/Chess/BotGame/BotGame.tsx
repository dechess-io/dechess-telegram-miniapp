import { useEffect, useState } from 'react'
import { Square } from 'chess.js'
import GameOverPopUp from '../Popup/GameOverPopUp'
import { convertToFigurineSan, getRandomValueFromList, indexToSquare } from '../../../utils/utils'
import LoadingGame from '../../Loading/Loading'
import { useTonWallet } from '@tonconnect/ui-react'
import GameNavbar from '../Navbar/GameNavbar'
import GameBoard from '../Game/Board'
import { engine } from '../../../services/worker'
import { useLocation, useNavigate } from 'react-router-dom'
import { socket } from '../../../services/socket'
import { useAppDispatch, useAppSelector } from '../../../redux/store'
import {
  resetGame,
  resetMoveSelection,
  setRightClickedSquares,
  setPlayer1,
  setPlayer2,
  setOpponentMove,
  switchPlayerTurn,
  setTurn,
  setGameOver,
  setWinner,
  setLoser,
  setKingSquares,
  resetKingSquares,
  setGameHistory,
  setCurrentMoveIndex,
  setMoves,
  setMoveFrom,
  setMoveTo,
  showPromotionDialog,
  setIsMove,
  setOptionSquares,
  setGame,
} from '../../../redux/game/action'
import { useTimer } from 'react-timer-hook'
import { moveThunk, promotionMoveThunk, onSquareClickThunk } from '../../../redux/game/thunk'
import {
  captureSound,
  checkSound,
  gameOverSound,
  gameStartSound,
  opponentMoveSound,
  promoteSound,
  selfMoveSound,
} from '../../../services/move_sounds'
import { Block, Page } from 'konsta/react'

const BotGame: React.FC<{}> = () => {
  const gameState = useAppSelector((state) => state.game)
  const location = useLocation()
  const gameDispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)

  const [player1] = useState(localStorage.getItem('address'))
  const [player2] = useState('Solona Master')
  const [showPopup, setShowPopup] = useState(false)
  const [isPopupDismissed, setIsPopupDismissed] = useState(false)
  const [additionTimePerMove] = useState(Number(queryParams.get('increment')))
  const address = localStorage.getItem('address')

  const timer1 = useTimer({
    expiryTimestamp: new Date(Date.now() + Number(queryParams.get('time')) * 60 * 1000),
    autoStart: false,
    onExpire: () => {
      gameDispatch(setGameOver(true))
      gameDispatch(setLoser(true))
      gameOverSound.play()
    },
  })

  const timer2 = useTimer({
    expiryTimestamp: new Date(Date.now() + Number(queryParams.get('time')) * 60 * 1000),
    autoStart: false,
    onExpire: () => {
      gameDispatch(setGameOver(true))
      gameDispatch(setWinner(true))
      gameOverSound.play()
    },
  })

  useEffect(() => {
    const waitForWallet = async () => {
      while (!localStorage.getItem('address')) {
        // Wait until wallet has a value
        await delay(100) // Check every 100ms
      }

      setPlayer1(localStorage.getItem('address')!) // Set player1 once wallet is ready
      gameDispatch(setPlayer1(player1!)) // Dispatch player1 to the store
      gameDispatch(setPlayer2(player2)) // Dispatch player2 (bot) to the store
    }

    waitForWallet()
  }, [player2, gameDispatch])

  useEffect(() => {
    gameDispatch(resetGame())
    gameStartSound.play()
    gameDispatch(setPlayer1(player1!))
    gameDispatch(setPlayer2(player2))
    timer1.start()
    if (gameState.turn === 'w') {
      timer1.start()
      timer2.pause()
    } else if (gameState.turn === 'b') {
      timer2.start()
      timer1.pause()
    }
  }, [])

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  engine.onmessage = async function (event) {
    if (event.data.split(' ')[0] === 'bestmove') {
      const data = event.data.split(' ')
      let gameCopy = gameState.board

      const botTime = getRandomValueFromList([500, 1000, 1500, 2000, 2500, 3000])

      await delay(botTime)

      const move = gameCopy.move({
        from: data[1].substring(0, 2) ? data[1].substring(0, 2) : '',
        to: data[1].substring(2, 4),
        promotion: 'q',
      })

      if (gameCopy.isCheckmate() || gameCopy.isCheckmate()) {
        checkSound.play()
      } else if (move.captured) {
        captureSound.play()
      } else {
        opponentMoveSound.play()
      }

      let san = gameState.board.history()?.pop() as string
      gameDispatch(
        setOpponentMove({
          turn: gameCopy.turn(),
          fen: gameCopy.fen(),
          san: convertToFigurineSan(san, gameCopy.turn()),
          board: gameCopy,
          history: [...gameState.history, gameCopy.fen()],
        })
      )
      gameDispatch(setCurrentMoveIndex(gameState.moveIndex + 1))
      gameDispatch(resetMoveSelection())

      timer2.restart(
        new Date(
          Date.now() +
            timer2.minutes * 60 * 1000 +
            timer2.seconds * 1000 +
            additionTimePerMove * 1000 -
            botTime
        )
      )
      timer2.pause()
      timer1.resume()
    }
  }

  const sendPositionToEngine = (position: any) => {
    engine.postMessage(`position fen ${position}`)
    engine.postMessage('go depth 5')
  }

  const makeMove = (foundMove: any, square: Square) => {
    const newState = gameDispatch(moveThunk({ foundMove, square }))
    gameDispatch(setGameHistory([...gameState.history, newState.board.fen()]))
    if (
      (newState.board.isCheckmate() || newState.board.isCheck()) &&
      !newState.board.isGameOver() &&
      !newState.board.isDraw()
    ) {
      checkSound.play()
    } else if (foundMove.captured && !newState.board.isGameOver() && !newState.board.isDraw()) {
      captureSound.play()
    } else if (!newState.board.isGameOver() && !newState.board.isDraw()) {
      selfMoveSound.play()
    }
    gameDispatch(setMoves([...gameState.moves, foundMove.san]))
    gameDispatch(setCurrentMoveIndex(gameState.moveIndex + 1))
    timer1.restart(
      new Date(
        Date.now() + timer1.minutes * 60 * 1000 + timer1.seconds * 1000 + additionTimePerMove * 1000
      )
    )
    if (newState.board.isGameOver()) {
      gameDispatch(setWinner(true))
      gameDispatch(setGameOver(true))
      gameOverSound.play()
    }
    timer1.pause()
    timer2.resume()
    sendPositionToEngine(newState.board.fen())
  }

  const onSquareClick = (square: Square) => {
    if (gameState.moveIndex !== gameState.history.length - 1) return
    const { isMove, foundMove } = gameDispatch(
      onSquareClickThunk(square, localStorage.getItem('address'))
    )
    if (isMove) {
      gameDispatch(setTurn('b'))
      gameDispatch(switchPlayerTurn())
      makeMove(foundMove, square)
    }
  }

  useEffect(() => {
    if (gameState.isGameOver || gameState.isGameDraw) {
      setShowPopup(true)
      gameOverSound.play()
    }
  }, [gameState.isGameOver, gameState.isGameDraw])

  const onPromotionPieceSelect = (piece: any) => {
    if (!piece) {
      gameDispatch(setMoveFrom(undefined))
      gameDispatch(setMoveTo(undefined))
      gameDispatch(showPromotionDialog(false))
      gameDispatch(setIsMove(false))
      gameDispatch(setOptionSquares({}))
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
  }

  const onSquareRightClick = (square: any) => {
    gameDispatch(setRightClickedSquares(square))
  }

  const isDraggablePiece = function ({ piece, sourceSquare }: any) {
    if (piece[0] === 'b') return false
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
    timer1.restart(
      new Date(
        Date.now() + timer1.minutes * 60 * 1000 + timer1.seconds * 1000 + additionTimePerMove * 1000
      )
    )
    timer1.pause()
    timer2.resume()
    gameDispatch(setGameHistory([...gameState.history, gameCopy.fen()]))
    gameDispatch(setMoves([...gameState.moves, foundMove.san]))
    gameDispatch(setCurrentMoveIndex(gameState.moveIndex + 1))
    gameDispatch(switchPlayerTurn())
    sendPositionToEngine(gameCopy.fen())
    return true
  }

  useEffect(() => {
    if (gameState.isGameOver) {
      timer1.pause()
      timer2.pause()
    }
  }, [gameState.isGameOver, gameState.isWinner, gameState.isLoser])

  useEffect(() => {
    if (gameState.board.isCheck() || gameState.board.isCheckmate()) {
      gameDispatch(resetKingSquares())
      if ((gameState.board as any)._isKingAttacked('w')) {
        gameDispatch(setKingSquares(indexToSquare((gameState.board as any)._kings['w'])))
      } else if ((gameState.board as any)._isKingAttacked('b')) {
        gameDispatch(setKingSquares(indexToSquare((gameState.board as any)._kings['b'])))
      }
    } else {
      gameDispatch(resetKingSquares())
    }
  }, [gameState.board.isCheck() || gameState.board.isCheckmate()])

  if (!gameState.board) {
    return <LoadingGame />
  } else {
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
            onClick={() => navigate('/')}
          />
          <GameBoard
            player1Timer={timer1.minutes * 60 + timer1.seconds}
            player2Timer={timer2.minutes * 60 + timer2.seconds}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            onPromotionPieceSelect={onPromotionPieceSelect}
            moveSquares={{}}
            showProgressBar={false}
            progressBar={0}
            isDraggablePiece={isDraggablePiece}
            onDragOverSquare={onDragOverSquare}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            onPieceDrop={onPieceDrop}
          />
          <GameNavbar
            isBot={true}
            user={address ? address : 'player1'}
            opponent={address === player1 ? player2! : player1!}
            isMoved={gameState.moves.length !== 0}
            isWhite={player1 === address}
          />
          <GameOverPopUp
            setShowPopup={setShowPopup}
            showPopup={showPopup && !isPopupDismissed}
            isBotMode={true}
            setIsPopupDismissed={setIsPopupDismissed}
          />
        </Page>
      </>
    )
  }
}

export default BotGame
