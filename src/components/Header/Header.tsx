import { useLocation, useNavigate } from 'react-router-dom'
import { ConnectionSettings } from '../Connect/ConnectionSettings'
import { Navbar } from 'konsta/react'

const Header: React.FC<object> = () => {
  const navigate = useNavigate()
  const data = useLocation()

  return (
    <>
      <Navbar
        className="fixed top-0 z-50 w-full mx-auto"
        left={
          data.pathname === '/mode' ? (
            <button onClick={() => navigate('/')}>
              <img
                className="max-w-[45px] max-h-[45px] border-none rounded-xl justify-start flex-1"
                src="/arrow-right.svg"
                alt="Transca Vault Logo"
              />
            </button>
          ) : null
        }
        right={
          <div className="flex-1 flex justify-end">
            <ConnectionSettings />
          </div>
        }
        centerTitle={true}
        title={
          <div className="flex items-center justify-between">
            <div
              className="flex-1 flex justify-end"
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
          </div>
        }
      ></Navbar>
    </>
  )
}

export default Header
