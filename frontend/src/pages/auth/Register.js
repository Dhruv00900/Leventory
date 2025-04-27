import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Regex for validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^])[A-Za-z\d@$!%*?#&^]{6,}$/;

  const validateFullName = (value) => {
    const trimmed = value.trim();
    const words = trimmed.split(" ").filter(Boolean);
    if (!trimmed) return "Name is required.";
    if (!nameRegex.test(trimmed)) return "Name must contain only letters, spaces, apostrophes, or hyphens.";
    if (words.length < 2) return "Please enter your full name (first and last).";
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required.";
    if (!emailRegex.test(value)) return "Enter a valid email.";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required.";
    if (!passwordRegex.test(value)) {
      return "Password must be at least 6 characters, include uppercase, lowercase, a number, and a special character.";
    }
    return "";
  };

  const handleRegister = async () => {
    // Validate fields
    const nameError = validateFullName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (nameError || emailError || passwordError) {
      if (nameError) toast.error(nameError);
      if (emailError) toast.error(emailError);
      if (passwordError) toast.error(passwordError);
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5003/api/auth/register",
        { name, email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Registration successful");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      toast.error(msg);
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='l-body'>
      <div className="login">
        <div className="wrapper">
          <div className="title">Register</div>
          <form>
            <div className="field">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              <div className="btn-layer"></div>
              <input
                type="button"
                value={loading ? "Registering..." : "SignUp"}
                onClick={handleRegister}
                disabled={loading}
              />
            </div>
            <p>Already have an account? <Link to='/'>Login</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
