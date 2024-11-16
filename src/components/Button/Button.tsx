
import React, { PropsWithChildren } from 'react'
import cn from '../../services/cn'
import { LoaderCircle } from 'lucide-react';

const Button: React.FC<
  PropsWithChildren<{
    onClick?: () => void
    className?: string
    disabled?: boolean
    hide?: boolean
    type?: 'button' | 'submit' | 'reset'
    kind?: 'normal' | 'success' | 'confirm'
    loading?: boolean
    size?: 'normal' | 'small'
  }>
> = ({
  children,
  onClick,
  className,
  disabled,
  hide,
  type,
  loading,
  kind = 'normal',
  size = 'normal',
}) => {
  if (hide) {
    return null
  }
  return (
    <button
      type={type || 'button'}
      className={cn(
        {
          'py-2 px-5': size === 'normal',
          'py-1 px-2': size === 'small',
        },
        'cursor-pointer rounded',
        'flex items-center justify-center gap-2',
        className,
        {
          'bg-gray-200 hover:bg-gray-300 active:bg-gray-400': kind === 'normal',
          'bg-gray-300': disabled && kind === 'normal',

          'bg-blue-400 hover:bg-blue-300 active:bg-blue-500 text-white': kind === 'success',
          'bg-blue-300 active:bg-blue-300': disabled && kind === 'success',

          'bg-red-500 hover:bg-red-300 active:bg-red-600 text-white': kind === 'confirm',
          'bg-red-400': disabled && kind === 'confirm',

          'text-gray-400 bg-gray-200 hover:bg-gray-200 active:bg-gray-200':
            loading && kind === 'normal',

          'text-white bg-blue-200 hover:bg-blue-200 active:bg-blue-200':
            loading && kind === 'success',

          'text-gray-400 bg-red-200 hover:bg-red-200 active:bg-red-200':
            loading && kind === 'confirm',
        }
      )}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading ? <LoaderCircle className="animate-spin" size={20} /> : null} {children}
    </button>
  )
}

export default Button
