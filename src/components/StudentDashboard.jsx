import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Avatar,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Button,
  IconButton
} from "@mui/material";
import { 
  EventAvailable as EventIcon, 
  Groups as TeamIcon,
  Dashboard as DashboardIcon,
  ArrowUpward as TrendUpIcon,
  School as SchoolIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from "@mui/icons-material";

import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Background design component
const BackgroundDesign = () => (
  <>
    <Box
      sx={{
        position: "fixed",
        top: "10%",
        left: "5%",
        width: "20vw",
        height: "20vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0) 70%)",
        filter: "blur(40px)",
        zIndex: 0,
      }}
    />
    <Box
      sx={{
        position: "fixed",
        bottom: "15%",
        right: "10%",
        width: "25vw",
        height: "25vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0) 70%)",
        filter: "blur(45px)",
        zIndex: 0,
      }}
    />
    <Box
      sx={{
        position: "fixed",
        top: "40%",
        right: "25%",
        width: "15vw",
        height: "15vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0) 70%)",
        filter: "blur(35px)",
        zIndex: 0,
      }}
    />
  </>
);

// Loading screen component
const LoadingScreen = ({ message }) => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #0a1929, #1e3a8a)",
      zIndex: 9999,
    }}
  >
    <BackgroundDesign />
    <Box sx={{ position: "relative" }}>
      <CircularProgress 
        size={80} 
        thickness={4} 
        sx={{ 
          color: "#60a5fa",
          animation: "pulse 1.5s infinite ease-in-out",
          "@keyframes pulse": {
            "0%": { opacity: 0.6 },
            "50%": { opacity: 1 },
            "100%": { opacity: 0.6 }
          }
        }} 
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SchoolIcon sx={{ fontSize: 32, color: "#fff" }} />
      </Box>
    </Box>
    <Typography 
      variant="h6" 
      sx={{ mt: 3, color: "#fff", fontWeight: 500 }}
    >
      {message || "Loading..."}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}
    >
      Preparing your dashboard
    </Typography>
  </Box>
);

