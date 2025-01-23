import { Message } from './message.ts'

const ChatBody = ({ messages }: { messages: Message[] }) => {
  return (
    <>
      <header className='chat__mainHeader'>
        Math Bot
      </header>
      <div className='message__container'>
        {messages.map((m, idx) => (
          <div className='message' key={idx}>
            <div className={`message__sender ${m.sender}`}>{m.sender}</div>
            <div className={`message__content ${m.type}`}>
              {m.lines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default ChatBody