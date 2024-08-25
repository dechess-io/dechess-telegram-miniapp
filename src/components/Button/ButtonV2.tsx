import React, { PropsWithChildren } from 'react'

import bgButton from '@/public/images/bg-button.svg'

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
  }>
> = ({ children, onClick, className, disabled, hide, type, loading, size = 'medium' }) => {
  if (hide) {
    return null
  }
  return (
    <button
      type={type || 'button'}
      className={cn(
        'cursor-pointer rounded font-planet relative flex items-center justify-center gap-2 group',
        className,
        {
          'w-[12rem] h-[3rem] lg:w-[14.813rem] lg:h-[4.625rem] text-normal': size === 'medium',
          'w-[20.625rem] h-[5rem] text-xl': size === 'large',
        },
        {
          'bg-blue-300 active:bg-blue-300': disabled,
        }
      )}
      onClick={onClick}
      disabled={loading || disabled}
    >
      <img
        src={bgButton}
        width={237}
        height={74}
        className="w-[150px] lg:w-full lg:h-full"
        alt="dechess-btn-background"
      />
      <span className="absolute inset-0 z-[1] text-black-1a flex justify-center items-center text-base lg:text-[24px]">
        {loading ? <Icons.spinner className="animate-spin" size={20} /> : null} {children}
      </span>
    </button>
  )
}

export default ButtonV2
