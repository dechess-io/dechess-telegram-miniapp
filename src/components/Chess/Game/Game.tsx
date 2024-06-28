import { useEffect, useState, useRef } from 'react'
import { Chess, Square } from 'chess.js'
import { useNavigate, useLocation } from 'react-router-dom'
import restApi from '../../../services/api'
import { socket } from '../../../services/socket'
import MoveRecord from './MoveRecord'
import GameOverPopUp from '../Popup/GameOverPopUp'
import PlayerDisplay from './PlayerDisplay'
import { Chessboard as Board } from 'react-chessboard'

import {
  convertToFigurineSan,
  formatTime,
  getAvatarName,
  getLastUpdateTime,
  getTimeFromLocalStorage,
} from '../../../utils/utils'
import LoadingGame from '../../Loading/Loading'
import Header from '../../Header/Header'
import { useTonWallet } from '@tonconnect/ui-react'
import GameNavbar from '../Navbar/GameNavbar'
import GameBoard from './Board'
import { truncateSuiTx } from '../../../services/address'

const Game: React.FC<{}> = () => {
  // const currentAccount = useCurrentAccount()
  const [isStartGame, setIsStartGame] = useState(false)
  const wallet = useTonWallet()
  const [game, setGame] = useState<Chess | any>()

  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')

  const [name1] = useState(getAvatarName())
  const [name2] = useState(getAvatarName())

  const [moveFrom, setMoveFrom] = useState<any>('')
  const [moveTo, setMoveTo] = useState<any>('')

  const [turn, setTurn] = useState('')

  const [rightClickedSquares, setRightClickedSquares] = useState<any>({})
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)
  const [optionSquares, setOptionSquares] = useState({})
  const [moveSquares, setMoveSquares] = useState({})
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameDraw, setIsGameDraw] = useState(false)
  const [isWinner, setIsWinner] = useState(false)
  const [isLoser, setIsLoser] = useState(false)
  const [gameHistory, setGameHistory] = useState<string[]>([new Chess().fen()])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)

  const location = useLocation()
  const [moveLists, setMoveLists] = useState<string[]>([])

  const [currentPlayer, setCurrentPlayer] = useState('')
  const [additionTimePerMove, setAdditionTimePerMove] = useState(0)

  const [player1Timer, setPlayer1Timer] = useState(() =>
    getTimeFromLocalStorage('player1Timer', -1)
  )
  const [player2Timer, setPlayer2Timer] = useState(() =>
    getTimeFromLocalStorage('player2Timer', -1)
  )

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

    if (!isGameDraw && !isGameOver && isStartGame) {
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
        setIsGameOver(true)
        emitGameOver()
      }
    }

    return () => clearInterval(intervalId) // Cleanup function to clear interval
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
    const orientation = isOrientation()
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
          console.log(data)
          setTurn(data.turn_player)
          setGame(new Chess(data.fen))
          setPlayer1(data.player_1)
          setPlayer2(data.player_2)
          setIsGameDraw(data.isGameDraw)
          setIsGameOver(data.isGameOver)
          if (data.winner && currentPlayer === data.winner) {
            setIsWinner(true)
          }
          if (data.loser && currentPlayer === data.loser) {
            setIsLoser(true)
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
  }, [turn])

  useEffect(() => {
    function onConnect() {}

    function onNewMove(room: any) {
      setMoveLists((newMoves: any) => [...newMoves, `${room.san}`])
      if (room.fen) {
        setTurn(room.turn)
        handleSwitchTurn()
        setGame(new Chess(room.fen))
        setPlayer1Timer(room.timers.player1Timer)
        setPlayer2Timer(room.timers.player2Timer)
        setGameHistory((prevHistory) => [...prevHistory, room.fen])
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
      setOptionSquares({})
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

    setOptionSquares(newSquares)
    return true
  }

  function isEligibleToPlay() {
    if (isGameDraw || isGameOver || game.isDraw() || game.isGameOver()) return false

    const isPlayerTurn =
      (player1 === wallet?.account.address && game._turn === 'w') ||
      (player2 === wallet?.account.address && game._turn === 'b')
    return isPlayerTurn
  }

  function handleMoveFromSelection(square: Square) {
    const hasMoveOptions = getMoveOptions(square)
    if (hasMoveOptions) setMoveFrom(square)
  }

  function handleMoveToSelection(square: Square) {
    const moves = game.moves({
      square: moveFrom,
      verbose: true,
    })

    const foundMove = moves.find((m: any) => m.from === moveFrom && m.to === square) as any

    if (!foundMove) {
      const hasMoveOptions = getMoveOptions(square)
      setMoveFrom(hasMoveOptions ? square : '')
      return
    }

    setMoveTo(square)

    if (isPromotionMove(foundMove, square)) {
      setShowPromotionDialog(true)
      return
    }

    makeMove(foundMove, square)
  }

  function makeMove(foundMove: any, square: Square) {
    setIsStartGame(true)

    let gameCopy = game

    const move = gameCopy.move({
      from: moveFrom,
      to: square,
      promation: 'q',
    })

    foundMove.san = convertToFigurineSan(foundMove.san, foundMove.color)

    emitMove(foundMove, square, gameCopy)

    handleSwitchTurn()

    if (!move) {
      handleMoveFromSelection(square)
      return
    }

    setGame(gameCopy)
    setMoveFrom('')
    setMoveTo(null)
    setOptionSquares({})
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
    // if no piece passed then user has cancelled dialog, don't make move and reset
    if (piece) {
      let gameCopy: any = game
      const newMove = gameCopy.move({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? 'q',
      })
      console.log('7s200:pro', { promotion: piece[1].toLowerCase() ?? 'q' })
      if (newMove) {
        setGame(gameCopy)
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

    setMoveFrom('')
    setMoveTo(null)
    setShowPromotionDialog(false)
    setOptionSquares({})
    return true
  }

  const getPlayerDisplayProps = (isTop: boolean) => {
    const isPlayer1 = wallet?.account.address === player1
    const isPlayer2 = wallet?.account.address === player2
    const isWhite = isOrientation() === 'white'
    let playerName, playerImage, playerTime
    if (isTop) {
      playerName = isPlayer2 ? player1 : player2
      playerImage = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name1}`
      playerTime = isWhite ? formatTime(player2Timer) : formatTime(player1Timer)
    } else {
      playerName = isPlayer1 || !isPlayer2 ? player1 : player2
      playerImage = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name2}`
      playerTime = isWhite ? formatTime(player1Timer) : formatTime(player2Timer)
    }

    return {
      imageSrc: playerImage,
      name: truncateSuiTx(playerName ? playerName : ''),
      time: playerTime,
      timeBoxClass: isTop
        ? 'bg-grey-100 border-b-4 border-grey-200'
        : 'bg-blue-gradient border-b-4 border-blue-200',
      clockIconSrc: isTop ? '/clock-stopwatch-white.svg' : '/clock-stopwatch-black.svg',
      textColor: 'text-white',
    }
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

  const isOrientation = () => {
    if (wallet?.account.address === player1) {
      return 'white'
    } else {
      return 'black'
    }
  }

  function handlePreviousMove() {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex((prevIndex) => prevIndex - 1)
      const newGame = new Chess(gameHistory[currentMoveIndex - 1])
      setGame(newGame)
    }
  }

  function handleNextMove() {
    if (currentMoveIndex < gameHistory.length - 1) {
      setCurrentMoveIndex((prevIndex) => prevIndex + 1)
      const newGame = new Chess(gameHistory[currentMoveIndex + 1])
      setGame(newGame)
    }
  }

  if (!game) {
    return <LoadingGame />
  } else {
    return (
      <>
        <Header />
        <div className="flex flex-col pt-6 justify-start bg-[#041d21] h-screen">
          <div className="flex justify-center items-center pt-5 mt-10">
            <div className="" style={{ height: '400px', width: '400px', cursor: 'pointer' }}>
              <div className="flex flex-col space-y-1">
                <MoveRecord moveLists={moveLists} />
                <PlayerDisplay {...getPlayerDisplayProps(true)} />
                <div className="relative border-8 border-white rounded-lg">
                  <Board
                    boardOrientation={isOrientation()}
                    position={game.fen()}
                    id="ClickToMove"
                    animationDuration={200}
                    arePiecesDraggable={false}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    onPromotionPieceSelect={onPromotionPieceSelect}
                    customBoardStyle={{
                      // borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                    customLightSquareStyle={{
                      backgroundColor: '#E8EDF9',
                    }}
                    customDarkSquareStyle={{
                      backgroundColor: '#B7C0D8',
                    }}
                    customSquareStyles={{
                      ...moveSquares,
                      ...optionSquares,
                      ...rightClickedSquares,
                    }}
                    promotionToSquare={moveTo}
                    showPromotionDialog={showPromotionDialog}
                  />
                  <GameOverPopUp
                    isWinner={isWinner}
                    isLoser={isLoser}
                    game={game}
                    isGameOver={isGameOver}
                    isGameDraw={isGameDraw}
                    player1={player1}
                    player2={player2}
                    wallet={wallet}
                  />
                </div>
                <PlayerDisplay {...getPlayerDisplayProps(false)} />
              </div>
            </div>
          </div>
        </div>

        <GameNavbar
          user={currentPlayer}
          opponent={currentPlayer === player1 ? player2 : player1}
          toggleGameDraw={() => setIsGameDraw((prev) => !prev)}
          toggleGameOver={() => setIsGameOver((prev) => !prev)}
          handlePreviousMove={handlePreviousMove}
          handleNextMove={handleNextMove}
          socket={socket}
          game={game}
        />
      </>
    )
  }
}

export default Game
