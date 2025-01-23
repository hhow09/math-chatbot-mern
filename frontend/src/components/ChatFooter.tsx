import React, { useState } from 'react'
import { Socket } from 'socket.io-client'
import { Message, Sender, MessageType } from './message.ts'

const ChatFooter = ({ socket, setMessages }: { socket: Socket, setMessages: React.Dispatch<React.SetStateAction<Message[]>>}): React.JSX.Element => {
  const [message, setMessage] = useState<string>("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("operation", message)
      const msg: Message = {
        sender: Sender.USER,
        lines: [message],
        type: MessageType.RESULT
      }
      setMessages((prevMessages) => [...prevMessages, msg])
    }
    setMessage("")
  }

  const handleGetHistory = () => {
    socket.emit("history")
    const msg: Message = {
      sender: Sender.USER,
      lines: ["history"],
      type: MessageType.HISTORY
    }
    setMessages((prevMessages) => [...prevMessages, msg])
  }

  return (
    <div className='chat__footer'>
        <input
          type="text"
          placeholder='Write message'
          className='chat_input'
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button className="sendBtn" onClick={handleSendMessage}>SEND</button>
        <button className="sendBtn" onClick={handleGetHistory}>HISTORY</button>
    </div>
  )
}

export default ChatFooter