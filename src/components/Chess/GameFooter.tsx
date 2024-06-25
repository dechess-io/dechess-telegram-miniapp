const GameFooter: React.FC = () => {
  const renderFooterItem = (label: string, iconSrc: string, isActive: boolean) => {
    return (
      <div className="flex flex-col justify-center items-center w-[60px]">
        <img className="w-[30px] h-[30px]" src={iconSrc} />
      </div>
    )
  }
  return (
    <div className="fixed bottom-0 left-2/4 -translate-x-1/2 mx-auto w-full h-[80px] px-[40px] py-[15px] justify-between items-center flex-shrink-0 rounded-tl-[20px] rounded-br-none rounded-tr-[20px] rounded-bl-none bg-[#1E1C1A]">
      <div className="flex w-full justify-between">
        {renderFooterItem('Home', '/Hamburger-menu.svg', true)}
        {renderFooterItem('Mini Game', '/Message.svg', false)}
        {renderFooterItem('Prev', '/arrow-left-1.svg', false)}
        {renderFooterItem('Next', '/arrow-right-1.svg', false)}
      </div>
    </div>
  )
}

export default GameFooter
