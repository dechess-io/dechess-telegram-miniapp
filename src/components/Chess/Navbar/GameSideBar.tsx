import { useState } from 'react'
import DrawPopup from '../Popup/DrawPopup'
import ResignPopup from '../Popup/ResignPopup'
import AbortPopUp from '../Popup/AbortPopUp'
import { Chess } from 'chess.js'

interface GameSidebarProps {
  isSidebarVisible: boolean
  toggleSidebar: any
  game: Chess | any
  socket: any
}

const GameSidebar: React.FC<GameSidebarProps> = ({
  isSidebarVisible,
  toggleSidebar,
  socket,
  game,
}) => {
  const [showDrawPopup, setShowDrawPopup] = useState(false)
  const [showAbortPopup, setShowAbortPopup] = useState(false)
  const [showResignPopup, setShowResignPopup] = useState(false)

  return (
    <div
      className={`fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-black bg-opacity-75 text-white p-4 transition-all duration-300 z-50 rounded-lg ${
        isSidebarVisible ? 'block' : 'hidden'
      }`}
    >
      <ul className="mt-4 flex flex-col items-center">
        <li className="py-2 cursor-pointer pb-4" onClick={() => setShowDrawPopup((prev) => !prev)}>
          Draw
        </li>
        <li
          className="py-2 cursor-pointer  pb-4 "
          onClick={() => setShowAbortPopup((prev) => !prev)}
        >
          Abort
        </li>
        <li
          className="py-2 cursor-pointer pb-4 "
          onClick={() => setShowResignPopup((prev) => !prev)}
        >
          Resign
        </li>
        <li className="py-2 cursor-pointer  pb-4">Share Game</li>
        <li className="py-2 cursor-pointer  pb-4">Settings</li>
        <li className="py-2 cursor-pointer  pb-4" onClick={toggleSidebar}>
          Cancel
        </li>
      </ul>
      {showDrawPopup && (
        <DrawPopup
          showPopup={showDrawPopup}
          setShowPopup={() => setShowDrawPopup((prev) => !prev)}
        />
      )}
      {showAbortPopup && (
        <AbortPopUp
          showPopup={showDrawPopup}
          setShowPopup={() => setShowAbortPopup((prev) => !prev)}
        />
      )}
      {showResignPopup && (
        <ResignPopup
          showPopup={showDrawPopup}
          setShowPopup={() => setShowResignPopup((prev) => !prev)}
          game={game}
          socket={socket}
        />
      )}
    </div>
  )

  return <></>
}

export default GameSidebar
