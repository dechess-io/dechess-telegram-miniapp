import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from '@chatscope/chat-ui-kit-react'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'

import React, { useRef, useEffect } from 'react'

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

  if (isChatVisible) {
    return (
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] md:w-[400px] h-[80%] md:h-[600px]  transition-all duration-300 z-50 rounded-lg ${
          isChatVisible ? 'block' : 'hidden'
        }`}
      >
        <MainContainer responsive={true}>
          <ChatContainer>
            <MessageList
              style={{
                backgroundColor: '',
              }}
            >
              {messages.map((message, index) => {
                let position: 'normal' | 'first' | 'last' = 'normal'

                if (index === 0) {
                  position = 'first'
                } else if (index === messages.length - 1) {
                  position = 'last'
                }

                return (
                  <Message
                    key={index}
                    model={{
                      message: message.message,
                      sender: message.sender,
                      direction: message.sender === userId ? 'outgoing' : 'incoming',
                      position: position,
                    }}
                  />
                )
              })}
            </MessageList>

            <MessageInput
              onSend={handleClick}
              className="text-white flex"
              placeholder="Type message here"
              attachButton={false}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    )
  }
}

export default GameChat
