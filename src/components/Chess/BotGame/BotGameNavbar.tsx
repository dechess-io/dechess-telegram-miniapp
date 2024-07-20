import { useState, useEffect } from 'react';
import GameSidebar from './BotGameSidebar';
import GameChat, { Message } from '../Navbar/GameChat';
import { useTonWallet } from '@tonconnect/ui-react';
import { Chess } from 'chess.js';
import { Block, Icon, Tabbar, TabbarLink } from 'konsta/react';

interface GameNavbarProps {
  handlePreviousMove: any;
  handleNextMove: any;
  socket: any;
  game: Chess | any;
  toggleGameDraw: any;
  toggleGameOver: any;
  user: string;
  opponent: string;
  isMoved: boolean;
  isWhite: boolean;
  toggleIsLoser: any;
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
  isMoved,
  isWhite,
  toggleIsLoser,
}) => {
  const wallet = useTonWallet();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    const onMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('message', onMessage);
    return () => {
      socket.off('message', onMessage);
    };
  }, []);

  const toggleChat = () => setIsChatVisible((prev) => !prev);
  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);

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
                ios={<img className="w-[20px] h-[20px]" src="/Message.svg" />}
                material={<img className="w-[20px] h-[20px]" src="/Message.svg" />}
              />
            }
          />
          <TabbarLink
            onClick={handlePreviousMove}
            icon={
              <Icon
                ios={<img className="w-[20px] h-[20px]" src="/arrow-left-1.svg" />}
                material={<img className="w-[20px] h-[20px]" src="/arrow-left-1.svg" />}
              />
            }
          />
          <TabbarLink
            onClick={handleNextMove}
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
        game={game}
        socket={socket}
        toggleGameOver={toggleGameOver}
        toggleGameDraw={toggleGameDraw}
        user={user}
        opponent={opponent}
        isWhite={isWhite}
        toggleIsLoser={toggleIsLoser}
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
  );
};

export default GameNavbar;
