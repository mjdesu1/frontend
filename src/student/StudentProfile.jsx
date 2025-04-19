import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  Tooltip,
  Badge,
  Collapse,
  AvatarGroup
} from "@mui/material";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsIcon from "@mui/icons-material/Groups";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import StarIcon from "@mui/icons-material/Star";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", email: "", department: "" });
  const [currentTab, setCurrentTab] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  // Fetch user profile and teams
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${id}/profile`);
        setUser(response.data.user);
        setTeams(response.data.teams);
        
        // Pre-populate edit form
        setEditData({
          full_name: response.data.user.full_name,
          email: response.data.user.email,
          department: response.data.user.department || "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  // Handle edit dialog
  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    // Reset form data to current user data
    setEditData({
      full_name: user.full_name,
      email: user.email,
      department: user.department || "",
    });
  };

  // Save profile changes
  const handleEditSave = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${id}/profile`, editData);
      setUser(response.data.user);
      setEditOpen(false);
      showSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  // Handle photo upload dialog
  const handleUploadOpen = () => {
    setUploadOpen(true);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  // Upload profile photo
  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await axios.post(
        `http://localhost:5000/api/users/${id}/upload-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      clearInterval(interval);
      setUploadProgress(100);
      
      // Update user state with new photo
      setUser({
        ...user,
        photo: response.data.photo,
      });
      
      setTimeout(() => {
        setUploadOpen(false);
        showSuccess("Profile photo updated successfully!");
      }, 500);
      
    } catch (error) {
      console.error("Error uploading photo:", error);
      setUploadError("Failed to upload photo. Please try again.");
      setUploadProgress(0);
    }
  };

  // Show success message temporarily
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Get status chip color
  const getStatusColor = (status) => {
    return status === "active" ? "success" : "error";
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #334155, #0f172a)",
        pt: 4, pb: 6
      }}>
        <Container maxWidth="md">
          <Box sx={{ display: "flex", mb: 4 }}>
            <Skeleton variant="circular" width={120} height={120} />
            <Box sx={{ ml: 3, width: "100%" }}>
              <Skeleton variant="text" height={50} width="60%" />
              <Skeleton variant="text" height={30} width="40%" />
              <Skeleton variant="text" height={30} width="70%" />
            </Box>
          </Box>
          
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Container>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at top right, #334155, #0f172a)",
        p: 3
      }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          borderRadius: 2,
          textAlign: "center",
          maxWidth: 500
        }}>
          <WarningIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="error">
            Error Loading Profile
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/student-dashboard")}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: "relative",
      minHeight: "100vh",
      pt: 4,
      pb: 8,
      overflow: "hidden",
      "&:before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at top right, #334155, #0f172a)",
        zIndex: -2
      },
      "&:after": {
        content: '""',
        position: "absolute",
        top: -100,
        right: -100,
        width: 600,
        height: 600,
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05) 70%)",
        borderRadius: "50%",
        zIndex: -1
      }
    }}>
      <Container maxWidth="md">
        {/* Success message */}
        <Collapse in={!!success}>
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            action={
              <IconButton size="small" onClick={() => setSuccess(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {success}
          </Alert>
        </Collapse>
        
        {/* Back button */}
        <Box sx={{ mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            variant="contained" 
            color="primary"
            onClick={() => navigate("/student-dashboard")}
            sx={{ 
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)"
              },
              backdropFilter: "blur(8px)"
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Fade in={true} timeout={800}>
              <Card elevation={3} sx={{ 
                borderRadius: 3,
                overflow: "hidden",
                height: "100%",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
              }}>
                <Box 
                  sx={{ 
                    position: "relative",
                    pt: 8,
                    pb: 3,
                    textAlign: "center",
                    background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                    color: "white"
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <Tooltip title="Change Profile Photo">
                        <IconButton 
                          sx={{ 
                            bgcolor: "white",
                            "&:hover": {
                              bgcolor: theme.palette.grey[200]
                            }
                          }}
                          size="small"
                          onClick={handleUploadOpen}
                        >
                          <CameraAltIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <Avatar
                      src={
                        user.photo
                          ? `http://localhost:5000/uploads/${user.photo}`
                          : null
                      }
                      sx={{
                        width: 120,
                        height: 120,
                        border: "4px solid white",
                        margin: "0 auto",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        fontSize: 48
                      }}
                    >
                      {!user.photo && user.full_name.charAt(0)}
                    </Avatar>
                  </Badge>
                  
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                    {user.full_name}
                  </Typography>
                  
                  <Chip 
                    label={user.role || "Student"} 
                    color="secondary" 
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                
                <CardContent sx={{ pt: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <EmailIcon color="action" sx={{ mr: 2 }} />
                    <Typography variant="body1">{user.email}</Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <SchoolIcon color="action" sx={{ mr: 2 }} />
                    <Typography variant="body1">
                      {user.department || "Department not specified"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <GroupsIcon color="action" sx={{ mr: 2 }} />
                    <Typography variant="body1">
                      {teams.length} Teams Joined
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEditOpen}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          
          {/* Teams and Activities Section */}
          <Grid item xs={12} md={8}>
            <Fade in={true} timeout={1000}>
              <Card elevation={3} sx={{ 
                borderRadius: 3,
                overflow: "hidden",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
              }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    sx={{ 
                      "& .MuiTab-root": {
                        py: 2,
                        fontWeight: 500
                      }
                    }}
                  >
                    <Tab 
                      icon={<GroupsIcon />} 
                      iconPosition="start" 
                      label="My Teams" 
                    />
                    <Tab 
                      icon={<EventIcon />} 
                      iconPosition="start" 
                      label="Activities" 
                    />
                  </Tabs>
                </Box>
                
                {/* Teams Tab */}
                {currentTab === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Teams Joined
                      </Typography>
                      
                      <Tooltip title="Find Teams">
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => navigate("/browse-events")}
                        >
                          Join Team
                        </Button>
                      </Tooltip>
                    </Box>
                    
                    {teams.length > 0 ? (
                      <TableContainer 
                        component={Paper} 
                        sx={{ 
                          borderRadius: 2, 
                          overflow: "hidden",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          mt: 2
                        }}
                      >
                        <Table>
                          <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                            <TableRow>
                              <TableCell><strong>Team Name</strong></TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <EventIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  <strong>Event</strong>
                                </Box>
                              </TableCell>
                              {!isMobile && (
                                <>
                                  <TableCell align="center"><strong>Status</strong></TableCell>
                                  <TableCell align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <PeopleAltIcon fontSize="small" sx={{ mr: 0.5 }} />
                                      <strong>Members</strong>
                                    </Box>
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {teams.map((team) => (
                              <TableRow 
                                key={team.team_id}
                                sx={{ 
                                  "&:hover": { bgcolor: "#f9fafb" },
                                  transition: "background-color 0.2s"
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    {team.is_captain && (
                                      <Tooltip title="Team Captain">
                                        <StarIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
                                      </Tooltip>
                                    )}
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {team.team_name}
                                    </Typography>
                                  </Box>
                                  {isMobile && (
                                    <Box sx={{ display: "flex", mt: 1 }}>
                                      <Chip 
                                        label={team.status}
                                        size="small"
                                        color={getStatusColor(team.status)}
                                        variant="outlined"
                                        sx={{ mr: 1 }}
                                      />
                                      <Typography variant="body2" color="text.secondary">
                                        {team.current_members}/{team.max_members} members
                                      </Typography>
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="View Event Details">
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        cursor: "pointer", 
                                        "&:hover": { textDecoration: "underline" } 
                                      }}
                                      onClick={() => navigate(`/event/${team.event_id}`)}
                                    >
                                      {team.event_title}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                {!isMobile && (
                                  <>
                                    <TableCell align="center">
                                      <Chip 
                                        label={team.status}
                                        size="small"
                                        color={getStatusColor(team.status)}
                                        icon={team.status === "active" ? <CheckCircleIcon /> : <CancelIcon />}
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <AvatarGroup max={3} sx={{ mb: 1 }}>
                                          {Array.from({ length: team.current_members }, (_, i) => (
                                            <Avatar 
                                              key={i} 
                                              sx={{ width: 24, height: 24 }}
                                              alt={`Team Member ${i+1}`}
                                            >
                                              {String.fromCharCode(65 + i)}
                                            </Avatar>
                                          ))}
                                        </AvatarGroup>
                                        <Typography variant="body2" color="text.secondary">
                                          {team.current_members}/{team.max_members}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                  </>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 4, 
                          borderRadius: 2, 
                          bgcolor: "rgba(245, 247, 250, 0.7)",
                          textAlign: "center",
                          border: `1px dashed ${theme.palette.grey[300]}`,
                          mt: 2
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          Not Part of Any Team
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          You haven't joined any teams yet.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => navigate("/browse-events")}
                        >
                          Browse Events & Join Teams
                        </Button>
                      </Paper>
                    )}
                  </Box>
                )}
                
                {/* Activities Tab */}
                {currentTab === 1 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Recent Activities
                    </Typography>
                    
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 4, 
                        borderRadius: 2, 
                        bgcolor: "rgba(245, 247, 250, 0.7)",
                        textAlign: "center",
                        border: `1px dashed ${theme.palette.grey[300]}`
                      }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        Activity tracking will be available in future updates.
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={handleEditClose}
        PaperProps={{ 
          sx: { 
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)"
          } 
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Profile Information
          </Box>
          <IconButton 
            onClick={handleEditClose}
            sx={{ color: "white" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Department"
                variant="outlined"
                fullWidth
                value={editData.department}
                onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ mr: 1, color: "action.active" }} />
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleEditClose} 
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained" 
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Photo Dialog */}
      <Dialog 
        open={uploadOpen} 
        onClose={handleUploadClose}
        PaperProps={{ 
          sx: { 
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)" 
          } 
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PhotoCameraIcon sx={{ mr: 1 }} />
            Update Profile Photo
          </Box>
          <IconButton 
            onClick={handleUploadClose}
            sx={{ color: "white" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, textAlign: "center" }}>
          <Box sx={{ 
            border: `2px dashed ${theme.palette.grey[300]}`,
            borderRadius: 2,
            p: 3,
            mb: 3,
            bgcolor: theme.palette.grey[50]
          }}>
            {selectedFile ? (
              <Box>
                <Avatar
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  sx={{ width: 120, height: 120, margin: "0 auto", mb: 2 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {selectedFile.name}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  Drop your image here or click to browse
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Recommended size: 500x500 pixels
                </Typography>
              </Box>
            )}
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                sx={{ mt: 2 }}
                startIcon={<PhotoCameraIcon />}
              >
                Select Photo
              </Button>
            </label>
          </Box>
          
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          
          {uploadProgress > 0 && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Uploading: {uploadProgress}%
              </Typography>
              <Box 
                sx={{ 
                  height: 4, 
                  borderRadius: 2, 
                  bgcolor: theme.palette.grey[200],
                  overflow: "hidden"
                }}
              >
                <Box 
                  sx={{ 
                    width: `${uploadProgress}%`, 
                    height: '100%', 
                    bgcolor: theme.palette.primary.main,
                    transition: 'width 0.5s ease'
                  }} 
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleUploadClose} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUploadPhoto} 
            variant="contained" 
            color="primary"
            disabled={!selectedFile || uploadProgress > 0}
            startIcon={<CloudUploadIcon />}
          >
            Upload Photo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProfile;