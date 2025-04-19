import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Divider,
  Avatar,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  alpha,
  CssBaseline,
  useMediaQuery,
  Fade,
  Zoom,
  Tabs,
  Tab,
  CardMedia
} from "@mui/material";
import { styled } from '@mui/material/styles';
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import GroupsIcon from "@mui/icons-material/Groups";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AnnouncementIcon from "@mui/icons-material/Announcement";

// Global styles
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html, body, #root {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
      }
      #root {
        display: flex !important;
        flex-direction: column !important;
      }
      * { box-sizing: border-box !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

// Core layout components
const RootWrapper = styled(Box)({
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  width: '100vw', height: '100vh',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
});

const ContentScrollWrapper = styled(Box)({
  flexGrow: 1, overflowY: 'auto', width: '100%',
});

// Enhanced background design
const FullScreenBackground = styled(Box)(({ theme }) => ({
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  width: '100vw', height: '100vh', zIndex: -1,
  background: `
    radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 20%),
    radial-gradient(circle at 90% 50%, ${alpha(theme.palette.secondary.main, 0.07)} 0%, transparent 30%),
    radial-gradient(circle at 30% 80%, ${alpha(theme.palette.primary.light, 0.06)} 0%, transparent 25%),
    linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.04)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)
  `,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.replace('#', '')}' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.3,
  }
}));

// Animated dots pattern overlay
const BackgroundPattern = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  pointerEvents: 'none',
  zIndex: -1,
  opacity: 0.4,
  background: `
    radial-gradient(circle at 25px 25px, ${alpha(theme.palette.primary.main, 0.15)} 2px, transparent 0),
    radial-gradient(circle at 75px 75px, ${alpha(theme.palette.secondary.main, 0.1)} 2px, transparent 0)
  `,
  backgroundSize: '100px 100px',
  animation: 'fadeInBackground 1.5s ease-out',
  '@keyframes fadeInBackground': {
    '0%': { opacity: 0 },
    '100%': { opacity: 0.4 },
  },
}));

// UI Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.85),
  backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: 'none', color: theme.palette.text.primary,
}));

const EventCard = styled(Card)(({ theme }) => ({
  height: '100%', 
  display: 'flex', 
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 12px 28px -12px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const WelcomeSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3), 
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.background.paper, 0.7)})`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0, right: 0,
    width: '30%', height: '100%',
    background: `linear-gradient(135deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
    clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 5,
  textTransform: 'none',
  padding: '6px 12px',
  fontWeight: 500,
  minWidth: '90px',
  boxShadow: 'none',
  position: 'relative',
  overflow: 'visible',
  zIndex: 1,
  '&:hover': {
    transform: 'translateY(-2px)',
  }
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 500,
  '&:hover': {
    transform: 'translateY(-2px)',
  }
}));

const Footer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(12px)',
}));

const SectionHeading = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3), 
  display: 'flex', 
  alignItems: 'center',
  '&::after': {
    content: '""',
    height: '2px',
    background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.5)}, transparent)`,
    flexGrow: 1,
    marginLeft: theme.spacing(2),
  }
}));

const EventHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 100%)`,
}));

const EventContent = styled(CardContent)({
  flexGrow: 1,
  padding: '12px 16px',
});

const EventFooter = styled(CardActions)({
  padding: '12px 16px',
  justifyContent: 'space-between',
});

const AnnouncementCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px -8px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const AnnouncementHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
}));

// Loading screen component
const LoadingScreen = ({ message }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <Zoom in timeout={800}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4} 
            sx={{
              color: theme.palette.primary.main,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }} 
          />
          
          <Box sx={{ mt: 4, position: 'relative' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {message}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please wait while we process your request...
            </Typography>
          </Box>
        </Box>
      </Zoom>
    </Box>
  );
};

// Page transition wrapper
const PageTransition = ({ children, isVisible = true }) => (
  <Fade in={isVisible} timeout={800}>
    <Box>{children}</Box>
  </Fade>
);

