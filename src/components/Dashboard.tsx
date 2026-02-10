import { useMemo } from "react";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { onlineUsers, emitDisconnect } = useSocket();

  const usersList = useMemo(() => {
    return onlineUsers.filter((v) => v !== user?._id);
  }, [onlineUsers, user]);

  console.log(onlineUsers);

  const handleLogout = () => {
    logout();
    emitDisconnect();
  };

  return (
    <>
      <div className="chat-app clearfix">
        <div className="left-content">
          <ul className="users-list">
            {usersList.map((v) => (
              <li key={v} title={v}>
                <a href={v}>{v}</a>
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
          <ul className="messages"></ul>
          <form>
            <input type="text" autoComplete="off" />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
