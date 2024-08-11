import { useEffect, useState, useRef, useReducer } from 'react'
import { Chess, Square } from 'chess.js'
import GameOverPopUp from '../Popup/GameOverPopUp'
import { convertToFigurineSan, getRandomValueFromList, indexToSquare } from '../../../utils/utils'
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
  setGame,
} from '../../../redux/game/action'
import { useTimer } from 'react-timer-hook'
import {
  handleMoveThunk,
  handlePromotionMoveThunk,
  onSquareClickThunk,
} from '../../../redux/game/thunk'

const PuzzleGame: React.FC<{ fen: string }> = ({ fen }) => {
  const gameState = useAppSelector((state) => state.game)
  const location = useLocation()
  const gameDispatch = useAppDispatch()
  const queryParams = new URLSearchParams(location.search)

  const wallet = useTonWallet()
  const [player1] = useState(wallet?.account.address ? wallet.account.address : 'player1')
  const [player2] = useState('bot')
  const [showPopup, setShowPopup] = useState(false)
  const [isPopupDismissed, setIsPopupDismissed] = useState(false)
  const [additionTimePerMove] = useState(Number(queryParams.get('increment')))

  useEffect(() => {
    gameDispatch(resetGame())
    gameDispatch(setGame(new Chess(fen as string)))
    gameDispatch(setPlayer1(player1))
    gameDispatch(setPlayer2(player2))
  }, [])

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  engine.onmessage = async function (event) {
    if (event.data.split(' ')[0] === 'bestmove') {
      const data = event.data.split(' ')
      let gameCopy = gameState.board

      await delay(getRandomValueFromList([4000]))

      gameCopy.move({
        from: data[1].substring(0, 2) ? data[1].substring(0, 2) : '',
        to: data[1].substring(2, 4),
      })
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
      gameDispatch(setCurrentMoveIndex(gameState.moves.length))
      gameDispatch(resetMoveSelection())
    }
  }

  const sendPositionToEngine = (position: any) => {
    engine.postMessage(`position fen ${position}`)
    engine.postMessage('go depth 5')
  }

  const makeMove = (foundMove: any, square: Square) => {
    const newState = gameDispatch(handleMoveThunk({ foundMove, square }))
    gameDispatch(setGameHistory([...gameState.history, newState.board.fen()]))
    gameDispatch(setMoves([...gameState.moves, foundMove.san]))
    gameDispatch(setCurrentMoveIndex(gameState.moves.length))
    sendPositionToEngine(newState.board.fen())
  }

  const onSquareClick = (square: Square) => {
    const { isMove, foundMove } = gameDispatch(onSquareClickThunk(square, wallet))
    if (isMove) {
      gameDispatch(setTurn('b'))
      gameDispatch(switchPlayerTurn())
      makeMove(foundMove, square)
    }
  }

  useEffect(() => {
    if (gameState.isGameOver || gameState.isGameDraw) {
      setShowPopup(true)
    }
  }, [gameState.isGameOver, gameState.isGameDraw])

  useEffect(() => {
    if (wallet) {
      localStorage.setItem('address', wallet.account?.address)
    }
  }, [wallet])

  const onPromotionPieceSelect = (piece: any) => {
    gameDispatch(
      handlePromotionMoveThunk({
        piece,
        additionTimePerMove,
        currentPlayerTurn: gameState.playerTurn,
        playerTimer1: 0,
        playerTimer2: 0,
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

  const theme = isAndroid ? 'material' : 'ios'

  if (!gameState.board) {
    return <LoadingGame />
  } else {
    return (
      <App theme={theme}>
        <Header />
        <GameBoard
          player1Timer={0}
          player2Timer={0}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          moveSquares={{}}
          showProgressBar={false}
          progressBar={0}
        />
        <GameNavbar
          user={wallet?.account.address ? wallet?.account.address : 'player1'}
          opponent={wallet?.account.address === player1 ? player2 : player1}
          socket={socket}
          isMoved={gameState.moves.length !== 0}
          isWhite={player1 === wallet?.account.address}
        />
        <GameOverPopUp setShowPopup={setShowPopup} showPopup={showPopup && !isPopupDismissed} />
      </App>
    )
  }
}

export default PuzzleGame
