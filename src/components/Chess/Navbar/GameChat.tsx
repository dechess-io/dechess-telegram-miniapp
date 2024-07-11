// import {
//   MainContainer,
//   ChatContainer,
//   MessageList,
//   Message,
//   MessageInput,
// } from '@chatscope/chat-ui-kit-react'
// import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'

import { useState, useRef, useEffect } from 'react'
import {
  Page,
  Navbar,
  NavbarBackLink,
  Messagebar,
  Messages,
  Message,
  MessagesTitle,
  Link,
  Icon,
  Button,
} from 'konsta/react'
import Header from '../../Header/Header'
// import { CameraFill, ArrowUpCircleFill } from 'framework7-icons/react';
// import { MdCameraAlt, MdSend } from 'react-icons/md';

// import React, { useRef, useEffect } from 'react'

interface GameChatProps {
  isChatVisible: boolean
  setIsChatVisible: any
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  userId: string
  socket: any
}

export type Message = {
  sender: string
  message: string
}

const GameChat: React.FC<GameChatProps> = ({
  isChatVisible,
  setIsChatVisible,
  messages,
  setMessages,
  userId,
  socket,
}) => {
  const handleClick = (data: any) => {
    setMessages((prev) => [...prev, { sender: userId, message: data }])
    socket.emit('message', {
      game_id: location.pathname.split('/')[2],
      message: { sender: userId, message: data },
    })
  }

  const [messageText, setMessageText] = useState('')
  const [messagesData, setMessagesData] = useState([
    {
      type: 'sent',
      text: 'Hi, Kate',
    },
    {
      type: 'sent',
      text: 'How are you?',
    },
    {
      name: 'Kate',
      type: 'received',
      text: 'Hi, I am good!',
      avatar: 'https://cdn.framework7.io/placeholder/people-100x100-9.jpg',
    },
    {
      name: 'Blue Ninja',
      type: 'received',
      text: 'Hi there, I am also fine, thanks! And how are you?',
      avatar: 'https://cdn.framework7.io/placeholder/people-100x100-7.jpg',
    },
    {
      type: 'sent',
      text: 'Hey, Blue Ninja! Glad to see you ;)',
    },
    {
      type: 'sent',
      text: 'How do you feel about going to the movies today?',
    },
    {
      name: 'Kate',
      type: 'received',
      text: ' Oh, great idea!',
      avatar: 'https://cdn.framework7.io/placeholder/people-100x100-9.jpg',
    },
    {
      name: 'Kate',
      type: 'received',
      text: ' What cinema are we going to?',
      avatar: 'https://cdn.framework7.io/placeholder/people-100x100-9.jpg',
    },
    {
      name: 'Blue Ninja',
      type: 'received',
      text: 'Great. And what movie?',
      avatar: 'https://cdn.framework7.io/placeholder/people-100x100-7.jpg',
    },
    {
      name: 'Blue Ninja',
      type: 'received',
      text: 'What time?',
      avatar: 'https://cdn.framework7.io/placeholder/people-100x100-7.jpg',
    },
  ])

  const handleSendClick = () => {
    const text = messageText.replace('g', '<br>').trim()
    const type = 'sent'
    const messagesToSend = []
    if (text.length) {
      messagesToSend.push({
        text,
        type,
      })
    }
    if (messagesToSend.length === 0) {
      return
    }
    setMessagesData([...messagesData, ...messagesToSend])
    setMessageText('')
  }

  const inputOpacity = messageText ? 1 : 0.3
  const isClickable = messageText.trim().length > 0

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
        return <b key={part.type}>{part.value}</b>
      }
      return part.value
    })

  // if (isChatVisible) {
  //   return (
  //     <div
  //       className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[50%]   transition-all duration-300 z-50 rounded-lg ${
  //         isChatVisible ? 'block' : 'hidden'
  //       }`}
  //     >
  //       <MainContainer responsive={true} style={{ borderRadius: '20px' }}>
  //         <ChatContainer>
  //           <MessageList>
  //             {messages.map((message, index) => {
  //               let position: 'normal' | 'first' | 'last' = 'normal'

  //               if (index === 0) {
  //                 position = 'first'
  //               } else if (index === messages.length - 1) {
  //                 position = 'last'
  //               }
  //               const isOutgoing = message.sender === userId

  //               const messageStyle = {
  //                 borderRadius: '5px',
  //                 maxWidth: '70%',
  //               }

  //               return (
  //                 <Message
  //                   key={index}
  //                   model={{
  //                     message: message.message,
  //                     sender: message.sender,
  //                     direction: message.sender === userId ? 'outgoing' : 'incoming',
  //                     position: position,
  //                   }}
  //                   style={messageStyle}
  //                 />
  //               )
  //             })}
  //           </MessageList>

  //           <MessageInput
  //             onSend={handleClick}
  //             className="text-white flex"
  //             placeholder="Type message here"
  //             attachButton={false}
  //           />
  //         </ChatContainer>
  //       </MainContainer>
  //     </div>
  //   )

  return (
    <Page className="z-50 overflow-auto hide-scrollbar">
      <Header />
      <Navbar right={<Button onClick={setIsChatVisible}>X</Button>} />
      <Messages>
        <MessagesTitle>{currentDate}</MessagesTitle>
        {messagesData.map((message, index) => (
          <Message
            key={index}
            type={message.type}
            name={message.name}
            text={message.text}
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
        placeholder="Message"
        value={messageText}
        onInput={(e) => setMessageText(e.target.value)}
        left={<Button onClick={setIsChatVisible}>X</Button>}
        right={
          <Link
            onClick={isClickable ? handleSendClick : undefined}
            toolbar
            style={{
              opacity: inputOpacity,
              cursor: isClickable ? 'pointer' : 'default',
            }}
          >
            <div>Send</div>
          </Link>
        }
      />
    </Page>
  )
}

export default GameChat
