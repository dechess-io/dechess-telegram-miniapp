import { Block } from 'konsta/react'
import ButtonV2 from '../Button/ButtonV2'
import { ConnectionSettings } from '../Connect/ConnectionSettings'

const Login = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center text-white">
      <Block
        style={{
          paddingRight: '0',
          paddingLeft: '0',
          minWidth: '440px',
          height: 'calc(100vh - 162px)',
          backgroundImage: "url('../images/bg-splash-screen.png')",
        }}
      >
        <div className="flex items-center justify-center h-full">
          <div>
            <img src="/logo.png" alt="dechess-logo" />
          </div>
        </div>
        <div className="px-10 grid gap-2">
          <ButtonV2 kind="secondary" className="w-full h-[57px]" disabled>
            Coming soon
          </ButtonV2>
          <ButtonV2 className="w-full h-[57px]">
            Connect Wallet
            <div className="absolute inset-0">
              <ConnectionSettings />
            </div>
          </ButtonV2>
        </div>
      </Block>
    </div>
  )
}

export default Login
