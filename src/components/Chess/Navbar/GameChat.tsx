import { useEffect, useRef, useState } from 'react'
import { Page, Messagebar, Messages, Message, MessagesTitle, Link, Icon } from 'konsta/react'
import Header from '../../Header/Header'
import { MdClose, MdSend } from 'react-icons/md'

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
  viewedAt: string
}

const GameChat: React.FC<GameChatProps> = ({
  isChatVisible,
  setIsChatVisible,
  messages,
  setMessages,
  userId,
  socket,
}) => {
  const pageRef = useRef()
  const initiallyScrolled = useRef(false)

  const handleSendClick = () => {
    const newMessage = {
      sender: userId,
      message: messageText,
      viewedAt: null,
    }
    setMessages((prev: Message[]) => [...prev, newMessage] as Message[])
    socket.emit('message', {
      game_id: location.pathname.split('/')[2],
      message: newMessage,
    })
    setMessageText('')
  }

  const [messageText, setMessageText] = useState('')

  const inputOpacity = messageText ? 1 : 0.3
  const isClickable = messageText.trim().length > 0

  const handleChangeMessage = (e: { target: { value: string } }) => {
    let value = e.target.value
    const maxLength = 200
    const prohibitedCharacters = /[^a-zA-Z0-9\s.,!?]/

    value = value.replace(/<br\s*\/?>/gi, '')

    if (!value.trim()) {
      setMessageText('')
      return
    }

    if (value.length > maxLength) return

    if (prohibitedCharacters.test(value)) return

    setMessageText(value)
  }

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

  const scrollToBottom = () => {
    const pageElement = pageRef.current.current || pageRef.current.el
    pageElement.scrollTo({
      top: pageElement.scrollHeight - pageElement.offsetHeight,
      behavior: initiallyScrolled.current ? 'smooth' : 'auto',
    })
  }

  useEffect(() => {
    scrollToBottom()
    initiallyScrolled.current = true
  }, [messages])

  useEffect(() => {
    isChatVisible &&
      setMessages(
        messages.map((message) =>
          message.sender !== userId ? { ...message, viewedAt: new Date().toISOString() } : message
        )
      )
  }, [])

  return (
    <Page component="div" className="z-50 fixed hide-scrollbar space-y-[50px]" ref={pageRef}>
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
        onKeyDown={(e) => e.key === 'Enter' && isClickable && handleSendClick()}
        onInput={handleChangeMessage}
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
  )
}

export default GameChat
