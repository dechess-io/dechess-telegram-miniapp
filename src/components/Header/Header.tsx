import { Shop } from '@styled-icons/bootstrap'
import { Newspaper } from '@styled-icons/fa-solid'
import { LearningApp } from '@styled-icons/fluentui-system-regular'
import { AdminPanelSettings } from '@styled-icons/material-outlined'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ConnectionSettings } from '../Connect/ConnectionSettings'
import img from '../../../public/Logo.png'

const Header: React.FC<{}> = () => {
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false)
  const menuBackgroundService = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const data = useLocation()

  const onOpenMobileMenu = () => {
    setIsOpenMobileMenu(!isOpenMobileMenu)
  }

  useEffect(() => {
    function handleWindowResize() {
      if (window.innerWidth >= 768) {
        setIsOpenMobileMenu(false)
      }
    }
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  const openInNewTab = (url: string) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-gray-1000">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            {/* Empty div to balance the space */}
            <div className="flex-1"></div>
            <div
              className="flex justify-center flex-1"
              onClick={() => {
                navigate('/')
              }}
            >
              <img src="/Logo.svg" alt="Transca Vault Logo" />
            </div>
            <div className="flex-1 md:flex md:justify-end lg:flex lg:justify-end">
              <ConnectionSettings />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header
