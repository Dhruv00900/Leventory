import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate} from "react-router-dom";
import "./login.css"; // Ensure this path is correct

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const handleLogin = async () => {
    try {
      const { data } = await axios.post(`${API}/api/auth/login`
, {
        email,
        password,
      }, { headers: { "Content-Type": "application/json" } });
      
      // Store only the token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));// Store user data in local storage
      
      toast.success("Login successful"); // Success message
      navigate("/home"); // Redirect to dashboard
      
  
    } catch (error) {
      console.error("Login failed", error.response?.data); // Log error to console
          toast.error("login failed");
      // Show an alert with the error message (fallback if no message exists)
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    }
  };
  

  return (<><div className="l-body"><div className="login">
    <div className="wrapper">
      <div className="title">Login</div>
      <div className="form-container">
        <form>
          <div className="field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="btn">
           
            <input type="button" value="Login" onClick={handleLogin} />
           
          </div>
          
        </form>
      </div>
    </div>
    </div></div></>
  );
};

export default Login;
