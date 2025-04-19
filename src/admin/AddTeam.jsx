import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Divider,
  Alert,
  Snackbar,
  List,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  styled,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Close,
  EventNote,
  Group,
  Photo,
  Add,
  FilterList,
  Refresh,
  Save,
  CloudUpload,
} from "@mui/icons-material";

// Styled components for enhanced UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(4),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '6px',
    background: 'linear-gradient(90deg, #2196f3, #673ab7)',
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  transition: 'transform 0.3s, box-shadow 0.3s',
  overflow: 'visible',
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  minHeight: 64,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  }
}));

const VisuallyStrongButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  padding: 10,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  '&.delete': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.error.main, 0.2),
    }
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    }
  }
}));

const PhotoUploadButton = styled('label')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: '12px 20px',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: `1px dashed ${theme.palette.primary.main}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

const PreviewImage = styled('img')({
  width: '100%',
  maxHeight: 240,
  objectFit: 'contain',
  borderRadius: 8,
  marginTop: 16,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
});

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: 6,
  fontWeight: 600,
  height: 30
}));

const TeamAndAnnouncementManager = () => {
  const theme = useTheme();
  
  // Shared state
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get admin ID from localStorage
  const userId = localStorage.getItem("userId");
  
  // Optional: Get JWT token for authenticated requests
  const token = localStorage.getItem("token");
  
  // Create axios instance with authorization header if token exists
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // Team form state
  const [eventId, setEventId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [maxMembers, setMaxMembers] = useState("");

  // Announcement form state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementEventId, setAnnouncementEventId] = useState("");
  const [announcementTeamId, setAnnouncementTeamId] = useState("");
  const [announcementPhoto, setAnnouncementPhoto] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  
  // Edit and delete modal state
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchEvents();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    // Fetch teams when an event is selected for announcements
    if (announcementEventId) {
      fetchTeams(announcementEventId);
    }
  }, [announcementEventId]);

  useEffect(() => {
    // Filter announcements when search term changes
    if (searchTerm.trim() === "") {
      setFilteredAnnouncements(announcements);
    } else {
      const filtered = announcements.filter(
        announcement => 
          announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (announcement.team_name && announcement.team_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAnnouncements(filtered);
    }
  }, [searchTerm, announcements]);

  // When an image is selected, create a preview
  useEffect(() => {
    if (announcementPhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(announcementPhoto);
    } else if (!announcementPhoto && !existingPhotoUrl) {
      setPhotoPreview("");
    }
  }, [announcementPhoto]);

  const fetchEvents = () => {
    setLoading(true);
    api.get("/events")
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        showNotification("Failed to load events", "error");
        setLoading(false);
      });
  };

  const fetchTeams = (eventId) => {
    setLoading(true);
    api.get(`/events/${eventId}/teams`)
      .then((response) => {
        setTeams(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching teams:", error);
        showNotification("Failed to load teams", "error");
        setLoading(false);
      });
  };

  const fetchAnnouncements = () => {
    setLoading(true);
    api.get("/announcements")
      .then((response) => {
        setAnnouncements(response.data);
        setFilteredAnnouncements(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching announcements:", error);
        showNotification("Failed to load announcements", "error");
        setLoading(false);
      });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset edit mode when switching tabs
    if (isEditMode && newValue !== 1) {
      resetAnnouncementForm();
    }
  };
  
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Team form handlers
  const handleAddTeam = () => {
    // Basic validation
    if (!eventId || !teamName || !maxMembers) {
      showNotification("Please fill all required fields", "error");
      return;
    }
    
    setLoading(true);
    api.post("/teams", {
      event_id: eventId,
      team_name: teamName,
      max_members: maxMembers,
      created_by: userId,
    })
    .then(() => {
      showNotification("Team added successfully!");
      // Reset form fields
      setEventId("");
      setTeamName("");
      setMaxMembers("");
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error adding team:", error);
      showNotification(
        "Error adding team: " +
          (error.response?.data?.error || "Unknown error"),
        "error"
      );
      setLoading(false);
    });
  };

  // Announcement form handlers
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAnnouncementPhoto(e.target.files[0]);
      setExistingPhotoUrl(""); // Clear existing photo URL when new photo is selected
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setAnnouncementEventId("");
    setAnnouncementTeamId("");
    setAnnouncementPhoto(null);
    setExistingPhotoUrl("");
    setPhotoPreview("");
    setIsEditMode(false);
    setCurrentAnnouncementId(null);
  };

  const handleEditAnnouncement = (announcement) => {
    setActiveTab(1); // Switch to announcement tab
    setIsEditMode(true);
    setCurrentAnnouncementId(announcement.id);
    setAnnouncementTitle(announcement.title);
    setAnnouncementContent(announcement.content);
    setAnnouncementEventId(announcement.event_id);
    
    // Set team ID if it exists
    setAnnouncementTeamId(announcement.team_id || "");
    
    // Load teams for the selected event
    fetchTeams(announcement.event_id);
    
    // Set existing photo URL if it exists
    if (announcement.photo_url) {
      setExistingPhotoUrl(announcement.photo_url);
      setPhotoPreview(announcement.photo_url);
    } else {
      setExistingPhotoUrl("");
      setPhotoPreview("");
    }
    
    // Reset file input
    setAnnouncementPhoto(null);
  };

  const handleDeleteClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!announcementToDelete) return;
    
    setLoading(true);
    api.delete(`/announcements/${announcementToDelete.id}`)
      .then(() => {
        showNotification("Announcement deleted successfully!");
        fetchAnnouncements(); // Refresh the announcements list
        setDeleteDialogOpen(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error deleting announcement:", error);
        showNotification(
          "Error deleting announcement: " +
            (error.response?.data?.error || "Unknown error"),
          "error"
        );
        setLoading(false);
      });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
  };

  const handleRefreshData = () => {
    fetchAnnouncements();
    fetchEvents();
  };

  const handleSubmitAnnouncement = () => {
    // Basic validation
    if (!announcementTitle || !announcementContent || !announcementEventId) {
      showNotification("Please fill all required fields", "error");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("title", announcementTitle);
    formData.append("content", announcementContent);
    formData.append("admin_id", userId);
    formData.append("event_id", announcementEventId);
    
    if (announcementTeamId) {
      formData.append("team_id", announcementTeamId);
    }
    
    if (announcementPhoto) {
      formData.append("photo", announcementPhoto);
    }

    // If editing, include the existing photo URL unless a new photo was selected
    if (isEditMode) {
      if (existingPhotoUrl && !announcementPhoto) {
        formData.append("keep_existing_photo", "true");
      }
      
      api.put(`/announcements/${currentAnnouncementId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        showNotification("Announcement updated successfully!");
        fetchAnnouncements(); // Refresh the list
        resetAnnouncementForm();
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error updating announcement:", error);
        showNotification(
          "Error updating announcement: " +
            (error.response?.data?.error || "Unknown error"),
          "error"
        );
        setLoading(false);
      });
    } else {
      // Creating a new announcement
      api.post("/announcements", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        showNotification("Announcement posted successfully!");
        fetchAnnouncements(); // Refresh the list
        resetAnnouncementForm();
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error posting announcement:", error);
        showNotification(
          "Error posting announcement: " +
            (error.response?.data?.error || "Unknown error"),
          "error"
        );
        setLoading(false);
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <StyledPaper elevation={3}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main,
            mb: 4,
            background: 'linear-gradient(90deg, #2196f3, #673ab7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}
        >
          Team & Announcement Manager
        </Typography>

        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 4,
          borderRadius: '16px',
          overflow: 'hidden',
          background: alpha(theme.palette.background.paper, 0.8),
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            centered
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '2px 2px 0 0',
                background: 'linear-gradient(90deg, #2196f3, #673ab7)',
              },
            }}
          >
            <StyledTab icon={<Add />} iconPosition="start" label="Add Team" />
            <StyledTab 
              icon={isEditMode ? <Edit /> : <EventNote />} 
              iconPosition="start" 
              label={isEditMode ? "Edit Announcement" : "Post Announcement"} 
            />
            <StyledTab icon={<Group />} iconPosition="start" label="Manage Announcements" />
          </Tabs>
        </Box>

        {/* Add Team Form */}
        {activeTab === 0 && (
          <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
              Create New Team
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel id="team-event-select-label">Event</InputLabel>
              <Select
                labelId="team-event-select-label"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>Select an Event</em>
                </MenuItem>
                {events.map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Team Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              label="Max Members"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <ActionButton
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4 }}
              onClick={handleAddTeam}
              disabled={loading}
              startIcon={<Add />}
            >
              {loading ? "Creating Team..." : "Create Team"}
            </ActionButton>
          </Box>
        )}

        {/* Post/Edit Announcement Form */}
        {activeTab === 1 && (
          <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {isEditMode ? "Edit Announcement" : "Create New Announcement"}
              </Typography>
              {isEditMode && (
                <Tooltip title="Cancel Edit">
                  <Button 
                    variant="outlined" 
                    startIcon={<Close />} 
                    onClick={resetAnnouncementForm}
                    sx={{ borderRadius: 8 }}
                  >
                    Cancel
                  </Button>
                </Tooltip>
              )}
            </Box>
            
            <TextField
              label="Announcement Title"
              variant="outlined"
              fullWidth
              margin="normal"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              label="Announcement Content"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="announcement-event-select-label">Event</InputLabel>
                  <Select
                    labelId="announcement-event-select-label"
                    value={announcementEventId}
                    onChange={(e) => setAnnouncementEventId(e.target.value)}
                    required
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>Select an Event</em>
                    </MenuItem>
                    {events.map((event) => (
                      <MenuItem key={event.id} value={event.id}>
                        {event.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="announcement-team-select-label">Team (Optional)</InputLabel>
                  <Select
                    labelId="announcement-team-select-label"
                    value={announcementTeamId}
                    onChange={(e) => setAnnouncementTeamId(e.target.value)}
                    disabled={!announcementEventId}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>All Teams</em>
                    </MenuItem>
                    {teams.map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        {team.team_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Announcement Photo {isEditMode ? "(Leave empty to keep existing)" : "(Optional)"}
              </Typography>
              
              <input
                accept="image/*"
                id="announcement-photo-input"
                type="file"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              
              <PhotoUploadButton htmlFor="announcement-photo-input">
                <CloudUpload />
                <span>{announcementPhoto ? announcementPhoto.name : "Choose an image"}</span>
              </PhotoUploadButton>
              
              {(photoPreview || existingPhotoUrl) && (
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <PreviewImage
                    src={photoPreview || existingPhotoUrl}
                    alt="Photo preview"
                  />
                  <IconButton
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                    }}
                    onClick={() => {
                      setAnnouncementPhoto(null);
                      setPhotoPreview("");
                      setExistingPhotoUrl("");
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              )}
            </Box>

            <ActionButton
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4 }}
              onClick={handleSubmitAnnouncement}
              disabled={loading}
              startIcon={isEditMode ? <Save /> : <EventNote />}
            >
              {loading 
                ? (isEditMode ? "Updating..." : "Posting...") 
                : (isEditMode ? "Update Announcement" : "Post Announcement")}
            </ActionButton>
          </Box>
        )}
        
        {/* Manage Announcements Tab */}
        {activeTab === 2 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Manage Announcements
              </Typography>
              
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefreshData} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            
            <SearchField
              label="Search Announcements"
              variant="outlined"
              fullWidth
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm("")}>
                      <Close />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" color="textSecondary">
                  Loading announcements...
                </Typography>
              </Box>
            ) : filteredAnnouncements.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6, 
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                borderRadius: 2,
                mt: 2
              }}>
                <Typography variant="body1" color="textSecondary">
                  No announcements found
                </Typography>
              </Box>
            ) : (
              <List sx={{ mt: 2 }}>
              {filteredAnnouncements.map((announcement) => (
  <StyledCard key={announcement.id} sx={{ mb: 2, borderRadius: 2 }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ maxWidth: 'calc(100% - 90px)' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5, lineHeight: 1.2 }}>
            {announcement.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
            <StatusChip 
              size="small" 
              label={announcement.event_name}
              color="primary"
              icon={<EventNote sx={{ fontSize: '0.75rem' }} />}
              sx={{ height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
            />
            {announcement.team_name && (
              <StatusChip 
                size="small" 
                label={announcement.team_name}
                color="secondary"
                icon={<Group sx={{ fontSize: '0.75rem' }} />}
                sx={{ height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ width: 20, height: 20, mr: 0.5, fontSize: '0.7rem', bgcolor: theme.palette.primary.main }}
            >
              {announcement.admin_name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
              {announcement.admin_name} • {formatDate(announcement.created_at)}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mt: 1, mb: 0.5, fontSize: '0.85rem', lineHeight: 1.4 }}>
            {announcement.content.length > 120 
              ? `${announcement.content.substring(0, 120)}...` 
              : announcement.content}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5, zIndex: 2, position: 'relative' }}>
          <Tooltip title="Edit Announcement">
            <VisuallyStrongButton
              aria-label="edit"
              onClick={() => handleEditAnnouncement(announcement)}
              size="small"
              sx={{ p: 1 }}
            >
              <Edit fontSize="small" />
            </VisuallyStrongButton>
          </Tooltip>
          <Tooltip title="Delete Announcement">
            <VisuallyStrongButton
              className="delete"
              aria-label="delete"
              onClick={() => handleDeleteClick(announcement)}
              size="small"
              sx={{ p: 1 }}
            >
              <Delete fontSize="small" />
            </VisuallyStrongButton>
          </Tooltip>
        </Box>
      </Box>
      
      {announcement.photo_url && (
        <CardMedia
          component="img"
          sx={{
            mt: 1,
            height: 100,
            width: '100%',
            objectFit: 'cover',
            borderRadius: 1,
          }}
          image={announcement.photo_url}
          alt={announcement.title}
        />
      )}
      
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, fontSize: '0.7rem' }}>
        Last updated: {formatDate(announcement.updated_at || announcement.created_at)}
      </Typography>
    </CardContent>
  </StyledCard>
              ))}       
              </List>
            )}
          </Box>
        )}
      </StyledPaper>
      
      {/* Confirmation Dialog for Deletion */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the announcement "{announcementToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            startIcon={<Delete />}
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeamAndAnnouncementManager;