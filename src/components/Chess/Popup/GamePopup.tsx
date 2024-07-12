import React from 'react'
import Popup from '../../Popup/Popup'

interface GamePopupProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  showPopup: boolean
  setShowPopup: any
}

const GamePopup: React.FC<GamePopupProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  showPopup,
  setShowPopup,
}) => {
  if (!showPopup) return null

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50`}>
      <Popup className="relative bg-blue-100 w-[90%] max-w-md h-[200px] p-4 border-b-4 border-grey-200">
        <button className="absolute top-0 right-3 text-white" onClick={() => setShowPopup(false)}>
          X
        </button>
        <h1 className="mb-4 text-center font-bold text-[20px] font-ibm">
          <div>
            <h2 className="text-white font-ibm pb-5">{title}</h2>
            <span className="text-white font-ibm pb-5">{message}</span>
            <div className="flex flex-row pt-5">
              <div className="flex-auto p-1">
                <button
                  className={`bg-gray-900 font-bold rounded-lg h-[45px] w-127 border-b-4 border-grey-300 hover:bg-blue-gradient hover:border-blue-200`}
                  onClick={onConfirm}
                >
                  <span className="text-white text-sm">Yes</span>
                </button>
              </div>
              <div className="flex-auto p-1">
                <button
                  className={`bg-gray-900 font-bold rounded-lg h-[45px] w-127 border-b-4 border-grey-300 hover:bg-blue-gradient hover:border-blue-200`}
                  onClick={onCancel}
                >
                  <span className="text-white text-sm">No</span>
                </button>
              </div>
            </div>
          </div>
        </h1>
      </Popup>
    </div>
  )
}

export default GamePopup
