
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import ScoreIcon from "@mui/icons-material/Score";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import AdminProfile from "../admin/AdminProfile";
import Dashboard from "./Dashboard";
import EventManagement from "../admin/EventManagement";
import EventParticipants from "../admin/EventParticipants";
import AddTeam from "../admin/AddTeam";
import AdminScores from "../components/AdminScores";
import TeamList from "../components/TeamList";
// Fixed import path for DashboardHome
import DashboardHome from "../admin/DashboardHome";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedButton, setSelectedButton] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Check screen size on initial render
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Logout function with animation
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("adminId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      navigate("/login");
    }, 5000); // Reduced delay for better UX
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  // Change the view based on the selected menu item
  const changeView = (view) => {
    setCurrentView(view);
    setSelectedButton(view); 
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Render the content based on the selected view
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "adminProfile":
        return <AdminProfile />;
      case "eventManagement":
        return <EventManagement />;
      case "eventParticipants":
        return <EventParticipants />;
      case "addTeam":
        return <AddTeam />;
      case "adminScores":
        return <AdminScores />;
      case "teamList":
        return <TeamList />;
      case "users": // Added case for users view
        return <DashboardHome />;
      default:
        return <Dashboard />;
    }
  };

  // Generate particles for the epic logout animation
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const randomX = Math.random() * 400 - 200;
      const randomY = Math.random() * 400 - 200;
      const randomDelay = Math.random() * 0.5;
      const randomDuration = 4 + Math.random();
      
      const style = {
        top: `${50 + Math.random() * 20 - 10}%`,
        left: `${50 + Math.random() * 20 - 10}%`,
        opacity: Math.random() * 0.5 + 0.5,
        animation: `floatParticle ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
        '--x': `${randomX}px`,
        '--y': `${randomY}px`
      };
      
      particles.push(<div key={i} className="particle" style={style}></div>);
    }
    return particles;
  };

  // Display loading screen during logout
  if (isLoggingOut) {
    return (
      <div className="loading-screen">
        <div className="particles">
          {renderParticles()}
        </div>
        <div className="logout-portal">
          <div className="portal-ring"></div>
          <div className="portal-ring"></div>
          <div className="portal-ring"></div>
          <div className="portal-ring"></div>
          <div className="logout-message">Logging Out...</div>
        </div>
        
        {/* Fallback animation */}
        <div className="wheel-and-hamster" aria-label="Orange and tan hamster running in a metal wheel" role="img">
          <div className="wheel"></div>
          <div className="hamster">
            <div className="hamster__body">
              <div className="hamster__head">
                <div className="hamster__ear"></div>
                <div className="hamster__eye"></div>
                <div className="hamster__nose"></div>
              </div>
              <div className="hamster__limb hamster__limb--fr"></div>
              <div className="hamster__limb hamster__limb--fl"></div>
              <div className="hamster__limb hamster__limb--br"></div>
              <div className="hamster__limb hamster__limb--bl"></div>
              <div className="hamster__tail"></div>
            </div>
          </div>
          <div className="spoke"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Hamburger Menu Button with improved positioning */}
      <button 
        className="hamburger-menu" 
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Sidebar Navigation */}
      <nav className={`dashboard-nav ${isSidebarOpen ? "open" : "closed"}`}>
        <h3 className="nav-header">Admin Portal</h3>
        <ul className="nav-list">
          <li
            className={`nav-item ${selectedButton === "dashboard" ? "active" : ""}`}
            onClick={() => changeView("dashboard")}
          >
            <DashboardIcon className="nav-icon" />
            <span>Dashboard</span>
          </li>
          <li
            className={`nav-item ${selectedButton === "adminProfile" ? "active" : ""}`}
            onClick={() => changeView("adminProfile")}
          >
            <AccountCircleIcon className="nav-icon" />
            <span>My Profile</span>
          </li>
          <li
            className={`nav-item ${selectedButton === "eventManagement" ? "active" : ""}`}
            onClick={() => changeView("eventManagement")}
          >
            <EventIcon className="nav-icon" />
            <span>Manage Events</span>
          </li>
          <li
            className={`nav-item ${selectedButton === "eventParticipants" ? "active" : ""}`}
            onClick={() => changeView("eventParticipants")}
          >
            <PeopleIcon className="nav-icon" />
            <span>Participants</span>
          </li>
          <li
            className={`nav-item ${selectedButton === "addTeam" ? "active" : ""}`}
            onClick={() => changeView("addTeam")}
          >
            <AddIcon className="nav-icon" />
            <span>Manage Team</span>
          </li>
          <li
            className={`nav-item ${selectedButton === "adminScores" ? "active" : ""}`}
            onClick={() => changeView("adminScores")}
          >
            <ScoreIcon className="nav-icon" />
            <span>Scores</span>
          </li>
          <li
            className={`nav-item ${selectedButton === "teamList" ? "active" : ""}`}
            onClick={() => changeView("teamList")}
          >
            <VisibilityIcon className="nav-icon" />
            <span>View All Teams</span>
          </li>
          {/* Added new menu item for Users */}
          <li
            className={`nav-item ${selectedButton === "users" ? "active" : ""}`}
            onClick={() => changeView("users")}
          >
            <PersonIcon className="nav-icon" />
            <span>Users</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          <LogoutIcon className="nav-icon" />
          <span>Logout</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">{renderView()}</div>
    </div>
  );
};

export default AdminDashboard;