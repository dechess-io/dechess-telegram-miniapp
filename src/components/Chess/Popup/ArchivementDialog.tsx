import React, { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
}

const ArchivementDialog: React.FC<DialogProps> = ({ isOpen, onClose }) => {
  const navitate = useNavigate()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 mx-auto my-auto"
      style={{
        backgroundImage: 'url(./../checkmate.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '50vw',
        height: '50vh',
        maxWidth: '200px',
        maxHeight: '100px',
        minWidth: '100px',
        minHeight: '50px',
      }}
      onClick={onClose}
    ></div>
  )
}

export default ArchivementDialog
