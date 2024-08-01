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
  setOptionSquares,
  setPlayerTurn,
  setRightClickedSquares,
  showPromotionDialog,
  setPlayer1,
  setPlayer2,
  setNewMove,
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

  // Parse the query parameters
  const queryParams = new URLSearchParams(location.search)

  const wallet = useTonWallet()
  const [turn, setTurn] = useState(wallet?.account.address ? wallet.account.address : 'player1')
  const [player1] = useState(wallet?.account.address ? wallet.account.address : 'player1')
  const [player2] = useState('bot')
  const [showPopup, setShowPopup] = useState(false)
  const [isStartGame, setIsStartGame] = useState(false)
  const [isPopupDismissed, setIsPopupDismissed] = useState(false)
  const [additionTimePerMove] = useState(Number(queryParams.get('increment')))

  const {
    seconds: timer1Seconds,
    minutes: timer1Minutes,
    start: startTimer1,
    pause: pauseTimer1,
    restart: restartTimer1,
  } = useTimer({
    expiryTimestamp: new Date(Date.now() + Number(queryParams.get('time')) * 60 * 1000),
    autoStart: false,
  })

  const {
    seconds: timer2Seconds,
    minutes: timer2Minutes,
    start: startTimer2,
    pause: pauseTimer2,
    restart: restartTimer2,
  } = useTimer({
    expiryTimestamp: new Date(Date.now() + Number(queryParams.get('time')) * 60 * 1000),
    autoStart: false,
  })

  // const [opponentDisconnect, setOpponentDisconnect] = useState(false)

  useEffect(() => {
    gameDispatch(resetGame())
    gameDispatch(setPlayer1(player1))
    gameDispatch(setPlayer2(player2))
    if (gameState.playerTurn === player1) {
      startTimer1()
    } else {
      startTimer2()
    }
  }, [])

  const isPlayerTimeout = () => {
    return (
      (gameState.playerTurn === gameState.player1 && timer1Minutes * 60 + timer1Seconds === 0) ||
      (gameState.playerTurn === gameState.player2 && timer2Minutes * 60 + timer2Seconds === 0)
    )
  }

  function getRandomValueFromList(list: any) {
    const randomIndex = Math.floor(Math.random() * list.length)
    return list[randomIndex]
  }

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
          gameDispatch(
            setNewMove({
              turn: gameCopy.turn(),
              fen: gameCopy.fen(),
              san: data[1],
              board: gameCopy,
              history: [...gameState.history, gameCopy.fen()],
            })
          )
          gameDispatch(resetMoveSelection())
        },
        getRandomValueFromList([1000, 2000, 3000, 4000])
      )
    }
  }

  const sendPositionToEngine = (position: any) => {
    engine.postMessage(`position fen ${position}`)
    engine.postMessage('go depth 5')
  }

  const makeMove = (foundMove: any, square: Square) => {
    const newState = gameDispatch(handleMoveThunk({ foundMove, square }))
    sendPositionToEngine(newState.board.fen())
  }

  const onSquareClick = (square: Square) => {
    const { isMove, foundMove } = gameDispatch(onSquareClickThunk(square, wallet))
    if (isMove) {
      makeMove(foundMove, square)
    }
  }

  // useEffect(() => {
  //   if (isThreefoldRepetition(gameState.history)) {
  //     gameDispatch(setGameDraw(true))
  //   }
  // }, [history])

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
      })
    )
  }

  const onSquareRightClick = (square: any) => {
    gameDispatch(setRightClickedSquares(square))
  }

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

  const theme = isAndroid ? 'material' : 'ios'

  if (!gameState.board) {
    return <LoadingGame />
  } else {
    return (
      <App theme={theme}>
        <Header />
        <GameBoard
          player1Timer={timer1Minutes * 60 + timer1Seconds}
          player2Timer={timer2Minutes * 60 + timer2Seconds}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPromotionPieceSelect={onPromotionPieceSelect}
          showPromotionDialog={gameState.showPromotionDialog}
          moveSquares={{}}
          optionSquares={gameState.optionSquares}
          rightClickedSquares={{}}
          kingSquares={{}}
        />
        <GameNavbar
          user={wallet?.account.address ? wallet?.account.address : 'player1'}
          opponent={wallet?.account.address === player1 ? player2 : player1}
          socket={socket}
          isMoved={gameState.moves.length !== 0}
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
