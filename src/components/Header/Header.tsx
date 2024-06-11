import { Shop } from '@styled-icons/bootstrap'
import { Newspaper } from '@styled-icons/fa-solid'
import { LearningApp } from '@styled-icons/fluentui-system-regular'
import { AdminPanelSettings } from '@styled-icons/material-outlined'
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
      <nav className="fixed top-0 z-50 w-full bg-black">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <button
                onClick={() => onOpenMobileMenu()}
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>
              <div className="flex items-center">
                <div
                  onClick={() => {
                    navigate('/')
                  }}
                  className="cursor-pointer flex ml-2 md:mr-7"
                >
                  <img src="/DeChess.png" className="h-[32px] w-[32px]" alt="Transca vault Logo" />
                </div>
                {/* <div className="">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 !rounded-xl font-bold text-white leading-[21px]" onClick={() => onHanleOpenPopUpGetRWAsNFT()}>
                    Get RWAs NFT
                  </Button>
                </div> */}
              </div>
            </div>
            {/* Connect wallet */}
            <div className="hidden md:flex md:justify-end lg:flex lg:flex-1 lg:justify-end">
              {/* <ConnectButton /> */}
              <ConnectionSettings />
            </div>
          </div>
        </div>
      </nav>
      {/* <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          isOpenMobileMenu ? '' : '-translate-x-full'
        } bg-white border-r border-gray-200 md:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 flex flex-col justify-between overflow-y-auto bg-white">
          <ul className="space-y-2 font-medium">
            <li>
              <div
                onClick={() => {
                  navigate('/')
                }}
                className={`cursor-pointer flex items-center p-2 text-gray-900 rounded-lg group ${
                  data.pathname === '/' && 'bg-gray-100'
                }`}
              >
                <svg
                  className="w-[24px] h-[24px] text-gray-500 transition duration-75"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ml-3">Lobbies</span>
              </div>
            </li>
            <li>
              <div
                onClick={() => {
                  navigate('/tournament')
                }}
                className={`cursor-pointer flex items-center p-2 text-gray-900 rounded-lg group ${
                  data.pathname === '/tournament' && 'bg-gray-100'
                }`}
              >
                <svg
                  className="w-[24px] h-[24px] text-gray-500 transition duration-75"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M22,3a1,1,0,0,0,0-2H20a1,1,0,0,0-1,1V4H17a1,1,0,0,0-1,1v6H14.816a2.982,2.982,0,0,0-5.632,0H8V5A1,1,0,0,0,7,4H5V2A1,1,0,0,0,4,1H2A1,1,0,0,0,2,3H3V7H2A1,1,0,0,0,2,9H4A1,1,0,0,0,5,8V6H6V18H5V16a1,1,0,0,0-1-1H2a1,1,0,0,0,0,2H3v4H2a1,1,0,0,0,0,2H4a1,1,0,0,0,1-1V20H7a1,1,0,0,0,1-1V13H9.184a2.982,2.982,0,0,0,5.632,0H16v6a1,1,0,0,0,1,1h2v2a1,1,0,0,0,1,1h2a1,1,0,0,0,0-2H21V17h1a1,1,0,0,0,0-2H20a1,1,0,0,0-1,1v2H18V6h1V8a1,1,0,0,0,1,1h2a1,1,0,0,0,0-2H21V3ZM12,13a1,1,0,1,1,1-1A1,1,0,0,1,12,13Z" />
                </svg>
                <span className="ml-3">Tournament</span>
              </div>
            </li>
            <li>
              <div
                onClick={() => {}}
                className={`cursor-pointer flex items-center p-2 text-gray-900 rounded-lg group ${
                  data.pathname === '/x' && 'bg-gray-100'
                }`}
              >
                <Shop size={24} />
                <span className="ml-3">Chess market</span>
              </div>
            </li>
            <li>
              <div
                onClick={() => {}}
                className={`cursor-pointer flex items-center p-2 text-gray-900 rounded-lg group ${
                  data.pathname === '/x' && 'bg-gray-100'
                }`}
              >
                <LearningApp size={24} />
                <span className="ml-3">Learn</span>
              </div>
            </li>
            <li>
              <div
                onClick={() => {}}
                className={`cursor-pointer flex items-center p-2 text-gray-900 rounded-lg group ${
                  data.pathname === '/x' && 'bg-gray-100'
                }`}
              >
                <svg
                  className="w-[24px] h-[24px] text-gray-500 transition duration-75"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ml-3">Achievements</span>
              </div>
            </li>
            <li>
              <div
                onClick={() => {}}
                className={`cursor-pointer flex items-center p-2 text-gray-900 rounded-lg group ${
                  data.pathname === '/x' && 'bg-gray-100'
                }`}
              >
                <Newspaper size={24} />
                <span className="ml-3">News</span>
              </div>
            </li>
          </ul>

          <div className="mx-auto flex flex-col space-y-4 w-full ">
            <div
              onClick={() => {
                navigate("/admin");
              }}
              className="cursor-pointer text-white font-bold flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%"
            >
              <AdminPanelSettings size={32} />
              <span className="flex-1 ml-3 whitespace-nowrap">Admin</span>
              <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full"></span>
            </div>
            <div
              onClick={() => {
                openInNewTab("https://drive.google.com/drive/u/1/folders/1JaFIvgmKbh0yX6prfmSw2WmkcSt4Udbe");
              }}
              className="cursor-pointer flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
            >
              <svg
                className="flex-shrink-0 w-[24px] h-[24px] text-gray-500 transition duration-75"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 18"
              >
                <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
              </svg>
              <span className="flex-1 ml-3 whitespace-nowrap">Docs</span>
              <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full"></span>
            </div>
            <div
              onClick={() => {
                openInNewTab("https://drive.google.com/drive/u/1/folders/1JaFIvgmKbh0yX6prfmSw2WmkcSt4Udbe");
              }}
              className="cursor-pointer flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
            >
              <svg
                className="flex-shrink-0 w-[24px] h-[24px] text-gray-500 transition duration-75"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 18"
              >
                <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
              </svg>
              <span className="flex-1 ml-3 whitespace-nowrap">Whitepaper</span>
              <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full"></span>
            </div>
            <div className="mx-auto">
              <ConnectionSettings />
            </div>
          </div>
        </div>
      </aside> */}
      {/* <div
        ref={menuBackgroundService}
        onClick={() => setIsOpenMobileMenu(false)}
        className={`${isOpenMobileMenu ? 'absolute' : 'hidden'} inset-0 popup-background`}
      ></div> */}
    </>
  )
}

export default Header
