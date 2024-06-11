import React, { forwardRef } from 'react'
import cn from '../../services/cn'

export interface FormInputProps {
  name: string
  placeholder: string
  type?: string
  hasError?: boolean
  hasWarning?: boolean
  hasHelp?: boolean
  autoComplete?: string
  defaultValue?: string
  className?: string
  required?: boolean
  isError?: boolean
  readOnly?: boolean
  value?: string
  step?: number
  ourOnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Input: React.ForwardRefExoticComponent<
  FormInputProps &
    React.InputHTMLAttributes<HTMLInputElement> &
    React.RefAttributes<HTMLInputElement>
> = forwardRef<HTMLInputElement, FormInputProps & React.InputHTMLAttributes<HTMLInputElement>>(
  (
    {
      step = '0.001',
      placeholder,
      hasError = false,
      hasWarning = false,
      hasHelp = false,
      type = 'text',
      autoComplete,
      defaultValue = '',
      className = '',
      required,
      isError,
      readOnly = false,
      onChange,
      ourOnChange,
      ...props
    },
    ref
  ) => {
    return (
      <input
        className={cn(
          `transca--input block w-full px-4 py-3`,
          `color-light`,
          `color-light-input`,
          `color-light-placeholder`,
          `color-light-border border`,
          `focus:outline-none`,
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none',
          {
            '': !isError,
            [`color-light-input-error`]: isError,
          },
          {
            'bg-gray-100': readOnly,
          },
          className
        )}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete || undefined}
        defaultValue={defaultValue}
        readOnly={readOnly}
        required={required}
        ref={ref}
        step={step}
        onChange={(e) => {
          if (onChange) onChange(e)
          if (ourOnChange) ourOnChange(e)
        }}
        {...props}
        lang="en"
      />
    )
  }
)

export default Input
