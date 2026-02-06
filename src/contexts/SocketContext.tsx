import { useEffect, createContext, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | null>(null);

const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");

    function createConnection() {
      setSocket(newSocket);
    }

    newSocket.on("connect", () => {
      console.log("connected to socket server");
    });

    createConnection();

    return function () {
      newSocket.disconnect();
    };
  }, []);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
