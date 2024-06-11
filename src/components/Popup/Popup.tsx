import React, { PropsWithChildren } from 'react'
import cn from '../../services/cn'

const Popup: React.FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
  return (
    <div
      className={cn(
        `inline-block align-bottom  overflow-hidden`,
        'shadow-xl transform transition-all sm:my-8 sm:align-middle',
        'rounded-2xl',
        'w-[1200px] sm:max-w-lg',
        'px-6 py-4',
        'text-left',
        'z-50',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      {children}
    </div>
  )
}

export default Popup
