import React, { useState } from "react";
import { registerUser } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaBuilding, FaCamera } from "react-icons/fa";
import "../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone_number: "",
    role: "student",
    department: "",
    photo: null,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      await registerUser(formDataToSend);
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 5000);
    } catch (err) {
      setMessage(
        "Error: " + (err.response?.data?.message || "Registration failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    setSigningIn(true);
    setTimeout(() => {
      navigate("/login");
    }, 5000);
  };

  if (signingIn) {
    return (
      <div className="register-container">
        <div className="terminal-loader">
          <div className="terminal-header">
            <div className="terminal-title">Status</div>
            <div className="terminal-controls">
              <div className="control close"></div>
              <div className="control minimize"></div>
              <div className="control maximize"></div>
            </div>
          </div>
          <div className="text">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      {loading ? (
        <div className="loader">
          <div className="loading-bar-background">
            <div className="loading-bar">
              <div className="white-bars-container">
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
                <div className="white-bar"></div>
              </div>
            </div>
          </div>
          <div className="loading-text">
            Processing registration
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      ) : (
        <div className="register-form">
          <h2 className="register-title">Create Your Account</h2>
          {message && <p className="message">{message}</p>}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="input-group">
              <FaUser className="icon" />
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaUser className="icon" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaEnvelope className="icon" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaPhone className="icon" />
              <input
                type="text"
                name="phone_number"
                placeholder="Phone Number"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaBuilding className="icon" />
              <input
                type="text"
                name="department"
                placeholder="Department"
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <FaLock className="icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaCamera className="icon" />
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <button type="submit" className="register-button">
              Register
            </button>
          </form>
          <p className="signin-link">
            Already have an account? <a href="#" onClick={handleSignInClick}>Login</a> here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Register;