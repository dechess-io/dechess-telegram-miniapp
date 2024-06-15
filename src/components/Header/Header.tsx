import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ConnectionSettings } from '../Connect/ConnectionSettings'

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
      <nav className="fixed top-0 z-50 w-full mx-auto bg-gray-1000">
        <div className="mx-auto max-w-[398px] px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            {data.pathname === '/mode' ? (
              <button onClick={() => navigate('/')}>
                <img
                  className="max-w-[45px] max-h-[45px] border-none rounded-xl justify-start flex-1"
                  src="/arrow-right.svg"
                  alt="Transca Vault Logo"
                />
              </button>
            ) : (
              <button onClick={() => navigate('/')}>
                <img
                  className="max-w-[45px] max-h-[45px] border-none rounded-xl opacity-0 pointer-events-none"
                  src="/arrow-right.svg"
                  alt="Arrow Icon"
                />
              </button>
            )}
            <div
              className="flex-1 md:flex md:justify-end lg:flex lg:justify-end"
              onClick={() => {
                navigate('/')
              }}
            >
              <img
                className="max-w-[45px] max-h-[45px] border-none rounded-xl"
                src="/Logo.png"
                alt="Transca Vault Logo"
              />
            </div>
            <div className="flex-1 md:flex md:justify-end lg:flex lg:justify-end pr-3">
              <ConnectionSettings />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header
