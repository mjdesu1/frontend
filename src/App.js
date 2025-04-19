import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import UserLogin from "./components/UserLogin"; // Renamed Login.js
import ClientDashboard from "./components/ClientDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminProfile from "./admin/AdminProfile";
import EventManagement from "./admin/EventManagement"; // ✅ Ensure this path is correct
import EventRegistration from "./student/EventRegistration"; // Import the student event registration component
import EventParticipants from "./admin/EventParticipants";
import AddTeam from "./admin/AddTeam";
import JoinTeam from "./student/JoinTeam"; // Import the JoinTeam component
import TeamDetails from "./student/TeamDetails";
import TeamList from "./components/TeamList";
import Dashboard from "./components/Dashboard";
import StudentDashboard from "./components/StudentDashboard";
import AdminScores from "./components/AdminScores";
import ViewScores from "./components/ViewScores";
import DashboardHome from "./admin/DashboardHome";
//css import

import "./styles/UserLogin.css";
import "./styles/Register.css";
import "./styles/AdminDashboard.css";
import "./styles/DashboardHome.css";
import "./styles/Dashboard.css"
import "./styles/AdminProfile.css"
import "./styles/AdminParticipants.css";
import "./styles/AdminParticipants.css";
import "./styles/StudentDashboard.css";
import "./styles/StudentProfile.css";
// Student folder
import StudentProfile from "./student/StudentProfile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<UserLogin />} />

        {/* admin eventmanagements Routes */}
        <Route path="/event-management" element={<EventManagement />} />
        

        {/* Dashboard Routes */}
        <Route path="/student-dashboard/*" element={<ClientDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Student Profile Route with Dynamic ID */}
        <Route path="/client-dashboard/student-profile/:id" element={<StudentProfile />} />
        {/* Admin Profile Route with Dynamic ID */}
        <Route path="/admin-dashboard/admin-profile/:id" element={<AdminProfile />} />
        <Route path="/event-registration" element={<EventRegistration />} />
        <Route path="/event_participants" element={<EventParticipants />} />
        
        <Route path="/admin/add-team" element={<AddTeam />} />
        <Route path="/join-team/:eventId" element={<JoinTeam />} />
        {/* Default Route - Redirect unknown routes */}
        <Route path="/teams" element={<TeamList />} />
        <Route path="/team-details/:teamId" element={<TeamDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
         {/* Admin Route */}
  <Route path="/admin-scores" element={<AdminScores />} />
  <Route path="users" element={<DashboardHome />} />
{/* User Route */}
<Route path="/view-scores/:eventId" element={<ViewScores />} />
        <Route path="*" element={<UserLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
