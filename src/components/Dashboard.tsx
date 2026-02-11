import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import axios from "axios";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { onlineUsers, emitDisconnect, socket } = useSocket();
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [typingUser, setTypingUser] = useState<Set<string>>(new Set([]));
  const typingUserTimeput = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const usersList = useMemo(() => {
    const newOnlineUser = onlineUsers.filter((v) => v !== user?._id);
    return users.map((user) => ({
      ...user,
      isOnline: newOnlineUser.includes(user._id),
    }));
  }, [onlineUsers, user, users]);

  const fetchUsersList = useCallback(async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users`);

      setUsers(data.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        console.log(error);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    emitDisconnect();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputValue(value);
  };

  const handleKeyDown = () => {
    if (!socket || !user || !selectedUser) return;

    socket.emit("typing", {
      sender: user._id,
      receiver: selectedUser,
    });
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value || !selectedUser || !user || !socket) return;

    setInputValue("");

    socket.emit("send-message", {
      sender: user._id,
      receiver: selectedUser,
      content: value,
    });
  };

  useEffect(() => {
    if (!socket || !user || !selectedUser) return;

    const currentTimeoutRef = typingUserTimeput.current;

    const handleReceiveMessage = (msg: any) => {
      const isCurrentChat =
        (msg.sender === user._id && msg.receiver === selectedUser) ||
        (msg.sender === selectedUser && msg.receiver === user._id);
      if (!isCurrentChat) return;
      setMessages((prev: any[]) => {
        return [...prev, msg];
      });
    };

    const handleTypingStatus = (sender: string) => {
      setTypingUser((prev) => new Set(prev).add(sender));

      if (currentTimeoutRef[sender]) {
        clearTimeout(currentTimeoutRef[sender]);
      }

      currentTimeoutRef[sender] = setTimeout(() => {
        setTypingUser((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sender);
          return newSet;
        });
        delete currentTimeoutRef[sender];
      }, 2000);
    };

    socket.on("receiver-message", handleReceiveMessage);
    socket.on("user-typing", handleTypingStatus);
    socket.on("new-user", fetchUsersList);

    return function () {
      socket.removeListener("receiver-message", handleReceiveMessage);
      socket.removeListener("user-typing", handleTypingStatus);
      Object.values(currentTimeoutRef).forEach(clearTimeout);
    };
  }, [socket, selectedUser, user, fetchUsersList]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessageList = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/messages/${selectedUser}`,
        );

        setMessages(data.data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          alert(JSON.stringify(error.response.data));
        } else {
          console.log(error);
        }
      }
    };

    fetchMessageList();
  }, [selectedUser]);

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsersList();
    };

    loadUsers();
  }, [fetchUsersList]);

  return (
    <>
      <div className="chat-app clearfix">
        <div className="left-content">
          <ul className="users-list">
            {usersList.map((user) => (
              <li
                key={user._id}
                className={`users-list-item ${selectedUser === user._id ? "selected-user" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedUser(user._id)}
                  className={user.isOnline ? "online" : ""}
                >
                  {user.name}
                  <span className="online-status"></span>
                  {typingUser.has(user._id) && (
                    <span className="typing-indicator">typing...</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="logout-control">
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <div className="right-content">
          <ul className="messages">
            {messages.map((msg) => (
              <li>
                {`${msg.sender === user?._id ? "You" : "Friend"} :- ${msg.content}`}
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              autoComplete="off"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              value={inputValue}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
