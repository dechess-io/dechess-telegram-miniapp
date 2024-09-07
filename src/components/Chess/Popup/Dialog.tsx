import React, { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode // ReactNode allows any valid JSX or string content
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  const navitate = useNavigate()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 mx-auto my-auto"
      style={{
        backgroundImage: 'url(./popup.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '90vw',
        height: '60vh',
        maxWidth: '400px',
        maxHeight: '350px',
        minWidth: '250px',
        minHeight: '250px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="absolute top-12 right-10 text-gray-400 hover:text-gray-600"
        onClick={onClose}
      >
        ✕
      </button>
      <div className="flex flex-col space-y-2">
        <div
          className="mx-auto my-auto"
          style={{
            backgroundImage: 'url(./popup-title.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '20vw',
            maxWidth: '180px',
            minWidth: '90px',
            minHeight: '30px',
          }}
        ></div>
        <button
          style={{
            backgroundImage: 'url(./pvp.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '40vw',
            maxWidth: '320px',
            minWidth: '190px',
            minHeight: '66px',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')} // Shrinks when clicked
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')} // Restores size after click
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} // Enlarges on hover
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onClick={() => navitate('/mode')}
        ></button>
        <button
          style={{
            backgroundImage: 'url(./pve.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '40vw',
            maxWidth: '320px',
            minWidth: '190px',
            minHeight: '66px',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')} // Shrinks when clicked
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')} // Restores size after click
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} // Enlarges on hover
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onClick={() => navitate('/bot')}
        ></button>
      </div>
    </div>
  )
}

export default Dialog
