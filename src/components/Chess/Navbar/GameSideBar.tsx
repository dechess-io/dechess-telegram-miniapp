import { useState, useEffect, useCallback } from 'react'
import { Actions, ActionsButton, ActionsGroup, Dialog, DialogButton } from 'konsta/react'
import CloseIcn from '../../../assets/icons/close.svg'

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
        return null
      } else {
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
          key={action}
          className="bg-black-linear"
          opened={visiblePopup === action}
          onBackdropClick={setVisiblePopup}
          title={
            <div className="relative">
              <div className="capitalize">Game {action}</div>
              <div className="absolute -top-2 -right-2">
                <img
                  src={CloseIcn}
                  alt="close-icn"
                  className="cursor-pointer"
                  onClick={() => setVisiblePopup(null)}
                />
              </div>
            </div>
          }
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
      <Actions opened={isSidebarVisible && !visiblePopup} onBackdropClick={() => toggleSidebar()}>
        <ActionsGroup>
          <ActionsButton onClick={() => togglePopup('draw')}>Draw</ActionsButton>
          <ActionsButton onClick={handleAbort}>Abort</ActionsButton>
          <ActionsButton onClick={() => togglePopup('resign')}>Resign</ActionsButton>
          <ActionsButton onClick={() => toggleSidebar()}>Share Game</ActionsButton>
          <ActionsButton onClick={() => toggleSidebar()}>Setting</ActionsButton>
          <ActionsButton onClick={() => toggleSidebar()}>Cancel</ActionsButton>
        </ActionsGroup>
      </Actions>
    </>
  )
}

export default GameSidebar
