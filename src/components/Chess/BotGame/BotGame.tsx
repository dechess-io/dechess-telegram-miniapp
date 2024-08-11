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
} from '../../../redux/game/action'
import { useTimer } from 'react-timer-hook'
import {
  handleMoveThunk,
  handlePromotionMoveThunk,
  onSquareClickThunk,
} from '../../../redux/game/thunk'

const BotGame: React.FC<{}> = () => {
  const gameState = useAppSelector((state) => state.game)
  const location = useLocation()
  const gameDispatch = useAppDispatch()
  const queryParams = new URLSearchParams(location.search)

  const wallet = useTonWallet()
  const [player1] = useState(wallet?.account.address ? wallet.account.address : 'player1')
  const [player2] = useState('bot')
  const [showPopup, setShowPopup] = useState(false)
  const [isStartGame, setIsStartGame] = useState(false)
  const [isPopupDismissed, setIsPopupDismissed] = useState(false)
  const [additionTimePerMove] = useState(Number(queryParams.get('increment')))

  const timer1 = useTimer({
    expiryTimestamp: new Date(Date.now() + Number(queryParams.get('time')) * 60 * 1000),
    autoStart: false,
    onExpire: () => {
      gameDispatch(setGameOver(true))
      gameDispatch(setWinner(false))
    },
  })

  const timer2 = useTimer({
    expiryTimestamp: new Date(Date.now() + Number(queryParams.get('time')) * 60 * 1000),
    autoStart: false,
    onExpire: () => {
      gameDispatch(setGameOver(true))
      gameDispatch(setWinner(false))
    },
  })

  useEffect(() => {
    gameDispatch(resetGame())
    gameDispatch(setPlayer1(player1))
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

  engine.onmessage = function (event) {
    if (event.data.split(' ')[0] === 'bestmove') {
      const data = event.data.split(' ')
      let gameCopy = gameState.board
      setTimeout(
        () => {
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
          timer1.resume()
          timer2.pause()
        },
        getRandomValueFromList([4000])
      )
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
    timer1.pause()
    timer2.resume()
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
        playerTimer1: timer1.minutes * 60 + timer1.seconds,
        playerTimer2: timer2.minutes * 60 + timer2.seconds,
      })
    )
  }

  const onSquareRightClick = (square: any) => {
    gameDispatch(setRightClickedSquares(square))
  }

  useEffect(() => {
    timer1.pause()
    timer2.pause()
  }, [gameState.isGameOver, gameState.isWinner, gameState.isLoser])

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
          player1Timer={timer1.minutes * 60 + timer1.seconds}
          player2Timer={timer2.minutes * 60 + timer2.seconds}
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

export default BotGame
