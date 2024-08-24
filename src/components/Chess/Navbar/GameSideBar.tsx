import { useState, useEffect, useCallback } from 'react'
import { Actions, ActionsButton, ActionsGroup } from 'konsta/react'
import ReactDialog from '../../Dialog/ReactDialog'
import { useAppDispatch, useAppSelector } from '../../../redux/store'
import { selectGame } from '../../../redux/game/reducer'
import { setGameDraw, setGameOver, setLoser, setWinner } from '../../../redux/game/action'

const SOCKET_EVENTS = {
  OPPONENT_ABORT: 'opponentAbort',
  OPPONENT_RESIGN: 'opponentResign',
  OPPONENT_DRAW_REQUEST: 'opponentDrawRequest',
  DRAW_CONFIRMED: 'drawConfirmed',
}

interface GameSidebarProps {
  isSidebarVisible: boolean
  toggleSidebar: any
  socket: any
  user: string
  opponent: string
  isMoved: boolean
  isWhite: boolean
  isBot: boolean
}

const GameSidebar: React.FC<GameSidebarProps> = ({
  isSidebarVisible,
  toggleSidebar,
  socket,
  user,
  opponent,
  isMoved,
  isWhite,
  isBot,
}) => {
  const { board, isGameDraw, isGameOver } = useAppSelector(selectGame)
  const gameDispatch = useAppDispatch()

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
    const handleOpponentAbort = () => {
      gameDispatch(setGameOver(true))
      gameDispatch(setWinner(true))
    }
    const handleOpponentResign = () => {
      gameDispatch(setGameOver(true))
      gameDispatch(setWinner(true))
    }
    const handleOpponentDrawRequest = () => setDrawRequest(true)
    const handleDrawConfirmed = () => {
      gameDispatch(setGameOver(true))
      gameDispatch(setGameDraw(true))
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
  }, [socket, isGameDraw, isGameOver, gameDispatch])

  const handlePopupAction = (actionType: string) => {
    const actions: Record<string, () => void> = {
      abort: () => {
        socket.emit('abort', { game_id: gameId, isGameOver: true, winner: opponent, loser: user })
        gameDispatch(setGameOver(true))
        gameDispatch(setLoser(true))
        toggleSidebar()
      },
      draw: () => {
        socket.emit('drawRequest', { game_id: gameId })
        setVisiblePopup(null)
        toggleSidebar()
      },
      resign: () => {
        socket.emit('resign', {
          game_id: gameId,
          isGameOver: true,
          isGameDraw: false,
          winner: opponent,
          loser: user,
        })
        gameDispatch(setGameOver(true))
        gameDispatch(setLoser(true))
        toggleSidebar()
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
      ((board as any)._moveNumber === 1 && (board as any)._turn === 'b' && isMoved && !isWhite) ||
      ((board as any)._moveNumber === 1 && (board as any)._turn === 'w' && !isMoved)
    )
  }

  const renderPopups = () => (
    <>
      {['resign', 'draw', 'abort'].map((action, index) => {
        return (
          <ReactDialog
            onHide={() => setVisiblePopup(null)}
            onCancel={() => togglePopup(null)}
            onOk={() => handlePopupAction(action)}
            open={visiblePopup === action}
            content={`Do you want to ${action} the game?`}
            title={`Game ${action}`}
            key={index}
          />
        )
      })}

      <ReactDialog
        open={opponentAction ? true : false}
        onHide={() => setOpponentAction(null)}
        onCancel={() => setOpponentAction(null)}
        onOk={() => setOpponentAction(null)}
        content={opponentAction}
        title="Opponent Action"
      />

      <ReactDialog
        onHide={() => setDrawRequest(false)}
        onCancel={() => setDrawRequest(false)}
        onOk={handleConfirmDraw}
        open={drawRequest}
        content="Your opponent requested a draw. Do you accept?"
        title={'Draw Request'}
      />

      <ReactDialog
        open={notificationPopup}
        onHide={() => setNotificationPopup((prev) => !prev)}
        onCancel={() => setOpponentAction(null)}
        onOk={() => setOpponentAction(null)}
        content={'Can not abort the game because you already make your move'}
        title=""
        buttons={<></>}
      />
    </>
  )

  return (
    <>
      {renderPopups()}
      <Actions opened={isSidebarVisible && !visiblePopup} onBackdropClick={() => toggleSidebar()}>
        <ActionsGroup>
          {!isBot && <ActionsButton onClick={() => togglePopup('draw')}>Draw</ActionsButton>}
          {(board as any)._moveNumber < 2 && (
            <ActionsButton onClick={handleAbort}>Abort</ActionsButton>
          )}
          <ActionsButton onClick={() => togglePopup('resign')}>Resign</ActionsButton>
          {/* <ActionsButton onClick={() => toggleSidebar()}>Share Game</ActionsButton>
          <ActionsButton onClick={() => toggleSidebar()}>Setting</ActionsButton> */}
          <ActionsButton onClick={() => toggleSidebar()}>Cancel</ActionsButton>
        </ActionsGroup>
      </Actions>
    </>
  )
}

export default GameSidebar
