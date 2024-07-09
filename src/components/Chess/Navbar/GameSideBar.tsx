import { useState, useEffect } from 'react'
import { useCallback } from 'react'
import { Dialog, DialogButton } from 'konsta/react'

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
  isMoved: boolean
  isWhite: boolean
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
  isMoved,
  isWhite,
}) => {
  const [visiblePopup, setVisiblePopup] = useState<string | null>(null)
  const gameId = location.pathname.split('/')[2]
  const [opponentAction, setOpponentAction] = useState<string | null>(null)
  const [drawRequest, setDrawRequest] = useState<boolean>(false)
  const [notificationPopup, setNotificationPopup] = useState(false)
  const togglePopup = (popup: string | null) => {
    setVisiblePopup((prev) => {
      if (prev === popup) {
        toggleSidebar()
        return null
      } else {
        if (popup) {
          toggleSidebar()
        }
        return popup
      }
    })
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

  const handlePopupAction = (actionType: string) => {
    const actions: Record<string, () => void> = {
      abort: () => {
        socket.emit('abort', { game_id: gameId, isGameOver: true, winner: opponent, loser: user })
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
  }

  const handleConfirmDraw = useCallback(() => {
    socket.emit('confirmDraw', { game_id: gameId })
    setDrawRequest(false)
  }, [socket, gameId])

  const handleAbort = () => {
    if (isAbortAllow()) {
      togglePopup('abort')
      return
    }

    setNotificationPopup(true)
    toggleSidebar()
  }

  function isAbortAllow() {
    return (
      (game._moveNumber === 1 && game._turn === 'b' && isMoved && !isWhite) ||
      (game._moveNumber === 1 && game._turn === 'w' && !isMoved)
    )
  }

  const renderPopups = () => (
    <>
      {['resign', 'draw', 'abort'].map((action) => (
        <Dialog
          opened={visiblePopup === action}
          onBackdropClick={setVisiblePopup}
          title=""
          content={`Do you want to ${action} the game?`}
          buttons={
            <>
              <DialogButton onClick={() => handlePopupAction(action)}>Yes</DialogButton>
              <DialogButton onClick={() => togglePopup(null)}>No</DialogButton>
            </>
          }
        />
      ))}

      <Dialog
        opened={opponentAction ? true : false}
        onBackdropClick={setOpponentAction}
        title="Opponent Action"
        content={opponentAction}
        buttons={
          <>
            <DialogButton onClick={() => setOpponentAction(null)}>Yes</DialogButton>
            <DialogButton onClick={() => setOpponentAction(null)}>No</DialogButton>
          </>
        }
      />

      <Dialog
        opened={drawRequest}
        onBackdropClick={setDrawRequest}
        title="Draw Request"
        content="Your opponent requested a draw. Do you accept?"
        buttons={
          <>
            <DialogButton onClick={handleConfirmDraw}>Yes</DialogButton>
            <DialogButton onClick={() => setDrawRequest(false)}>No</DialogButton>
          </>
        }
      />
      <Dialog
        opened={notificationPopup}
        onBackdropClick={() => setNotificationPopup((prev) => !prev)}
        title=""
        content="Can not abort the game because you already make your move"
      />
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
