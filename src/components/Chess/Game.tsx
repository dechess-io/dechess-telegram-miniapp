import { useEffect, useState, useRef } from 'react'
import { Chess, Square } from 'chess.js'
import { useNavigate, useLocation } from 'react-router-dom'
import restApi from '../../services/api'
import { socket } from '../../services/socket'
import { formatTime } from '../../utils/utils'
import { Chessboard as Board } from 'react-chessboard'
import { truncateSuiTx } from '../../services/address'
import LoadingGame from '../Loading/Loading'
import Popup from '../Popup/Popup'
import Header from '../Header/Header'
import { useTonWallet } from '@tonconnect/ui-react'
import BottomPlayerDisplay from './BottomPlayerDisplay'
import TopPlayerDisplay from './TopPlayerDisplay'

const nameLists = [
  'Callie',
  'Tigger',
  'Snickers',
  'Midnight',
  'Trouble',
  'Sammy',
  'Simon',
  'Oliver',
  'Lilly',
  'Abby',
  'Oreo',
  'Angel',
  'Luna',
  'Jack',
  'Salem',
]

const Game: React.FC<{}> = () => {
  // const currentAccount = useCurrentAccount()
  const [isStartGame, setIsStartGame] = useState(true)
  const wallet = useTonWallet()
  const [game, setGame] = useState<Chess | any>()
  const [raw, setRaw] = useState<any>(null)

  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')

  const [name1, setName1] = useState(nameLists[Math.floor(Math.random() * nameLists.length)])
  const [name2, setName2] = useState(nameLists[Math.floor(Math.random() * nameLists.length)])

  const [moveFrom, setMoveFrom] = useState<any>('')
  const [moveTo, setMoveTo] = useState<any>('')

  const [turn, setTurn] = useState('')

  const [rightClickedSquares, setRightClickedSquares] = useState<any>({})
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)
  const [optionSquares, setOptionSquares] = useState({})
  const [moveSquares, setMoveSquares] = useState({})
  const [isGameOver, setIsGameOver] = useState(new Chess().isGameOver())
  const [isGameDraw, setIsGameDraw] = useState(new Chess().isDraw())

  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isHiddenGameStatus, setIsHiddenGameStatus] = useState(false)

  const [turnPlay, setTurnPlay] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [moveLists, setMoveLists] = useState<string[]>([])

  const [player1Timer, setPlayer1Timer] = useState(600)
  const [player2Timer, setPlayer2Timer] = useState(600)
  const [currentPlayer, setCurrentPlayer] = useState('') // 1 for Player 1, 2 for Player 2

  console.log(currentPlayer)

  useEffect(() => {
    let intervalId: any

    if (currentPlayer === player1 && player1Timer > 0) {
      // Only update timer for Player 1 if it's their turn and timer hasn't reached zero
      intervalId = setInterval(() => {
        setPlayer1Timer((prevTimer) => Math.max(prevTimer - 1, 0))
      }, 1000)
    } else if (currentPlayer === player2 && player2Timer > 0) {
      // Only update timer for Player 2 if it's their turn and timer hasn't reached zero
      intervalId = setInterval(() => {
        setPlayer2Timer((prevTimer) => Math.max(prevTimer - 1, 0))
      }, 1000)
    }

    return () => clearInterval(intervalId) // Cleanup function to clear interval
  }, [currentPlayer, player1Timer, player2Timer]) // Dependency array: effect runs when player changes, timer reaches zero

  const handleSwitchTurn = () => {
    console.log('current ' + currentPlayer)
    const nextPlayer = currentPlayer === player1 ? player2 : player1
    console.log('next ' + nextPlayer)
    setCurrentPlayer(nextPlayer)
    console.log('set ' + currentPlayer)
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
          setCurrentPlayer(currentPlayerTurn() === player1 ? player1 : player2)
          if (data.player_1.length > 0 && data.player_2.length > 0) {
            setIsStartGame(true)
          }
        }
      })
      .catch((err) => {})
  }, [turn])

  useEffect(() => {
    function onConnect() {
      setIsSocketConnected(true)
    }

    function onNewMove(room: any) {
      setMoveLists((newMoves: any) => [...newMoves, `${room.from} ${room.to}`])
      if (room.fen) {
        setTurn(room.turn)
        handleSwitchTurn()
        setGame(new Chess(room.fen))
        setTurnPlay(room.turn)
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

        const move = gameCopy.move({
          from: moveFrom,
          to: square,
          promation: 'q',
        })

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
        })

        handleSwitchTurn()

        console.log(location.pathname.split('/')[2])

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
    if (wallet?.account.address !== player1 && wallet?.account.address !== player2) {
      return (
        <TopPlayerDisplay
          imageSrc={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name1}`}
          name={raw.player_2 === '' ? 'Waiting player...' : truncateSuiTx(raw.player_2)}
          time={isOrientation() === 'white' ? formatTime(player2Timer) : formatTime(player1Timer)}
        />
      )
    } else {
      if (wallet?.account.address === player2) {
        return (
          <TopPlayerDisplay
            imageSrc={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name1}`}
            name={truncateSuiTx(player1)}
            time={isOrientation() === 'white' ? formatTime(player2Timer) : formatTime(player1Timer)}
          />
        )
      } else {
        return (
          <TopPlayerDisplay
            imageSrc={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name1}`}
            name={truncateSuiTx(player2)}
            time={isOrientation() === 'white' ? formatTime(player2Timer) : formatTime(player1Timer)}
          />
        )
      }
    }
  }

  const onShowPlayerBottom = () => {
    if (wallet?.account.address !== player1 && wallet?.account.address !== player2) {
      return BottomPlayerDisplay({
        imageSrc: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name2}`,
        name: truncateSuiTx(player1),
        time: isOrientation() === 'white' ? formatTime(player1Timer) : formatTime(player2Timer),
      })
    } else {
      if (wallet?.account.address === player1) {
        return BottomPlayerDisplay({
          imageSrc: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name2}`,
          name: truncateSuiTx(player1),
          time: isOrientation() === 'white' ? formatTime(player1Timer) : formatTime(player2Timer),
        })
      } else {
        return BottomPlayerDisplay({
          imageSrc: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${name2}`,
          name: truncateSuiTx(player1),
          time: isOrientation() === 'white' ? formatTime(player1Timer) : formatTime(player2Timer),
        })
      }
    }
  }

  const onShowWaitingStartGame = () => {
    if (!isStartGame) {
      return (
        <div className="absolute top-1/3 left-[50px] w-[400px] bg-white border boder-none rounded-xl">
          <div className="flex flex-col space-y-4 justify-center items-center h-[150px]">
            <div className="font-bold">Waiting player join the game...</div>
          </div>
        </div>
      )
    }
    return <></>
  }

  const isOrientation = () => {
    if (wallet?.account.address === player1) {
      return 'white'
    } else {
      return 'black'
    }
  }

  const [activeButton, setActiveButton] = useState(null)

  const handleButtonClick = (buttonId: any) => {
    setActiveButton(buttonId)
  }

  const moveListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollLeft = moveListRef.current.scrollWidth
    }
  }, [moveLists])

  const onCreateGame = async () => {
    navigate(`/mode`)
  }

  const onShowGame: any = () => {
    return (
      <>
        <div className="" style={{ height: '400px', width: '400px', cursor: 'pointer' }}>
          <div className="flex flex-col space-y-1">
            <div
              ref={moveListRef}
              className="pb-4 bg-blue-gradient-1 h-[30px] text-white overflow-hidden whitespace-nowrap"
              style={{ width: '100%' }}
            >
              <div className="flex space-x-2">
                {' '}
                {/* Ensure the container allows scrolling */}
                {moveLists.map((move, index) => (
                  <span key={index} className="inline-block">{`${index + 1}: ${move}`}</span>
                ))}
              </div>
            </div>
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
              {(game.isGameOver() || game.isDraw()) && (
                <div
                  className={`absolute top-1/4  ${isHiddenGameStatus && 'hidden'}`}
                  onClick={() => setIsHiddenGameStatus(true)}
                >
                  <Popup className="bg-grey-100 w-[364px] h-[200px]">
                    <h1 className="mb-4 text-center font-bold text-[20px] font-ibm">
                      {game.isGameOver() && (
                        <div>
                          <h2 className="text-white font-ibm pb-5">Game Over</h2>
                          <span className="text-white font-ibm">
                            {(player1 === wallet?.account.address && game._turn === 'b') ||
                            (player2 === wallet?.account.address && game._turn === 'w')
                              ? 'You Win'
                              : 'You Lose'}
                          </span>
                          <div className="flex flex-row pt-2">
                            <div className="flex-auto p-1">
                              <button
                                className={`bg-gray-900 font-bold  rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                                onClick={() => navigate('/mode')}
                              >
                                <span className="text-white text-sm">New Game</span>
                              </button>
                            </div>
                            <div className="flex-auto p-1">
                              <button
                                className={`bg-gray-900 font-bold rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                                onClick={() => navigate('/')}
                              >
                                <span className="text-white text-sm">Game Overview</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {game.isDraw() && (
                        <div>
                          <h2 className="text-white font-ibm pb-5">Game Over</h2>
                          <span className="text-white font-ibm">Draw !</span>
                          <div className="flex flex-row pt-2">
                            <div className="flex-auto p-1">
                              <button
                                className={`bg-gray-900 font-bold  rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                                onClick={() => navigate('/mode')}
                              >
                                <span className="text-white text-sm">New Game</span>
                              </button>
                            </div>
                            <div className="flex-auto p-1">
                              <button
                                className={`bg-gray-900 font-bold rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                                onClick={() => navigate('/')}
                              >
                                <span className="text-white text-sm">Game Overview</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </h1>
                  </Popup>
                </div>
              )}
              {onShowWaitingStartGame()}
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
