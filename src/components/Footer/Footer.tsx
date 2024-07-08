import { Block, BlockFooter } from 'konsta/react'

const Footer: React.FC = () => {
  const renderFooterItem = (label: string, iconSrc: string, isActive: boolean) => {
    return (
      <div className="flex flex-col justify-center items-center">
        <img className="w-[30px] h-[30px]" src={iconSrc} />
        <div
          className={`${
            isActive
              ? 'bg-[linear-gradient(90deg,_#67E4FF_0.07%,_#009ED0_98.38%)] text-transparent'
              : 'text-[#616161]'
          } text-center text-[12px] not-italic font-normal leading-[16px] bg-clip-text`}
        >
          {label}
        </div>
      </div>
    )
  }
  return (
    <BlockFooter className="justify-between items-center W rounded-tl-[20px]  bg-[#1E1C1A]">
      <div className="flex w-full justify-between">
        {renderFooterItem('Home', '/home-icon.svg', true)}
        {renderFooterItem('Mini Game', '/game-icon.svg', false)}
        {renderFooterItem('Wallet', 'wallet-icon.svg', false)}
      </div>
    </BlockFooter>
  )
}

export default Footer
