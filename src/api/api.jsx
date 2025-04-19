import axios from "axios";

const API_URL = "http://localhost:5000/api";


export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", {
      message: error.message,
      response: error.response?.data,
      config: error.config,
    });
    throw error.response?.data || { message: "Registration failed" };
  }
};
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error.response?.data || error.message);
    throw error.response?.data || { message: "Login failed" };
  }
};


