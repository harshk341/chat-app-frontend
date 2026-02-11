import { useEffect, useMemo, useState } from "react";
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

  const usersList = useMemo(() => {
    const newOnlineUser = onlineUsers.filter((v) => v !== user?._id);
    return users.map((user) => ({
      ...user,
      isOnline: newOnlineUser.includes(user._id),
    }));
  }, [onlineUsers, user, users]);

  const handleLogout = () => {
    logout();
    emitDisconnect();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputValue(value);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value || !selectedUser || !user) return;

    setInputValue("");

    socket?.emit("send-message", {
      sender: user._id,
      receiver: selectedUser,
      content: value,
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: any) => {
      setMessages((prev: any[]) => {
        return [...prev, msg];
      });
    };

    socket.on("receiver-message", handleReceiveMessage);

    return function () {
      socket.removeListener("receiver-message", handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessageList = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/messages/${selectedUser}`,
        );

        setMessages((prev: any[]) => {
          return [...prev, ...data.data];
        });
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
    const fetchUsersList = async () => {
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
    };

    fetchUsersList();
  }, []);

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
