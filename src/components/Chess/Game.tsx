import { useEffect, useState, useRef } from 'react'
import { Chess, Square } from 'chess.js'
import { useNavigate, useLocation } from 'react-router-dom'
import restApi from '../../services/api'
import { socket } from '../../services/socket'
import {
  convertToFigurineSan,
  formatTime,
  getAvatarName,
  getLastUpdateTime,
  getTimeFromLocalStorage,
} from '../../utils/utils'
import { Chessboard as Board } from 'react-chessboard'
import { truncateSuiTx } from '../../services/address'
import LoadingGame from '../Loading/Loading'
import Popup from '../Popup/Popup'
import Header from '../Header/Header'
import { useTonWallet } from '@tonconnect/ui-react'
import MoveRecord from './MoveRecord'
import GameOverPopUp from './GameOverPopUp'
import PlayerDisplay from './PlayerDisplay'

const Game: React.FC<{}> = () => {
  // const currentAccount = useCurrentAccount()
  const [isStartGame, setIsStartGame] = useState(false)
  const wallet = useTonWallet()
  const [game, setGame] = useState<Chess | any>()
  const [raw, setRaw] = useState<any>(null)

  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')

  const [name1, setName1] = useState(getAvatarName())
  const [name2, setName2] = useState(getAvatarName())

  const [moveFrom, setMoveFrom] = useState<any>('')
  const [moveTo, setMoveTo] = useState<any>('')

  const [turn, setTurn] = useState('')

  const [rightClickedSquares, setRightClickedSquares] = useState<any>({})
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)
  const [optionSquares, setOptionSquares] = useState({})
  const [moveSquares, setMoveSquares] = useState({})
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameDraw, setIsGameDraw] = useState(false)

  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [turnPlay, setTurnPlay] = useState(false)
  const navigate = useNavigate()
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
      } else if (currentPlayer === player1 && player1Timer === 0) {
        setIsGameOver(true)
        emitGameOver()
      } else if (currentPlayer === player2 && player2Timer === 0) {
        setIsGameOver(true)
        emitGameOver()
      }
    }

    return () => clearInterval(intervalId) // Cleanup function to clear interval
  }, [currentPlayer, player1Timer, player2Timer, isGameDraw, isGameOver])

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
    if (isOrientation() === 'white' && turn === 'w') {
      return player1
    } else if (isOrientation() === 'white' && turn === 'b') {
      return player2
    } else if (isOrientation() === 'black' && turn === 'b') {
      return player2
    } else if (isOrientation() === 'black' && turn === 'w') {
      return player1
    }
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
          setGame(new Chess(data.fen))
          setRaw(data)
          setPlayer1(data.player_1)
          setPlayer2(data.player_2)
          setTurnPlay(data.turnPlay)
          if (data.move_number === 1 && data.turn_player === 'w') {
            setPlayer1Timer(data.timers.player1Timer)
            setPlayer2Timer(data.timers.player2Timer)
            setAdditionTimePerMove(data.timePerMove)
          }

          if (!(data.move_number === 1 && data.turn_player === 'w')) {
            setIsStartGame(true)
          }

          setCurrentPlayer(currentPlayerTurn() === player1 ? player1 : player2)
          // if (data.player_1.length > 0 && data.player_2.length > 0) {
          //   setIsStartGame(true)
          // }
        }
      })
      .catch((err) => {})
  }, [turn])

  useEffect(() => {
    function onConnect() {
      setIsSocketConnected(true)
    }

    function onNewMove(room: any) {
      console.log(room)
      setMoveLists((newMoves: any) => [...newMoves, `${room.san}`])
      if (room.fen) {
        setTurn(room.turn)
        handleSwitchTurn()
        setGame(new Chess(room.fen))
        setTurnPlay(room.turn)
        setPlayer1Timer(room.timers.player1Timer)
        setPlayer2Timer(room.timers.player2Timer)
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
    const moves = game.moves({
      square,
      verbose: true,
    })

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

  function onSquareClick(square: Square) {
    // if currentAccount
    if (true) {
      if (isGameDraw || isGameOver || game.isDraw() || game.isGameOver()) {
        return
      }

      if (player1 !== wallet?.account.address && game._turn === 'w') {
        return
      }
      if (player2 !== wallet?.account.address && game._turn === 'b') {
        return
      }

      setRightClickedSquares({})

      if (!moveTo) {
        if (!moveFrom) {
          const hasMoveOptions = getMoveOptions(square)
          if (hasMoveOptions) setMoveFrom(square)
          return
        }

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

        if (
          (foundMove.color === 'w' && foundMove.piece === 'p' && square[1] === '8') ||
          (foundMove.color === 'b' && foundMove.piece === 'p' && square[1] === '1')
        ) {
          setShowPromotionDialog(true)
          return
        }

        let gameCopy = game

        setIsStartGame(true)

        const move = gameCopy.move({
          from: moveFrom,
          to: square,
          promation: 'q',
        })

        foundMove.san = convertToFigurineSan(foundMove.san, foundMove.color)

        socket.emit('move', {
          from: moveFrom,
          to: square,
          game_id: location.pathname.split('/')[2],
          turn: game.turn(),
          address: '',
          fen: game.fen(),
          isPromotion:
            (foundMove.color === 'w' && foundMove.piece === 'p' && square[1] === '8') ||
            (foundMove.color === 'b' && foundMove.piece === 'p' && square[1] === '1'),
          timers: {
            player1Timer:
              currentPlayerTurn() === player1 ? player1Timer + additionTimePerMove : player1Timer,
            player2Timer:
              currentPlayerTurn() === player2 ? player2Timer + additionTimePerMove : player2Timer,
          },
          san: foundMove.san,
        })

        handleSwitchTurn()

        if (move === null) {
          const hasMoveOptions = getMoveOptions(square)
          if (hasMoveOptions) setMoveFrom(square)
          return
        }

        setGame(gameCopy)

        // setTimeout(makeRandomMove, 300);
        setMoveFrom('')
        setMoveTo(null)
        setOptionSquares({})
        return
      }
    }
  }

  function onPromotionPieceSelect(piece: any) {
    // if no piece passed then user has cancelled dialog, don't make move and reset
    if (piece) {
      let gameCopy: any = game
      console.log(game)
      const newMove = gameCopy.move({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? 'q',
      })
      console.log('7s200:pro', { promotion: piece[1].toLowerCase() ?? 'q' })
      if (newMove) {
        setGame(gameCopy)
        // Emit the move to the backend
        socket.emit('move', {
          from: moveFrom,
          to: moveTo,
          game_id: location.pathname.split('/')[2],
          turn: game.turn(),
          // address: activeAccount?.address,
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

  const onShowPlayerTop = () => {
    const isPlayer1 = wallet?.account.address === player1
    const isPlayer2 = wallet?.account.address === player2
    const playerName =
      wallet?.account.address !== player1 && wallet?.account.address !== player2
        ? raw.player_2 === ''
          ? 'Waiting player...'
          : truncateSuiTx(raw.player_2)
        : isPlayer2
        ? player1
        : player2
    const playerImage = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name1}`
    const playerTime =
      isOrientation() === 'white' ? formatTime(player2Timer) : formatTime(player1Timer)

    return (
      <PlayerDisplay
        imageSrc={playerImage}
        name={truncateSuiTx(playerName ? playerName : '')}
        time={playerTime}
        timeBoxClass="bg-grey-100 border-b-4 border-grey-200"
        clockIconSrc="/clock-stopwatch-white.svg"
        textColor="text-white"
      />
    )
  }

  const onShowPlayerBottom = () => {
    const isPlayer1 = wallet?.account.address === player1
    const isPlayer2 = wallet?.account.address === player2
    const playerName = isPlayer1 || !isPlayer2 ? player1 : player2
    const playerImage = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name2}`
    const playerTime =
      isOrientation() === 'white' ? formatTime(player1Timer) : formatTime(player2Timer)

    return (
      <PlayerDisplay
        imageSrc={playerImage}
        name={truncateSuiTx(playerName ? playerName : '')}
        time={playerTime}
        timeBoxClass="bg-blue-gradient border-b-4 border-blue-200"
        clockIconSrc="/clock-stopwatch-black.svg"
        textColor="text-white"
      />
    )
  }

  const isOrientation = () => {
    if (wallet?.account.address === player1) {
      return 'white'
    } else {
      return 'black'
    }
  }

  const onShowGame: any = () => {
    return (
      <>
        <div className="" style={{ height: '400px', width: '400px', cursor: 'pointer' }}>
          <div className="flex flex-col space-y-1">
            <MoveRecord moveLists={moveLists} />
            {onShowPlayerTop()}
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
                game={game}
                isGameOver={isGameOver}
                isGameDraw={isGameDraw}
                player1={player1}
                player2={player2}
                wallet={wallet}
              />
            </div>
            {onShowPlayerBottom()}
          </div>
        </div>
      </>
    )
  }

  if (!game || !raw) {
    return <LoadingGame />
  } else {
    return (
      <>
        <Header />
        <div className="flex flex-col pt-6 justify-start bg-gray-1000 h-screen">
          <div className="flex justify-center items-center pt-5 mt-10">{onShowGame()}</div>
        </div>
      </>
    )
  }
}

export default Game
