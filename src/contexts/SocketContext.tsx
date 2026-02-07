import { useEffect, createContext, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  emitJoin: (userId: string) => void;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  emitJoin: (_userId) => {},
});

const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");

    function createConnection() {
      setSocket(newSocket);
    }

    function handleOnlineUsers(users: string[]) {
      setOnlineUsers(users);
    }

    newSocket.on("connect", () => {
      console.log("connected to socket server");
    });

    newSocket.on("online-users", handleOnlineUsers);

    createConnection();

    return function () {
      newSocket.disconnect();
      newSocket.off("online-users", handleOnlineUsers);
    };
  }, []);

  const emitJoin = (userId: string) => {
    socket?.emit("join", userId);
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, emitJoin }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
