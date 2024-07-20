import React from 'react';
import Popup from '../../Popup/Popup';

interface GamePopupProps {
  title: string;
  message: string;
  showPopup: boolean;
  setShowPopup: any;
}

const NotificationPopup: React.FC<GamePopupProps> = ({
  title,
  message,
  showPopup,
  setShowPopup,
}) => {
  if (!showPopup) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50`}>
      <Popup className="relative bg-blue-100 w-[90%] max-w-md h-[20%] p-4 border-b-4 border-grey-200">
        <button className="absolute top-0 right-3 text-white" onClick={() => setShowPopup(false)}>
          X
        </button>
        <h1 className="text-center font-bold text-[20px] font-ibm">
          <div>
            <h2 className="text-white font-ibm pb-5">{title}</h2>
            <span className="text-white font-ibm">{message}</span>
          </div>
        </h1>
      </Popup>
    </div>
  );
};

export default NotificationPopup;