// Main component
const StudentDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const studentId = localStorage.getItem("userId");
  const [stats, setStats] = useState({
    events_registered: 0,
    teams_joined: 0,
    student_name: "Loading...",
    profile_completed: 0,
    academicYear: "Undergraduate",
    eventsParticipated: 0
  });
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageTransition, setPageTransition] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle logout with transition
  const handleLogout = () => {
    setPageTransition(true);
    setTimeout(() => {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      navigate("/login");
    }, 1000);
  };

  // Fetch dashboard statistics
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/student-dashboard/${studentId}`)
      .then((response) => {
        setStats({
          ...response.data,
          student_name: response.data.student_name || "Student User",
          profile_completed: response.data.profile_completed || 75,
          academicYear: response.data.academicYear || "Undergraduate",
          eventsParticipated: response.data.eventsParticipated || 0
        });
        setLoading(false);
        setTimeout(() => setDataLoaded(true), 500);
      })
      .catch((error) => {
        console.error("Error fetching student dashboard stats:", error);
        setError("Failed to load dashboard stats.");
        setLoading(false);
      });
  }, [studentId]);

  // Fetch events
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  // Fetch teams for each event
  useEffect(() => {
    events.forEach((event) => {
      axios
        .get(`http://localhost:5000/api/events/${event.id}/teams`)
        .then((response) => {
          setTeams((prevTeams) => ({
            ...prevTeams,
            [event.id]: response.data,
          }));
        })
        .catch((error) =>
          console.error(`Error fetching teams for event ${event.id}:`, error)
        );
    });
  }, [events]);

  if (loading || pageTransition) {
    return <LoadingScreen message={pageTransition ? "Logging out..." : "Loading your dashboard"} />;
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #0a1929, #1e3a8a)",
          padding: 3
        }}
      >
        <BackgroundDesign />
        <Alert 
          severity="error" 
          variant="filled" 
          sx={{ 
            width: "100%", 
            maxWidth: 500,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)"
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Chart data and options
  const lineChartData = {
    labels: events.map((event) => event.title),
    datasets: [{
      label: "Teams Joined",
      data: events.map((event) => teams[event.id] ? teams[event.id].length : 0),
      borderColor: "#60a5fa",
      backgroundColor: "rgba(96, 165, 250, 0.2)",
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "#60a5fa",
    }],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#e2e8f0', font: { family: 'Roboto', size: 12 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: '#e2e8f0', bodyColor: '#e2e8f0',
        borderColor: '#334155', borderWidth: 1, padding: 12,
        cornerRadius: 8, displayColors: false
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const barChartData = {
    labels: events.map((event) => event.title),
    datasets: [{
      label: "Max Team Size",
      data: events.map((event) => teams[event.id] ? 
        Math.max(...teams[event.id].map((team) => team.max_members || 0), 0) : 0),
      backgroundColor: "rgba(34, 197, 94, 0.6)",
      borderColor: "rgba(34, 197, 94, 1)",
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const barChartOptions = { ...lineChartOptions };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0a1929, #1e3a8a)",
        color: "#fff",
        padding: { xs: 2, sm: 3 },
        overflowX: "hidden",
      }}
    >
      <BackgroundDesign />
      
      {/* Mobile Menu */}
      {isMobile && (
        <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 100 }}>
          <IconButton 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            sx={{ color: "#fff", background: "rgba(30, 41, 59, 0.7)" }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      )}
      
      {mobileMenuOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(8px)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Avatar
            sx={{
              width: 80, height: 80, bgcolor: "#60a5fa", 
              fontSize: 32, fontWeight: 700, mb: 2,
              border: "4px solid rgba(96, 165, 250, 0.3)",
            }}
          >
            {stats.student_name.charAt(0)}
          </Avatar>
          <Typography variant="h5" fontWeight={700} mb={4}>
            {stats.student_name}
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<DashboardIcon />} 
            fullWidth 
            sx={{ mb: 2, borderRadius: 2 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<EventIcon />} 
            fullWidth 
            sx={{ mb: 2, borderRadius: 2, color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
          >
            Events
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<TeamIcon />} 
            fullWidth 
            sx={{ mb: 2, borderRadius: 2, color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
          >
            Teams
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<LogoutIcon />} 
            fullWidth 
            sx={{ mt: 4, borderRadius: 2 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      )}

      <Container maxWidth="xl">
        <Fade in={dataLoaded} timeout={800}>
          <Box>
            {/* Header with Profile and Logout */}
            <Box
              sx={{
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                mb: 2
              }}
            >
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Campus Connect
              </Typography>
              {!isMobile && (
                <Button 
                  variant="text" 
                  startIcon={<LogoutIcon />} 
                  size="small" 
                  onClick={handleLogout}
                  sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}
                >
                  Logout
                </Button>
              )}
            </Box>
            
            {/* Profile Card */}
            <Paper
              elevation={0}
              sx={{
                background: "rgba(30, 41, 59, 0.7)",
                backdropFilter: "blur(10px)",
                borderRadius: 4,
                overflow: "hidden",
                mb: 3,
                border: "1px solid rgba(148, 163, 184, 0.1)",
                transition: "transform 0.3s",
                "&:hover": { transform: "translateY(-5px)" }
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "center", sm: "flex-start" },
                  gap: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    bgcolor: "#60a5fa",
                    fontSize: { xs: 32, md: 40 },
                    fontWeight: 700,
                    border: "4px solid rgba(96, 165, 250, 0.3)",
                  }}
                >
                  {stats.student_name.charAt(0)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{
                      mb: 1,
                      fontSize: { xs: "1.75rem", md: "2.5rem" },
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    Welcome, {stats.student_name.split(" ")[0]}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      color: "#94a3b8",
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    Here's an overview of your campus engagement activities.
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: { xs: "center", sm: "flex-start" },
                    }}
                  >
                    <Chip
                      icon={<DashboardIcon />}
                      label="Dashboard"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip
                      icon={<SchoolIcon />}
                      label={stats.academicYear}
                      variant="outlined"
                      sx={{ color: "#60a5fa", borderColor: "#60a5fa" }}
                    />
                    <Chip
                      icon={<EventIcon />}
                      label={`${stats.eventsParticipated} Events`}
                      variant="outlined"
                      sx={{ color: "#34d399", borderColor: "#34d399" }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Fade in={dataLoaded} timeout={900}>
                  <Card 
                    sx={{ 
                      background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                      color: "#fff",
                      borderRadius: 4,
                      height: "100%",
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                      overflow: "hidden",
                      position: "relative",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-5px)" }
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: "absolute", 
                        top: -20, 
                        right: -20, 
                        opacity: 0.1, 
                        fontSize: 160
                      }}
                    >
                      <EventIcon fontSize="inherit" />
                    </Box>
                    <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", mr: 1 }}>
                          <EventIcon />
                        </Avatar>
                        <Typography variant="h6">Events Registered</Typography>
                      </Box>
                      <Typography variant="h3" fontWeight={700}>{stats.events_registered}</Typography>
                      <Box 
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          mt: 2,
                          color: "#a5f3fc"
                        }}
                      >
                        <TrendUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">Keep going!</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Fade in={dataLoaded} timeout={1000}>
                  <Card 
                    sx={{ 
                      background: "linear-gradient(135deg, #16a34a, #22c55e)",
                      color: "#fff",
                      borderRadius: 4,
                      height: "100%",
                      boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)",
                      overflow: "hidden",
                      position: "relative",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-5px)" }
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: "absolute", 
                        top: -20, 
                        right: -20, 
                        opacity: 0.1, 
                        fontSize: 160
                      }}
                    >
                      <TeamIcon fontSize="inherit" />
                    </Box>
                    <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", mr: 1 }}>
                          <TeamIcon />
                        </Avatar>
                        <Typography variant="h6">Teams Joined</Typography>
                      </Box>
                      <Typography variant="h3" fontWeight={700}>{stats.teams_joined}</Typography>
                      <Box 
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          mt: 2,
                          color: "#bbf7d0"
                        }}
                      >
                        <TrendUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">Great teamwork!</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Fade in={dataLoaded} timeout={1100}>
                  <Card 
                    sx={{ 
                      background: "rgba(30, 41, 59, 0.7)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 4,
                      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)",
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-5px)" }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        gutterBottom
                        sx={{ color: "#f1f5f9" }}
                      >
                        Teams Joined per Event
                      </Typography>
                      <Divider sx={{ mb: 2, bgcolor: "rgba(148, 163, 184, 0.1)" }} />
                      <Box sx={{ height: 300, mt: 2 }}>
                        <Line data={lineChartData} options={lineChartOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Fade in={dataLoaded} timeout={1200}>
                  <Card 
                    sx={{ 
                      background: "rgba(30, 41, 59, 0.7)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 4,
                      boxShadow: "0 10px 25px rgba(15, 23, 42, 0.2)",
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-5px)" }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        gutterBottom
                        sx={{ color: "#f1f5f9" }}
                      >
                        Max Team Size per Event
                      </Typography>
                      <Divider sx={{ mb: 2, bgcolor: "rgba(148, 163, 184, 0.1)" }} />
                      <Box sx={{ height: 300, mt: 2 }}>
                        <Bar data={barChartData} options={barChartOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>

            {/* Upcoming Events Section */}
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ mb: 3, color: "#f1f5f9" }}
            >
              Your Upcoming Events
            </Typography>
            {events.length > 0 ? (
              <Grid container spacing={2}>
                {events.slice(0, 3).map((event, index) => (
                  <Grid item xs={12} md={4} key={event.id || index}>
                    <Fade in={dataLoaded} timeout={1300 + index * 100}>
                      <Card 
                        sx={{ 
                          background: "rgba(30, 41, 59, 0.7)",
                          backdropFilter: "blur(10px)",
                          borderRadius: 3,
                          overflow: "hidden",
                          border: "1px solid rgba(148, 163, 184, 0.1)",
                          transition: "transform 0.3s, box-shadow 0.3s",
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            height: 6, 
                            background: "linear-gradient(90deg, #3b82f6, #60a5fa)"
                          }} 
                        />
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                            {event.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ color: "#94a3b8", mb: 2 }}
                          >
                            {event.date || "Upcoming"} • {event.location || "TBD"}
                          </Typography>
                          <Box 
                            sx={{ 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "space-between"
                            }}
                          >
                            <Chip 
                              label={event.category || "Event"}
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                              Teams: {teams[event.id]?.length || 0}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  background: "rgba(30, 41, 59, 0.7)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 4,
                  p: 4,
                  textAlign: "center",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                }}
              >
                <Typography variant="body1" sx={{ color: "#94a3b8" }}>
                  No upcoming events found.
                </Typography>
              </Paper>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default StudentDashboard;