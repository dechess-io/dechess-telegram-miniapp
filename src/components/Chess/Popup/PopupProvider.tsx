// Copyright (c) Fewcha. All rights reserved.

import React, { createContext, PropsWithChildren, useContext, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const PopupContext = createContext<{
  addPopup: PopupType
  removePopup: (key: string) => void
  removeAll: () => void
}>({
  addPopup: () => '',
  removePopup: () => {},
  removeAll: () => {},
})

type PopupType = (props: {
  Component: React.FC<{}>
  callback?: (key: string) => void
  closeWhenClickOutside?: boolean
}) => string

export const usePopups = () => {
  const { addPopup, removePopup, removeAll } = useContext(PopupContext)
  return { addPopup, removePopup, removeAll }
}

const { Provider } = PopupContext

const PopupProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [popups, changePopups] = useState<
    { key: string; Component: React.FC; closeWhenClickOutside?: boolean }[]
  >([])
  const popupBackgroundService = useRef<HTMLDivElement | null>(null)

  const addPopup: PopupType = ({ Component, callback, closeWhenClickOutside }): string => {
    const key = uuidv4()
    changePopups([...popups, { key, Component, closeWhenClickOutside }])
    if (callback) callback(key)
    return key
  }

  const removePopup = (key: string) => {
    changePopups(popups.filter((popup) => popup.key !== key))
  }

  const removeAll = () => {
    changePopups([])
  }

  const Component = popups.length > 0 ? popups[popups.length - 1].Component : () => <></>

  return (
    <Provider value={{ addPopup, removePopup, removeAll }}>
      {children}
      {popups.length > 0 && (
        <div
          className="fixed z-40 inset-0 overflow-y-auto"
          // onClick={(e) => {
          //   if (e.target !== popupBackgroundService.current) {
          //     return
          //   }
          //   if (popups[popups.length - 1].closeWhenClickOutside === false) return
          //   removePopup(popups[popups.length - 1].key)
          // }}
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              {/* background */}
              <div ref={popupBackgroundService} className="absolute inset-0 popup-background"></div>
            </div>
            <span className="sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Component />
          </div>
        </div>
      )}
    </Provider>
  )
}

export default PopupProvider
