import { Icon, Tabbar, TabbarLink } from 'konsta/react'

const Footer: React.FC = () => {
  return (
    <Tabbar
      labels
      icons
      className="left-0 bottom-0 fixed"
      style={{ backgroundColor: 'transparent' }}
    >
      <TabbarLink
        active
        icon={
          <Icon
            ios={<img className="w-[40px] h-[40px]" src="/Pawn.svg" />}
            material={<img className="w-[40px] h-[40px]" src="/Pawn.svg" />}
          />
        }
        label="Home"
      />
      <TabbarLink
        icon={
          <Icon
            ios={<img className="w-[40px] h-[40px]" src="/Money.png" />}
            material={<img className="w-[40px] h-[40px]" src="/Money.png" />}
          />
        }
        label="Mini Game"
      />
      <TabbarLink
        icon={
          <Icon
            ios={<img className="w-[40px] h-[40px]" src="/Wallet.svg" />}
            material={<img className="w-[40px] h-[40px]" src="/Wallet.svg" />}
          />
        }
        label="Wallet"
      />
    </Tabbar>
  )
}

export default Footer
