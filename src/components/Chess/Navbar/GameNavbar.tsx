import React, { useState, useEffect, useMemo } from 'react'
import GameSidebar from './GameSideBar'
import GameChat, { Message } from './GameChat'
import { useTonWallet } from '@tonconnect/ui-react'
import { Chess } from 'chess.js'
import { Block, Icon, Tabbar, TabbarLink } from 'konsta/react'
import { useAppDispatch } from '../../../redux/store'
import { setNextMove, setPreviousMove } from '../../../redux/game/action'
import { socket } from '../../../services/socket'

interface GameNavbarProps {
  user: string
  opponent: string
  isMoved: boolean
  isWhite: boolean
  isBot: boolean
}

const GameNavbarOriginal: React.FC<GameNavbarProps> = ({
  user,
  opponent,
  isMoved,
  isWhite,
  isBot,
}) => {
  const wallet = useTonWallet()

  const gameDispatch = useAppDispatch()

  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isChatVisible, setIsChatVisible] = useState(false)

  const badge = useMemo(
    () =>
      messages?.length > 0
        ? messages.filter((z) => !z.viewedAt && z.sender !== wallet?.account?.address).length ||
          undefined
        : undefined,
    [messages, wallet?.account?.address]
  )

  useEffect(() => {
    const onMessage = (data: Message) => {
      setMessages((prev) => [
        ...prev,
        isChatVisible ? { ...data, viewedAt: new Date().toISOString() } : data,
      ])
    }

    socket.on('message', onMessage)
    return () => {
      socket.off('message', onMessage)
    }
  }, [isChatVisible])

  const toggleChat = () => setIsChatVisible((prev) => !prev)
  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev)

  return (
    <>
      <Block component="div" className="h-[10px] fixed">
        <Tabbar icons className="left-0 bottom-0 fixed">
          <TabbarLink
            active
            onClick={toggleSidebar}
            icon={
              <Icon
                ios={<img className="w-[20px] h-[20px]" src="/Hamburger-menu.svg" />}
                material={<img className="w-[20px] h-[20px]" src="/Hamburger-menu.svg" />}
              />
            }
          />
          <TabbarLink
            onClick={toggleChat}
            icon={
              <Icon
                badge={badge}
                badgeColors={{ bg: 'bg-blue-gradient' }}
                ios={<img className="w-[20px] h-[20px]" src="/Message.svg" />}
                material={<img className="w-[20px] h-[20px]" src="/Message.svg" />}
              />
            }
          />
          <TabbarLink
            onClick={() => gameDispatch(setPreviousMove())}
            icon={
              <Icon
                ios={<img className="w-[20px] h-[20px]" src="/arrow-left-1.svg" />}
                material={<img className="w-[20px] h-[20px]" src="/arrow-left-1.svg" />}
              />
            }
          />
          <TabbarLink
            onClick={() => gameDispatch(setNextMove())}
            icon={
              <Icon
                ios={<img className="w-[20px] h-[20px]" src="/arrow-right-1.svg" />}
                material={<img className="w-[20px] h-[20px]" src="/arrow-right-1.svg" />}
              />
            }
          />
        </Tabbar>
      </Block>

      <GameSidebar
        isMoved={isMoved}
        isSidebarVisible={isSidebarVisible}
        toggleSidebar={toggleSidebar}
        socket={socket}
        user={user}
        opponent={opponent}
        isWhite={isWhite}
        isBot={isBot}
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

const GameNavbar = React.memo(GameNavbarOriginal)
export default GameNavbar
