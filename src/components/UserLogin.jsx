import React, { useState } from "react";
import { loginUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/UserLogin.css";
import { FaUser, FaLock, FaGoogle, FaFacebook, FaEye, FaEyeSlash } from "react-icons/fa";

const UserLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false); // For register page loading
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader immediately

    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.token); // Store the authentication token
      localStorage.setItem("role", data.user.role); // Store the user's role
      localStorage.setItem("userId", data.user.id); // Store the logged-in user's ID
      navigate(
        data.user.role === "admin"
          ? "/admin-dashboard"
          : `/student-dashboard/${data.user.id}` // Corrected redirect for student dashboard
      );
    } catch (err) {
      // Handle error gracefully
      setMessage(err.response?.data?.message || "Invalid credentials!");
    } finally {
      setLoading(false); // Hide loader after login attempt
    }
  };

  // Trigger loading screen when clicking the "Register Here" link
  const handleRegisterClick = () => {
    setIsLoadingRegister(true);
    setTimeout(() => {
      navigate("/register");
    }, 5000); // 5-second loading screen before navigating
  };

  return (
    
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <h2 className="text-center">LOGIN</h2>
          <p className="subtext">Welcome! Please login to your account.</p>
          {message && <p className="alert alert-danger text-center">{message}</p>}
          {loading ? (
            // Display the loader when loading is true
            <div className="loader">
              <svg viewBox="0 0 80 80">
                <circle r="32" cy="40" cx="40" id="test"></circle>
              </svg>
              
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
                <FaLock className="icon" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
                <div
                  className="eye-icon"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              <button type="submit" className="btn-login">
                Login Now
              </button>
            </form>
          )}
          <p className="text-center mt-3">Login with Others</p>
          <div className="social-login">
            <button className="btn-social google">
              <FaGoogle /> Login with Google
            </button>
            <button className="btn-social facebook">
              <FaFacebook /> Login with Facebook
            </button>
          </div>
          <p className="text-center mt-3">
            Don't have an account?{" "}
            <span
              onClick={handleRegisterClick} // Trigger loading screen when clicking "Register Here"
              className="link"
            >
              Register here
            </span>
          </p>
        </div>
        <div className="login-right">
          <img
            src="https://s.yimg.com/zb/imgv1/17d2bf14-6327-3ee4-bc6a-a33dfe2886c5/t_500x300"
            alt="Cover"
            className="cover-image"
          />
        </div>
      </div>
      {isLoadingRegister && (
        <div className="loading-screen">
          <div className="loader">
            <svg viewBox="0 0 80 80">
              <circle r="32" cy="40" cx="40" id="test"></circle>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLogin;
