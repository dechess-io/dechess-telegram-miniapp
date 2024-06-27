import { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import { useNavigate } from 'react-router-dom'
import GamePopup from '../Popup/GamePopup'

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
  const togglePopup = (popup: string | null) => {
    setVisiblePopup((prev) => (prev === popup ? null : popup))
  }

  useEffect(() => {
    socket.on('opponentAbort', () => {
      toggleGameOver()
    })
    socket.on('opponentResign', () => {
      toggleGameOver()
    })
    socket.on('opponentDrawRequest', () => setDrawRequest(true))
    socket.on('drawConfirmed', () => {
      toggleGameOver()
      toggleGameDraw()
    })

    return () => {
      socket.off('opponentAbort')
      socket.off('opponentResign')
      socket.off('opponentDrawRequest')
      socket.off('drawConfirmed')
    }
  }, [])

  const handlePopupAction = (actionType: string) => {
    const actions: { [key: string]: () => void } = {
      abort: () => {
        socket.emit('abort', { game_id: gameId, isGameOver: true })
        toggleGameOver()
      },
      draw: handleDrawRequest,
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
  }

  const handleDrawRequest = () => {
    socket.emit('drawRequest', { game_id: gameId })
    setVisiblePopup(null)
  }

  const handleConfirmDraw = () => {
    socket.emit('confirmDraw', { game_id: gameId })
    setDrawRequest(false)
  }

  return (
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

      {isSidebarVisible && (
        <div
          className={`fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-black bg-opacity-75 text-white p-4 transition-all duration-300 z-50 rounded-lg ${
            isSidebarVisible ? 'block' : 'hidden'
          }`}
        >
          <ul className="mt-4 flex flex-col items-center">
            <li className="py-2 cursor-pointer pb-4" onClick={() => togglePopup('draw')}>
              Draw
            </li>
            <li className="py-2 cursor-pointer pb-4" onClick={() => togglePopup('abort')}>
              Abort
            </li>
            <li className="py-2 cursor-pointer pb-4" onClick={() => togglePopup('resign')}>
              Resign
            </li>
            <li className="py-2 cursor-pointer pb-4">Share Game</li>
            <li className="py-2 cursor-pointer pb-4">Settings</li>
            <li className="py-2 cursor-pointer pb-4" onClick={toggleSidebar}>
              Cancel
            </li>
          </ul>
        </div>
      )}
    </>
  )
}

export default GameSidebar
