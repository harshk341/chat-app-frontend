import { useState } from "react";
import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";
import axios from "axios";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormError {
  email?: string;
  password?: string;
}

const initialFormData = {
  email: "",
  password: "",
};

const LoginForm = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [error, setError] = useState<LoginFormError>({});
  const [isLoading, setIsLoading] = useState(false);
  const { initializeSocketAndJoin } = useSocket();

  const validate = (): boolean => {
    const newErrors: LoginFormError = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setError(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      if (!validate()) return;

      setIsLoading(true);

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/auth/login`,
        formData,
      );
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      login(data.user);
      initializeSocketAndJoin(data.user._id);

      setFormData(initialFormData);
      alert(JSON.stringify(data));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        alert(JSON.stringify(error.response.data));
      } else {
        console.log(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <br />
          {error.email && <span style={{ color: "red" }}>{error.email}</span>}
        </fieldset>
        <fieldset>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <br />
          {error.password && (
            <span style={{ color: "red" }}>{error.password}</span>
          )}
        </fieldset>
        <fieldset>
          {isLoading ? (
            <button disabled>Loading...</button>
          ) : (
            <button type="submit">Login</button>
          )}
        </fieldset>
      </form>
    </>
  );
};

export default LoginForm;
