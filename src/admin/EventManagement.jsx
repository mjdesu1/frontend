import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
  Tooltip,
  Alpha,
  Avatar,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Grid,
  Tabs,
  Tab,
  LinearProgress,
  Snackbar,
  Alert
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Event as EventIcon,
  Place as PlaceIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  SportsSoccer as SportsIcon,
  MusicNote as MusicIcon,
  School as EducationIcon,
  Computer as TechIcon,
  CheckCircle as OpenIcon,
  Cancel as ClosedIcon
} from "@mui/icons-material";

// Custom styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[10],
  },
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: '10px 24px',
  textTransform: 'none',
  transition: 'all 0.3s',
  fontWeight: 600,
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.6s',
  },
  '&:hover:before': {
    left: '100%',
  }
}));

const CategoryChip = styled(Chip)(({ theme, category }) => {
  const colors = {
    sports: { bg: '#E3F2FD', color: '#1565C0', icon: <SportsIcon fontSize="small" /> },
    music: { bg: '#FFF8E1', color: '#F57F17', icon: <MusicIcon fontSize="small" /> },
    education: { bg: '#E8F5E9', color: '#2E7D32', icon: <EducationIcon fontSize="small" /> },
    tech: { bg: '#E0F7FA', color: '#006064', icon: <TechIcon fontSize="small" /> }
  };
  return {
    backgroundColor: colors[category]?.bg || '#f0f0f0',
    color: colors[category]?.color || theme.palette.text.primary,
    fontWeight: 600,
    borderRadius: 8,
    '& .MuiChip-icon': {
      color: colors[category]?.color || theme.palette.text.primary,
    }
  };
});

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    open: { bg: '#E8F5E9', color: '#2E7D32', icon: <OpenIcon fontSize="small" /> },
    closed: { bg: '#FFEBEE', color: '#C62828', icon: <ClosedIcon fontSize="small" /> }
  };
  return {
    backgroundColor: colors[status]?.bg || '#f0f0f0',
    color: colors[status]?.color || theme.palette.text.primary,
    fontWeight: 600,
    borderRadius: 8,
    '& .MuiChip-icon': {
      color: colors[status]?.color || theme.palette.text.primary,
    }
  };
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    backgroundColor: theme.palette.background.paper,
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.1)'
    }
  }
}));

// Create a futuristic theme for 2030
const futuristicTheme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#7986cb',
      dark: '#303f9f',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          boxShadow: 'none',
          padding: '10px 24px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: '#f4f7fc',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Event Management Component
const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    category: "sports",
    status: "open",
    max_participants: "",
    admin_id: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/events");
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setNotification({
        open: true,
        message: 'Failed to load events',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEvent) {
        await axios.put(
          `http://localhost:5000/events/${editingEvent.id}`,
          eventData
        );
        setNotification({
          open: true,
          message: 'Event updated successfully',
          severity: 'success'
        });
      } else {
        await axios.post("http://localhost:5000/events", eventData);
        setNotification({
          open: true,
          message: 'Event created successfully',
          severity: 'success'
        });
      }
      fetchEvents();
      resetForm();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving event:", error);
      setNotification({
        open: true,
        message: `Failed to ${editingEvent ? 'update' : 'create'} event`,
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEventData({
      title: "",
      description: "",
      event_date: "",
      location: "",
      category: "sports",
      status: "open",
      max_participants: "",
      admin_id: "",
    });
    setEditingEvent(null);
  };

  const handleEdit = (event) => {
    setEventData(event);
    setEditingEvent(event);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/events/${id}`);
      fetchEvents();
      setNotification({
        open: true,
        message: 'Event deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      setNotification({
        open: true,
        message: 'Failed to delete event',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const filteredEvents = events
    .filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((event) => 
      filterCategory ? event.category === filterCategory : true
    )
    .filter((event) => 
      filterStatus ? event.status === filterStatus : true
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.event_date) - new Date(b.event_date);
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sports': return <SportsIcon />;
      case 'music': return <MusicIcon />;
      case 'education': return <EducationIcon />;
      case 'tech': return <TechIcon />;
      default: return <CategoryIcon />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ThemeProvider theme={futuristicTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            mb: 6, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center' 
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                backgroundImage: 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                mb: 1
              }}
            >
              Event Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Organize, track and manage your events efficiently
            </Typography>
          </Box>
          <AnimatedButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Create New Event
          </AnimatedButton>
        </Box>

        {/* Search and Filter Section */}
        <GlassCard sx={{ mb: 4, p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <SearchField
                fullWidth
                variant="outlined"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="sports">Sports</MenuItem>
                    <MenuItem value="music">Music</MenuItem>
                    <MenuItem value="education">Education</MenuItem>
                    <MenuItem value="tech">Tech</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    startAdornment={<SortIcon />}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </GlassCard>

        {/* Tabs for different views */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab label="Table View" icon={<FilterListIcon />} iconPosition="start" />
            <Tab label="Card View" icon={<Grid container />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Loading indicator */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Table View */}
        {currentTab === 0 && (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Details</TableCell>
                  <TableCell>Date & Location</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event) => (
                  <StyledTableRow key={event.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                          {event.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EventIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {formatDate(event.event_date)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PlaceIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {event.location}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <CategoryChip 
                        category={event.category}
                        label={event.category} 
                        icon={getCategoryIcon(event.category)}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusChip 
                        status={event.status}
                        label={event.status} 
                        icon={event.status === 'open' ? <OpenIcon /> : <ClosedIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {event.max_participants}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Event">
                        <IconButton 
                          color="primary"
                          onClick={() => handleEdit(event)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Event">
                        <IconButton 
                          color="error"
                          onClick={() => handleDelete(event.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </StyledTableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="h6" color="text.secondary">
                        No events found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try adjusting your search or filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Card View */}
        {currentTab === 1 && (
          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <CategoryChip 
                        category={event.category}
                        label={event.category} 
                        icon={getCategoryIcon(event.category)}
                      />
                      <StatusChip 
                        status={event.status}
                        label={event.status} 
                        icon={event.status === 'open' ? <OpenIcon /> : <ClosedIcon />}
                      />
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {formatDate(event.event_date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PlaceIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {event.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {event.max_participants} max participants
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(event)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(event.id)}
                        size="small"
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
            {filteredEvents.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary">
                    No events found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your search or filters
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Event Form Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
          transitionDuration={300}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="div" fontWeight={700}>
                {editingEvent ? "Edit Event" : "Create New Event"}
              </Typography>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    name="title"
                    value={eventData.title}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={eventData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date"
                    name="event_date"
                    type="date"
                    value={eventData.event_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Location"
                    name="location"
                    value={eventData.location}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={eventData.category}
                      onChange={handleChange}
                      label="Category"
                    >
                      <MenuItem value="sports">Sports</MenuItem>
                      <MenuItem value="music">Music</MenuItem>
                      <MenuItem value="education">Education</MenuItem>
                      <MenuItem value="tech">Tech</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={eventData.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Max Participants"
                    name="max_participants"
                    type="number"
                    value={eventData.max_participants}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Admin ID"
                    name="admin_id"
                    type="number"
                    value={eventData.admin_id}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit" variant="outlined">
              Cancel
            </Button>
            <AnimatedButton onClick={handleSubmit} color="primary" variant="contained">
              {editingEvent ? "Update Event" : "Create Event"}
            </AnimatedButton>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default EventManagement;