import React, { PropsWithChildren } from 'react'

import bgButtonGray from '/images/bg-btn-gray.png'
import bgButtonWhite from '/images/bg-btn-white.png'

import Icons from '../Icons'
import cn from '../../services/cn'

const ButtonV2: React.FC<
  PropsWithChildren<{
    onClick?: () => void
    className?: string
    disabled?: boolean
    hide?: boolean
    type?: 'button' | 'submit' | 'reset'
    size?: 'medium' | 'large'
    loading?: boolean
    kind?: 'primary' | 'secondary'
  }>
> = ({ children, onClick, className, disabled, hide, type, loading, kind = 'primary' }) => {
  if (hide) {
    return null
  }
  return (
    <button
      type={type || 'button'}
      className={cn(
        'font-planet relative flex items-center justify-center gap-2 group hover:scale-105 transition-all duration-300',
        className,
        {
          'cursor-default pointer-events-none opacity-80 select-none': disabled,
          'cursor-pointer': !disabled,
        }
      )}
      onClick={onClick}
      disabled={loading || disabled}
    >
      <img
        src={kind === 'primary' ? bgButtonWhite : bgButtonGray}
        width={300}
        height={40}
        alt="dechess-btn-background"
      />
      <span
        className={cn('absolute inset-0 z-[1] flex justify-center items-center text-xl font-medium', {
          'text-black-1a': kind === 'primary',
          'text-white': kind === 'secondary',
        })}
      >
        {loading ? <Icons.spinner className="animate-spin -mt-1 mr-1" size={20} /> : null} {children}
      </span>
    </button>
  )
}

export default ButtonV2
