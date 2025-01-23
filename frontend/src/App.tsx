import { useState, useEffect } from "react";
import ChatPage from "./components/ChatPage.tsx";
import { io } from "socket.io-client"

// backend url
const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const socket = io(socketUrl, {
  autoConnect: true,
  reconnectionAttempts: 100,
  reconnectionDelay: 1000,
});

function App() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to server");
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      console.log("disconnected from server");
      setIsConnected(false);
    });
  }, []);

  return (
    <>
      {isConnected ?
        <ChatPage socket={socket} /> :
        <div className="status">Connecting to server...</div>
      }
    </>
  );
}

export default App;