// Announcements Component
// Fixed Announcements component with improved button functionality
const Announcements = ({ userId }) => {
  const theme = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        
        // Fetch registered events for the user
        let userEvents = [];
        try {
          const eventsResponse = await axios.get(`http://localhost:5000/api/students/${userId}/events`);
          userEvents = eventsResponse.data.map(event => event.event_id);
        } catch (eventErr) {
          console.warn("Failed to fetch user events, using fallback:", eventErr);
          // Fallback if API fails
          userEvents = [1, 2, 3, 4]; // Mock event IDs
        }
        
        // Fetch announcements for these events
        let announcementsData = [];
        if (userEvents.length > 0) {
          try {
            // Try to fetch announcements from API
            const announcementsResponse = await axios.get(`http://localhost:5000/api/announcements`, {
              params: { eventIds: userEvents.join(',') }
            });
            announcementsData = announcementsResponse.data;
          } catch (announcementsErr) {
            console.warn("Failed to fetch announcements, using fallback:", announcementsErr);
            // Fallback data if API fails
            announcementsData = generateMockAnnouncements(userEvents);
          }
        }
        
        setAnnouncements(announcementsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements. Please try refreshing the page.");
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, [userId]);
  
  // Generate mock announcements for fallback
  const generateMockAnnouncements = (eventIds) => {
    const mockAnnouncements = [
      {
        id: 1,
        title: "Basketball Tournament Update",
        content: "The basketball tournament semifinals will be held on Friday at 3:00 PM. All participating teams are requested to arrive 30 minutes early for warm-up.",
        admin_id: 1,
        event_id: 1,
        team_id: null,
        photo: null,
        created_at: "2025-04-10T14:30:00",
        admin_name: "Admin User",
        event_title: "Sports Fest"
      },
      {
        id: 2,
        title: "Schedule Change for Running Event",
        content: "Due to inclement weather forecast, the 200m dash has been rescheduled to Saturday morning at 9:00 AM. Please check your email for detailed information.",
        admin_id: 1,
        event_id: 2,
        team_id: null,
        photo: null,
        created_at: "2025-04-12T09:15:00",
        admin_name: "Admin User",
        event_title: "Running"
      },
      {
        id: 3,
        title: "Volleyball Tournament Finals",
        content: "Congratulations to Teams Alpha and Delta for making it to the finals! The championship match will be held this Sunday at 2:00 PM at the CCIS Grounds. Spectators are welcome!",
        admin_id: 2,
        event_id: 4,
        team_id: null,
        photo: "volleyball_finals.jpg",
        created_at: "2025-04-13T16:45:00",
        admin_name: "Event Coordinator",
        event_title: "Volleyball Match"
      },
      {
        id: 4,
        title: "Important Notice for All Participants",
        content: "All students participating in the Sports Fest must bring their student IDs for verification. Additionally, please remember to bring your own water bottles as we're promoting an eco-friendly event.",
        admin_id: 1,
        event_id: 1,
        team_id: null,
        photo: null,
        created_at: "2025-04-14T10:00:00",
        admin_name: "Admin User",
        event_title: "Sports Fest"
      },
      {
        id: 5,
        title: "Basketball Finals Venue Change",
        content: "Due to ongoing renovations at the Main Gym, the basketball tournament finals will now be held at the University Covered Court. Please note this change and inform your teammates.",
        admin_id: 2,
        event_id: 3,
        team_id: null,
        photo: "basketball_venue.jpg",
        created_at: "2025-04-14T14:30:00",
        admin_name: "Event Coordinator",
        event_title: "Basketball Tournament"
      }
    ];
    
    // Filter announcements based on user's events
    return mockAnnouncements.filter(announcement => eventIds.includes(announcement.event_id));
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle image click to expand
  const handleImageClick = (imageUrl, event) => {
    // Prevent event bubbling to avoid conflicts
    if (event) {
      event.stopPropagation();
    }
    setExpandedImage(imageUrl);
  };
  
  // Handle close expanded image
  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
        <Button 
          size="small" 
          sx={{ ml: 2 }} 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  if (announcements.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No announcements available for your registered events. Please check back later.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AnnouncementIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Announcements for Your Events
        </Typography>
      </Box>
      
      {announcements.map((announcement) => (
        <AnnouncementCard elevation={0} key={announcement.id}>
          <AnnouncementHeader>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main, 
                width: 40, 
                height: 40, 
                mr: 2 
              }}
            >
              {announcement.admin_name?.charAt(0) || 'A'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {announcement.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  size="small" 
                  label={announcement.event_title}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500, borderRadius: '4px' }}
                />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Posted by {announcement.admin_name} on {formatDate(announcement.created_at)}
                </Typography>
              </Box>
            </Box>
          </AnnouncementHeader>
          
          <CardContent sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {announcement.content}
            </Typography>
            
            {announcement.photo && (
              <Box 
                sx={{ 
                  mt: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: theme.shape.borderRadius,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.12)}`,
                  }
                }}
              >
                {/* Image container - click opens the full image */}
                <Box 
                  sx={{
                    position: 'relative',
                    maxHeight: '400px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => handleImageClick(`http://localhost:5000/uploads/${announcement.photo}`, e)}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                    image={`http://localhost:5000/uploads/${announcement.photo}`}
                    alt={announcement.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/600/300";
                    }}
                  />
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: alpha(theme.palette.common.white, 0.9),
                      borderRadius: '50%',
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      zIndex: 2,
                      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                    className="zoom-icon"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  </Box>
                </Box>
                
                {/* Fixed footer with expand button */}
                <Box 
                  sx={{ 
                    p: 1, 
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Click to view full image
                  </Typography>
                  
                  {/* Separate button with proper click handling */}
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={(e) => handleImageClick(`http://localhost:5000/uploads/${announcement.photo}`, e)}
                    sx={{ 
                      fontWeight: 500, 
                      textTransform: 'none', 
                      px: 2, 
                      py: 0.5,
                      minWidth: 'auto',
                      zIndex: 3 // Ensure button is above other elements
                    }}
                  >
                    Expand
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </AnnouncementCard>
      ))}
      
      {/* Full image viewer modal */}
      {expandedImage && (
        <Box 
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2,
            userSelect: 'none'
          }}
          onClick={handleCloseExpandedImage}
        >
          {/* Close button */}
          <Button
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              minWidth: 'auto',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.common.white, 0.2),
              color: theme.palette.common.white,
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.3)
              },
              zIndex: 10000
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleCloseExpandedImage();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
          
          {/* Full size image container */}
          <Box 
            sx={{ 
              maxWidth: '95%', 
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent click on image from closing modal
          >
            <img 
              src={expandedImage} 
              alt="Full size announcement image" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '85vh', 
                objectFit: 'contain',
                borderRadius: '4px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/api/placeholder/800/600";
              }}
              onClick={(e) => e.stopPropagation()} // Extra protection against event bubbling
            />
            
            {/* Controls for the modal */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
              gap: 2
            }}>
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseExpandedImage();
                }}
                sx={{ 
                  textTransform: 'none',
                  minWidth: '120px',
                  fontWeight: 500
                }}
                disableElevation
              >
                Close
              </Button>
              <Button
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(expandedImage, '_blank');
                }}
                sx={{ 
                  textTransform: 'none',
                  minWidth: '120px',
                  fontWeight: 500,
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  color: theme.palette.common.white,
                  borderColor: alpha(theme.palette.common.white, 0.3),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    borderColor: alpha(theme.palette.common.white, 0.5),
                  }
                }}
              >
                Open in New Tab
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
const ClientDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const userId = localStorage.getItem("userId");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Page transition states
  const [pageVisible, setPageVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Simulate logout process with delay
    setTimeout(() => {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      navigate("/login");
    }, 5000);
  };

  // Navigation handlers with transitions
  const handleNavigation = (path) => {
    setPageVisible(false);
    setTimeout(() => {
      navigate(path);
    }, 400);
  };
  
  const handleJoinTeam = (eventId, e) => {
    e.stopPropagation();
    handleNavigation(`/join-team/${eventId}`);
  };
  
  const handleViewScores = (eventId, e) => {
    e.stopPropagation();
    handleNavigation(`/view-scores/${eventId}`);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Fetch events and student profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get("http://localhost:5000/api/events");
        setEvents(eventsResponse.data);
        
        if (userId) {
          const profileResponse = await axios.get(`http://localhost:5000/api/students/${userId}`);
          if (profileResponse.data?.name) {
            setStudentName(profileResponse.data.name);
          }
        }
        setLoading(false);
        
        // Trigger page transition in
        setTimeout(() => {
          setPageVisible(true);
        }, 100);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data.");
        setLoading(false);
        setPageVisible(true);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoggingOut) {
    return <LoadingScreen message="Logging you out" />;
  }

  if (loading) {
    return (
      <RootWrapper>
        <GlobalStyles />
        <FullScreenBackground />
        <BackgroundPattern />
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress 
              size={50} 
              thickness={4} 
              color="primary" 
              sx={{
                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: '50%',
                p: 0.5,
              }}
            />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 500, opacity: 0.9 }}>
              Loading your dashboard...
            </Typography>
          </Box>
        </Box>
      </RootWrapper>
    );
  }

  // Mock events data in case API doesn't return events
  const mockEvents = [
    {
      id: 1,
      title: "Sports Fest",
      location: "CCIS",
      description: "malingaw mong tanna",
      status: "open"
    },
    {
      id: 2,
      title: "Running",
      location: "Oval",
      description: "200dash",
      status: "open"
    },
    {
      id: 3,
      title: "Basketball Tournament",
      location: "Main Gym",
      description: "College basketball championship",
      status: "open"
    },
    {
      id: 4,
      title: "Volleyball Match",
      location: "CCIS Grounds",
      description: "Volleyball tournament finals",
      status: "open"
    }
  ];

  // Use mock data if no events from API
  const displayEvents = events.length > 0 ? events : mockEvents;

  return (
    <RootWrapper>
      <GlobalStyles />
      <CssBaseline />
      <FullScreenBackground />
      <BackgroundPattern />
      
      {/* App Bar */}
      <StyledAppBar position="sticky">
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Student Portal
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                width: 36, height: 36, mr: 1.5,
                boxShadow: `0 0 0 2px ${alpha(theme.palette.background.paper, 0.8)}`,
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/client-dashboard/student-profile/${userId}`)}
            >
              {studentName.charAt(0)}
            </Avatar>
            
            {!isMobile && (
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mr: 2, 
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { color: theme.palette.primary.main }
                }}
                onClick={() => navigate(`/client-dashboard/student-profile/${userId}`)}
              >
                {studentName}
              </Typography>
            )}
            
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              size="small"
              sx={{ 
                ml: 1,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <ContentScrollWrapper>
        <PageTransition isVisible={pageVisible}>
          <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
            {/* Error display */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={() => setError(null)}>
                    DISMISS
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {/* Welcome Section */}
            <WelcomeSection elevation={0}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  background: `linear-gradient(90deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome back, {studentName}!
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: '800px', opacity: 0.9, mb: 2 }}>
                Track your scores, view announcements, and stay connected with the latest activities.
              </Typography>

              {/* Quick Action Buttons */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <NavButton 
                  variant="contained" 
                  startIcon={<DashboardIcon />}
                  component={Link}
                  to="/student-dashboard"
                  disableElevation
                >
                  Dashboard
                </NavButton>
                <NavButton 
                  variant="outlined" 
                  startIcon={<PersonIcon />}
                  component={Link}
                  to={`/client-dashboard/student-profile/${userId}`}
                >
                  My Profile
                </NavButton>
                <NavButton 
                  variant="outlined" 
                 
                  color="secondary"
                  startIcon={<EventIcon />}
                  component={Link}
                  to="/event-registration"
                >
                  Register for Event
                </NavButton>
              {/* Route definition */}



              </Box>
            </WelcomeSection>

            {/* Dashboard Tabs */}
            <Paper elevation={0} sx={{ 
              mb: 4, 
              borderRadius: theme.shape.borderRadius * 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}>
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1.5,
                  },
                  '& .Mui-selected': {
                    fontWeight: 600
                  }
                }}
              >
                <Tab icon={<EventIcon />} label="My Events" iconPosition="start" />
                <Tab icon={<AnnouncementIcon />} label="Announcements" iconPosition="start" />
              </Tabs>
              
              {/* Events Tab */}
              <Box role="tabpanel" hidden={selectedTab !== 0} sx={{ p: 3 }}>
                {selectedTab === 0 && (
                  <>
                    <SectionHeading>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <EmojiEventsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        Available Events
                      </Typography>
                    </SectionHeading>
                    
                    <Grid container spacing={3}>
                      {displayEvents.map((event) => (
                        <Grid item xs={12} sm={6} md={4} key={event.id}>
                          <EventCard elevation={0}>
                            <EventHeader>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: theme.palette.primary.main,
                                    width: 32,
                                    height: 32,
                                    mr: 1.5
                                  }}
                                >
                                  <SportsSoccerIcon fontSize="small" />
                                </Avatar>
                                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                                  {event.title}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5, mb: 0.5 }}>
                                <LocationOnIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: '0.875rem' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {event.location}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                                <CalendarTodayIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: '0.875rem' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {event.date || "April 20-25, 2025"}
                                </Typography>
                              </Box>
                              
                              <Chip
                                size="small"
                                label={event.status === "open" ? "Registration Open" : "Registration Closed"}
                                color={event.status === "open" ? "success" : "error"}
                                sx={{ 
                                  position: 'absolute', 
                                  top: 12, 
                                  right: 12,
                                  fontWeight: 500,
                                  fontSize: '0.7rem'
                                }}
                              />
                            </EventHeader>
                            
                            <EventContent>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {event.description}
                              </Typography>
                            </EventContent>
                            
                            <EventFooter>
                              <ActionButton
                                size="small"
                                variant="contained"
                                disableElevation
                                color="primary"
                                startIcon={<GroupsIcon />}
                                onClick={(e) => handleJoinTeam(event.id, e)}
                                disabled={event.status !== "open"}
                              >
                                Join Team
                              </ActionButton>
                              
                              <ActionButton
                                size="small"
                                variant="outlined"
                                startIcon={<ScoreboardIcon />}
                                onClick={(e) => handleViewScores(event.id, e)}
                              >
                                Scores
                              </ActionButton>
                            </EventFooter>
                          </EventCard>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Box>
              
              {/* Announcements Tab */}
              <Box role="tabpanel" hidden={selectedTab !== 1} sx={{ p: 3 }}>
                {selectedTab === 1 && (
                  <Announcements userId={userId} />
                )}
              </Box>
            </Paper>
          </Container>
        </PageTransition>
      </ContentScrollWrapper>
      
      {/* Footer */}
      <Footer>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Student Portal System. All rights reserved.
        </Typography>
      </Footer>
    </RootWrapper>
  );
};

export default ClientDashboard;