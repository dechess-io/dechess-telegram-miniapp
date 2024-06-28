import { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import { useNavigate } from 'react-router-dom'
import GamePopup from '../Popup/GamePopup'
import { useCallback } from 'react'
import Popup from '../../Popup/Popup'
import NotificationPopup from '../Popup/NotificationPopup'

const SOCKET_EVENTS = {
  OPPONENT_ABORT: 'opponentAbort',
  OPPONENT_RESIGN: 'opponentResign',
  OPPONENT_DRAW_REQUEST: 'opponentDrawRequest',
  DRAW_CONFIRMED: 'drawConfirmed',
}

interface GameSidebarProps {
  isSidebarVisible: boolean
  toggleSidebar: any
  game: any
  socket: any
  toggleGameDraw: any
  toggleGameOver: any
  user: string
  opponent: string
}

const GameSidebar: React.FC<GameSidebarProps> = ({
  isSidebarVisible,
  toggleSidebar,
  socket,
  game,
  toggleGameDraw,
  toggleGameOver,
  user,
  opponent,
}) => {
  const [visiblePopup, setVisiblePopup] = useState<string | null>(null)
  const gameId = location.pathname.split('/')[2]
  const [opponentAction, setOpponentAction] = useState<string | null>(null)
  const [drawRequest, setDrawRequest] = useState<boolean>(false)
  const [notificationPopup, setNotificationPopup] = useState(false)
  const togglePopup = (popup: string | null) => {
    setVisiblePopup((prev) => (prev === popup ? null : popup))
  }

  useEffect(() => {
    const handleOpponentAbort = () => toggleGameOver()
    const handleOpponentResign = () => toggleGameOver()
    const handleOpponentDrawRequest = () => setDrawRequest(true)
    const handleDrawConfirmed = () => {
      toggleGameOver()
      toggleGameDraw()
    }

    socket.on(SOCKET_EVENTS.OPPONENT_ABORT, handleOpponentAbort)
    socket.on(SOCKET_EVENTS.OPPONENT_RESIGN, handleOpponentResign)
    socket.on(SOCKET_EVENTS.OPPONENT_DRAW_REQUEST, handleOpponentDrawRequest)
    socket.on(SOCKET_EVENTS.DRAW_CONFIRMED, handleDrawConfirmed)

    return () => {
      socket.off(SOCKET_EVENTS.OPPONENT_ABORT, handleOpponentAbort)
      socket.off(SOCKET_EVENTS.OPPONENT_RESIGN, handleOpponentResign)
      socket.off(SOCKET_EVENTS.OPPONENT_DRAW_REQUEST, handleOpponentDrawRequest)
      socket.off(SOCKET_EVENTS.DRAW_CONFIRMED, handleDrawConfirmed)
    }
  }, [socket, toggleGameOver, toggleGameDraw])

  const handlePopupAction = useCallback(
    (actionType: string) => {
      const actions: Record<string, () => void> = {
        abort: () => {
          socket.emit('abort', { game_id: gameId, isGameOver: true })
          toggleGameOver()
        },
        draw: () => {
          socket.emit('drawRequest', { game_id: gameId })
          setVisiblePopup(null)
        },
        resign: () => {
          socket.emit('resign', {
            game_id: gameId,
            isGameOver: true,
            isGameDraw: false,
            winner: opponent,
            loser: user,
          })
          toggleGameOver()
        },
      }

      actions[actionType]?.()
      setVisiblePopup(null)
    },
    [socket, gameId, toggleGameOver, opponent, user]
  )

  const handleConfirmDraw = useCallback(() => {
    socket.emit('confirmDraw', { game_id: gameId })
    setDrawRequest(false)
  }, [socket, gameId])

  const handleAbort = () => {
    console.log(game)
    if (game._moveNumber === 1 && game._turn === 'b') {
      togglePopup('abort')
    } else {
      setNotificationPopup(true)
    }
  }

  const renderPopups = () => (
    <>
      {['resign', 'draw', 'abort'].map((action) => (
        <GamePopup
          key={action}
          title={action.charAt(0).toUpperCase() + action.slice(1)}
          message={`Do you want to ${action} the game?`}
          onConfirm={() => handlePopupAction(action)}
          onCancel={() => togglePopup(null)}
          showPopup={visiblePopup === action}
          setShowPopup={setVisiblePopup}
        />
      ))}

      {opponentAction && (
        <GamePopup
          title="Opponent Action"
          message={opponentAction}
          onConfirm={() => setOpponentAction(null)}
          onCancel={() => setOpponentAction(null)}
          showPopup={true}
          setShowPopup={setOpponentAction}
        />
      )}

      {drawRequest && (
        <GamePopup
          title="Draw Request"
          message="Your opponent requested a draw. Do you accept?"
          onConfirm={handleConfirmDraw}
          onCancel={() => setDrawRequest(false)}
          showPopup={true}
          setShowPopup={setDrawRequest}
        />
      )}
      {notificationPopup && (
        <NotificationPopup
          key={'Abort'}
          title="Abort"
          message="Can not abort the game because you already make your move"
          showPopup={notificationPopup}
          setShowPopup={() => setNotificationPopup((prev) => !prev)}
        />
      )}
    </>
  )

  return (
    <>
      {renderPopups()}

      <div
        className={`fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-black bg-opacity-75 text-white p-4 transition-all duration-300 z-50 rounded-lg ${
          isSidebarVisible ? 'block' : 'hidden'
        }`}
      >
        <ul className="mt-4 flex flex-col items-center">
          <li className="py-2 cursor-pointer pb-4" onClick={() => togglePopup('draw')}>
            Draw
          </li>
          <li className="py-2 cursor-pointer pb-4" onClick={handleAbort}>
            Abort
          </li>
          <li className="py-2 cursor-pointer pb-4" onClick={() => togglePopup('resign')}>
            Resign
          </li>
          <li className="py-2 cursor-pointer pb-4" onClick={toggleSidebar}>
            Share Game
          </li>
          <li className="py-2 cursor-pointer pb-4" onClick={toggleSidebar}>
            Settings
          </li>
          <li className="py-2 cursor-pointer pb-4" onClick={toggleSidebar}>
            Cancel
          </li>
        </ul>
      </div>
    </>
  )
}

export default GameSidebar
