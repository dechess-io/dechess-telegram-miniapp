import { useEffect, useState } from 'react';
import { Page, Messagebar, Messages, Message, MessagesTitle, Link, Icon } from 'konsta/react';
import Header from '../../Header/Header';
import { MdClose, MdSend } from 'react-icons/md';

interface GameChatProps {
  isChatVisible: boolean;
  setIsChatVisible: any;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userId: string;
  socket: any;
}

export type Message = {
  sender: string;
  message: string;
  viewedAt: string;
};

const GameChat: React.FC<GameChatProps> = ({
  isChatVisible,
  setIsChatVisible,
  messages,
  setMessages,
  userId,
  socket,
}) => {
  const handleSendClick = () => {
    const newMessage = {
      sender: userId,
      message: messageText.replace('g', '<br>').trim(),
      viewedAt: null,
    };
    setMessages((prev: Message[]) => [...prev, newMessage] as Message[]);
    socket.emit('message', {
      game_id: location.pathname.split('/')[2],
      message: newMessage,
    });
    setMessageText('');
  };

  const [messageText, setMessageText] = useState('');

  const inputOpacity = messageText ? 1 : 0.3;
  const isClickable = messageText.trim().length > 0;

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(new Date())
    .map((part) => {
      if (['weekday', 'month', 'day'].includes(part.type)) {
        return <b key={part.type}>{part.value}</b>;
      }
      return part.value;
    });

  useEffect(() => {
    isChatVisible &&
      setMessages(
        messages.map((message) =>
          message.sender !== userId ? { ...message, viewedAt: new Date().toISOString() } : message
        )
      );
  }, []);

  return (
    <Page component="div" className="z-50 fixed hide-scrollbar space-y-[50px]">
      <Header />
      <Messages className="hide-scrollbar">
        <MessagesTitle>{currentDate}</MessagesTitle>
        {messages.map((message, index) => (
          <Message
            key={index}
            type={message.sender === userId ? 'sent' : 'received'}
            // name={message.name}
            text={message.message}
            colors={{
              bubbleSentIos: 'bg-blue-gradient shadow-general',
              bubbleSentMd: 'bg-blue-gradient shadow-general',
              bubbleReceivedIos: 'bg-gray-800 shadow-general',
              bubbleReceivedMd: 'bg-gray-800 shadow-general',
            }}
            className="font-medium font-ibm"
            // avatar={
            //   message.type === 'received' && (
            //     <img
            //       alt="avatar"
            //       src={message.avatar}
            //       className="w-8 h-8 rounded-full"
            //     />
            //   )
            // }
          />
        ))}
      </Messages>
      <Messagebar
        className="hide-scrollbar"
        placeholder="Message"
        value={messageText}
        onInput={(e) => setMessageText(e.target.value)}
        left={
          <Link
            onClick={setIsChatVisible}
            toolbar
            style={{
              opacity: inputOpacity,
              cursor: 'pointer',
            }}
          >
            <Icon>
              <MdClose className="w-6 h-6 fill-black dark:fill-md-dark-on-surface" />
            </Icon>
          </Link>
        }
        right={
          <Link
            onClick={isClickable ? handleSendClick : undefined}
            toolbar
            style={{
              opacity: inputOpacity,
              cursor: isClickable ? 'pointer' : 'default',
            }}
          >
            <Icon
              material={<MdSend className="w-6 h-6 fill-black dark:fill-md-dark-on-surface" />}
              ios={<MdSend className="w-6 h-6 fill-black dark:fill-md-dark-on-surface" />}
            />
          </Link>
        }
      />
    </Page>
  );
};

export default GameChat;
