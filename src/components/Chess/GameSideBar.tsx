interface GameSidebarProps {
  isSidebarVisible: boolean
  handleDraw: any
  handleAbort: any
  handleShareGame: any
  handleSettings: any
  handleCancel: any
}

const GameSidebar: React.FC<GameSidebarProps> = ({
  isSidebarVisible,
  handleDraw,
  handleAbort,
  handleShareGame,
  handleSettings,
  handleCancel,
}) => {
  if (isSidebarVisible) {
    return (
      <div
        className={`fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-black bg-opacity-75 text-white p-4 transition-all duration-300 z-50 rounded-lg ${
          isSidebarVisible ? 'block' : 'hidden'
        }`}
      >
        {/* Sidebar content goes here */}
        <ul className="mt-4 flex flex-col items-center">
          <li className="py-2 cursor-pointer pb-4" onClick={handleDraw}>
            Draw
          </li>
          <li className="py-2 cursor-pointer  pb-4" onClick={handleDraw}>
            Abort
          </li>
          <li className="py-2 cursor-pointer pb-4" onClick={handleDraw}>
            Resign
          </li>
          <li className="py-2 cursor-pointer  pb-4" onClick={handleCancel}>
            Share Game
          </li>
          <li className="py-2 cursor-pointer  pb-4" onClick={handleCancel}>
            Settings
          </li>
          <li className="py-2 cursor-pointer  pb-4" onClick={handleCancel}>
            Cancel
          </li>
        </ul>
      </div>
    )
  }

  return <></>
}

export default GameSidebar
