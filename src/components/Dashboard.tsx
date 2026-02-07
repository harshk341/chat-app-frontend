import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();

  console.log(onlineUsers);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div>
        <p>You have successfully logged in</p>
        <p>email: {user ? user.email : ""}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </>
  );
};

export default Dashboard;
