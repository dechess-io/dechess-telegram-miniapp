
const Footer: React.FC = () => {
  const renderFooterItem = (label: string, iconSrc: string, isActive: boolean) => {
    return (
      <div className="flex flex-col justify-center items-center w-[60px] gap-2">
        <img className="w-[30px] h-[30px]" src={iconSrc} />
        <div className={`${isActive ? "bg-[linear-gradient(90deg,_#67E4FF_0.07%,_#009ED0_98.38%)] text-transparent" : "text-[#616161]"} text-center text-[12px] not-italic font-normal leading-[16px] bg-clip-text`}>{label}</div>
      </div>
    )
  }
  return (
    <div
      className="fixed bottom-0 left-2/4 -translate-x-1/2 mx-auto w-[380px] h-[80px] px-[40px] py-[15px] justify-between items-center flex-shrink-0 rounded-tl-[20px] rounded-br-none rounded-tr-[20px] rounded-bl-none bg-[#1E1C1A]">
      <div className="flex w-full justify-between">
        {renderFooterItem("Home", "/home-icon.svg", true)}
        {renderFooterItem("Mini Game", "/game-icon.svg", false)}
        {renderFooterItem("Wallet", "wallet-icon.svg", false)}
      </div>
    </div>
  )
}

export default Footer