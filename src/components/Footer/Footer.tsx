import { Block, BlockFooter, Icon, List, Tabbar, TabbarLink } from 'konsta/react'

const Footer: React.FC = () => {
  return (
    <Tabbar labels icons className="left-0 bottom-0 fixed">
      <TabbarLink
        active
        icon={
          <Icon
            ios={<img className="w-[20px] h-[20px]" src="/home-icon.svg" />}
            material={<img className="w-[20px] h-[20px]" src="/home-icon.svg" />}
          />
        }
        label="Home"
      />
      <TabbarLink
        icon={
          <Icon
            ios={<img className="w-[20px] h-[20px]" src="/game-icon.svg" />}
            material={<img className="w-[20px] h-[20px]" src="/game-icon.svg" />}
          />
        }
        label="Mini Game"
      />
      <TabbarLink
        icon={
          <Icon
            ios={<img className="w-[20px] h-[20px]" src="/wallet-icon.svg" />}
            material={<img className="w-[20px] h-[20px]" src="/wallet-icon.svg" />}
          />
        }
        label="Wallet"
      />
    </Tabbar>
  )
}

export default Footer
