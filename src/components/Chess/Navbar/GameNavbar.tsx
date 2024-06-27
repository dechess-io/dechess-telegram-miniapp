import { useState, useEffect } from 'react'
import GameSidebar from './GameSideBar'
import GameChat, { Message } from './GameChat'
import { useTonWallet } from '@tonconnect/ui-react'
import { Chess } from 'chess.js'

interface GameNavbarProps {
  handlePreviousMove: any
  handleNextMove: any
  socket: any
  game: Chess | any
  toggleGameDraw: any
  toggleGameOver: any
  user: string
  opponent: string
}

const GameNavbar: React.FC<GameNavbarProps> = ({
  handleNextMove,
  handlePreviousMove,
  socket,
  game,
  toggleGameDraw,
  toggleGameOver,
  user,
  opponent,
}) => {
  const wallet = useTonWallet()

  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isChatVisible, setIsChatVisible] = useState(false)

  useEffect(() => {
    const onMessage = (data: Message) => {
      setMessages((prev) => [...prev, data])
    }

    socket.on('message', onMessage)
    return () => {
      socket.off('message', onMessage)
    }
  }, [])

  const toggleChat = () => setIsChatVisible((prev) => !prev)
  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev)

  const renderFooterItem = (label: string, iconSrc: string, isActive: boolean, onClick: any) => {
    return (
      <button className="flex flex-col justify-center items-center w-[30px]" onClick={onClick}>
        <img className="w-[30px] h-[30px]" src={iconSrc} />
      </button>
    )
  }

  return (
    <>
      <div className="fixed bottom-0 left-2/4 -translate-x-1/2 mx-auto w-full h-[40px] px-[40px] py-[5px] justify-between items-center flex-shrink-0 rounded-tl-[20px] rounded-br-none rounded-tr-[20px] rounded-bl-none bg-[#1E1C1A]">
        <div className="flex w-full justify-between">
          {renderFooterItem('Home', '/Hamburger-menu.svg', true, toggleSidebar)}
          {renderFooterItem('Mini Game', '/Message.svg', false, toggleChat)}
          {renderFooterItem('Prev', '/arrow-left-1.svg', false, handlePreviousMove)}
          {renderFooterItem('Next', '/arrow-right-1.svg', false, handleNextMove)}
        </div>
      </div>
      <GameSidebar
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
        game={game}
        socket={socket}
        toggleGameOver={toggleGameOver}
        toggleGameDraw={toggleGameDraw}
      />

      {isChatVisible && (
        <GameChat
          socket={socket}
          isChatVisible={isChatVisible}
          setIsChatVisible={toggleChat}
          messages={messages}
          setMessages={setMessages}
          userId={wallet?.account.address ? wallet?.account.address : ''}
        />
      )}
    </>
  )
}

export default GameNavbar
