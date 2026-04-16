import React from "react";
// import "./App.css";
import useAuth from "./hooks/useAuth";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <div className="container mx-auto px-4">
        {isLoggedIn ? <Dashboard /> : <LoginForm />}
      </div>
    </>
  );
};

export default App;
