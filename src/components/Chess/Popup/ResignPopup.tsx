import { useNavigate } from 'react-router-dom'
import Popup from '../../Popup/Popup'
import { useEffect, useState } from 'react'

type GameResignPopUpProps = {
  game: any
  setShowPopup: any
  showPopup: boolean
  socket: any
}

const ResignPopup: React.FC<GameResignPopUpProps> = ({ game, showPopup, setShowPopup, socket }) => {
  const emitGameOver = () => {
    socket.emit('endGame', {
      game_id: location.pathname.split('/')[2],
      isGameOver: true,
      isGameDraw: false,
    })
  }

  return (
    <div>
      <div className={`absolute top-1/4 left-1/4`}>
        <Popup className="bg-grey-100 w-[364px] h-[200px]">
          <button className="absolute top-0 right-3 text-white" onClick={() => setShowPopup(false)}>
            X
          </button>
          <h1 className="mb-4 text-center font-bold text-[20px] font-ibm">
            <div>
              <h2 className="text-white font-ibm pb-5">Game Resign</h2>
              <span className="text-white font-ibm">Do you want to resign the game ?</span>
              <div className="flex flex-row pt-2">
                <div className="flex-auto p-1">
                  <button
                    className={`bg-gray-900 font-bold  rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                    onClick={() => emitGameOver()}
                  >
                    <span className="text-white text-sm">Yes</span>
                  </button>
                </div>
                <div className="flex-auto p-1">
                  <button
                    className={`bg-gray-900 font-bold rounded-lg h-[45px] w-127 hover:bg-blue-gradient`}
                    onClick={() => setShowPopup(false)}
                  >
                    <span className="text-white text-sm">No</span>
                  </button>
                </div>
              </div>
            </div>
          </h1>
        </Popup>
      </div>
    </div>
  )
}

export default ResignPopup
