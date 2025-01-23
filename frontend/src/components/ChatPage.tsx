import React, { useEffect, useState} from 'react'
import ChatBody from './ChatBody.tsx'
import ChatFooter from './ChatFooter.tsx'
import { Socket } from 'socket.io-client'
import { Message, Sender, History, MessageType } from './message.ts'

const ChatPage = ({socket}: {socket: Socket}): React.JSX.Element => { 
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(()=> {
    socket.on("result", (data: string) => {
      const msg: Message = {
        sender: Sender.BOT,
        lines: [data],
        type: MessageType.RESULT
      }
      setMessages((prevMessages) => [...prevMessages, msg])
    })

    socket.on("history", (data: History[]) => {
      const msg: Message = {
        sender: Sender.BOT,
        lines: data.map(h => `${h.expression} = ${h.result}`),
        type: MessageType.HISTORY
      }
      setMessages((prevMessages) => [...prevMessages, msg])
    })

    // error message
    socket.on("error", (data: string) => {
      const msg: Message = {
        sender: Sender.BOT,
        lines: [data],
        type: MessageType.ERROR
      }
      setMessages((prevMessages) => [...prevMessages, msg])
    })
  }, [])

  return (
    <div className="chat">
        <ChatBody messages={messages} />
        <ChatFooter socket={socket} setMessages={setMessages} />
    </div>
  )
}

export default ChatPage