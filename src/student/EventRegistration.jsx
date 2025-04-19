import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Box, Typography, Button, Table, TableHead, TableRow,
  TableCell, TableBody, TextField, MenuItem, FormControl,
  InputLabel, Select, Paper, Chip, Alert, Stack, IconButton,
  CircularProgress, Divider, Tooltip, Fade, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import { 
  EventAvailable, Paid, AccessTime, LocalHospital, 
  ContactPhone, VerifiedUser, Refresh, Add, Edit, Delete, Close
} from "@mui/icons-material";

// Configure axios with base URL
axios.defaults.baseURL = "http://localhost:5000/api";

const EventRegistration = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [studentId, setStudentId] = useState("");
  const [registrationData, setRegistrationData] = useState({
    emergencyContact: "",
    medicalConditions: "",
    proofOfIdentity: ""
  });
  const [loading, setLoading] = useState({
    events: false,
    participants: false,
    registration: false,
    update: false,
    delete: false
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "info",
    message: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    participantId: null
  });

  // Load student ID from localStorage on mount
  useEffect(() => {
    const storedStudentId = localStorage.getItem("userId");
    if (storedStudentId) {
      setStudentId(storedStudentId);
      fetchEvents();
      fetchParticipants(storedStudentId);
    } else {
      showNotification("error", "Student ID is missing. Please log in again.");
    }
  }, []);

  // Display notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ ...notification, show: false }), 5000);
  };

  // Handle form data changes
  const handleDataChange = (field, value) => {
    setRegistrationData({ ...registrationData, [field]: value });
  };

  // Fetch all events
  const fetchEvents = async () => {
    setLoading({ ...loading, events: true });
    try {
      const response = await axios.get("/events");
      setEvents(response.data);
    } catch (error) {
      showNotification("error", "Failed to load events");
      console.error("Error fetching events:", error);
    } finally {
      setLoading({ ...loading, events: false });
    }
  };

  // Fetch participants for the logged-in student
  const fetchParticipants = async (id = studentId) => {
    if (!id) {
      showNotification("error", "Student ID is missing");
      return;
    }

    setLoading({ ...loading, participants: true });
    try {
      const response = await axios.get("/event-participants", {
        headers: { "student-id": id }
      });
      setParticipants(response.data);
    } catch (error) {
      showNotification("error", "Failed to load your registrations");
      console.error("Error fetching participants:", error);
    } finally {
      setLoading({ ...loading, participants: false });
    }
  };

  // Set up edit mode
  const handleEdit = (participant) => {
    setEditMode(true);
    setEditId(participant.id);
    setSelectedEvent(participant.event_id);
    setRegistrationData({
      emergencyContact: participant.emergency_contact,
      medicalConditions: participant.medical_conditions || "",
      proofOfIdentity: participant.proof_of_identity || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setSelectedEvent("");
    setRegistrationData({
      emergencyContact: "",
      medicalConditions: "",
      proofOfIdentity: ""
    });
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (participantId) => {
    setDeleteDialog({
      open: true,
      participantId
    });
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      participantId: null
    });
  };

  // Handle delete registration
  const handleDeleteRegistration = async () => {
    if (!deleteDialog.participantId) return;

    setLoading({ ...loading, delete: true });
    try {
      const response = await axios.delete(`/event-participants/${deleteDialog.participantId}`, {
        headers: { "student-id": studentId }
      });
      showNotification("success", "Registration cancelled successfully");
      fetchParticipants();
    } catch (error) {
      showNotification("error", "Failed to cancel registration");
      console.error("Error deleting registration:", error);
    } finally {
      setLoading({ ...loading, delete: false });
      handleCloseDeleteDialog();
    }
  };

  // Handle event registration or update
  const handleRegister = async () => {
    if (!selectedEvent || !studentId) {
      showNotification("error", "Please select an event and ensure you are logged in");
      return;
    }

    // Check if emergency contact is provided
    if (!registrationData.emergencyContact) {
      showNotification("error", "Emergency contact is required");
      return;
    }

    // Check if proof of identity is provided
    if (!registrationData.proofOfIdentity) {
      showNotification("error", "Proof of identity is required");
      return;
    }

    setLoading({ ...loading, registration: editMode ? false : true, update: editMode ? true : false });

    try {
      let response;
      const requestData = {
        event_id: selectedEvent,
        student_id: studentId,
        emergency_contact: registrationData.emergencyContact,
        medical_conditions: registrationData.medicalConditions,
        proof_of_identity: registrationData.proofOfIdentity
      };

      if (editMode) {
        // Update existing registration
        response = await axios.put(`/event-participants/${editId}`, requestData);
        showNotification("success", "Registration updated successfully");
      } else {
        // Create new registration
        requestData.paymentStatus = "pending"; // Default payment status
        response = await axios.post("/register-event", requestData);
        showNotification("success", response.data.message || "Registration successful");
      }
      
      fetchParticipants();
      
      // Reset form fields
      setSelectedEvent("");
      setRegistrationData({
        emergencyContact: "",
        medicalConditions: "",
        proofOfIdentity: ""
      });
      setEditMode(false);
      setEditId(null);
    } catch (error) {
      showNotification("error", error.response?.data?.error || "Registration failed");
      console.error("Registration error:", error);
    } finally {
      setLoading({ ...loading, registration: false, update: false });
    }
  };

  // Get chip color based on status
  const getStatusColor = (status) => {
    // Fixed: Handle null or undefined status
    if (!status) return "default";
    
    const statusLower = status.toLowerCase();
    const colors = {
      pending: "warning",
      approved: "success",
      rejected: "error",
      completed: "info",
      paid: "success",
      unpaid: "error"
    };
    return colors[statusLower] || "default";
  };

  // Render status chip
  const StatusChip = ({ type, label }) => (
    <Chip 
      size="small"
      label={label || "Unknown"} // Fixed: Handle null or undefined label
      color={getStatusColor(label)}
      icon={type === 'payment' ? <Paid /> : <AccessTime />}
      sx={{ borderRadius: 1 }}
    />
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Notification */}
      <Fade in={notification.show}>
        <Alert 
          severity={notification.type} 
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setNotification({ ...notification, show: false })}
        >
          {notification.message}
        </Alert>
      </Fade>

      {/* Registration Form */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
            <EventAvailable sx={{ mr: 1, verticalAlign: "middle" }} />
            {editMode ? "Update Registration" : "Event Registration"}
          </Typography>
          {editMode && (
            <IconButton onClick={handleCancelEdit} color="error">
              <Close />
            </IconButton>
          )}
        </Box>
        
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Select an Event</InputLabel>
            <Select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              label="Select an Event"
              disabled={loading.events || (editMode && loading.update)}
              startAdornment={loading.events && <CircularProgress size={20} sx={{ mr: 1 }} />}
            >
              <MenuItem value="" disabled>
                {loading.events ? "Loading events..." : "Select an event"}
              </MenuItem>
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Student ID"
            value={studentId}
            fullWidth
            disabled
            InputProps={{
              startAdornment: <VerifiedUser sx={{ mr: 1, color: "primary.main" }} />
            }}
          />

          <TextField
            label="Emergency Contact *"
            value={registrationData.emergencyContact}
            onChange={(e) => handleDataChange("emergencyContact", e.target.value)}
            fullWidth
            required
            error={registrationData.emergencyContact === ""}
            helperText={registrationData.emergencyContact === "" ? "Emergency contact is required" : ""}
            InputProps={{
              startAdornment: <ContactPhone sx={{ mr: 1, color: "primary.light" }} />
            }}
          />

          <TextField
            label="Medical Conditions"
            value={registrationData.medicalConditions}
            onChange={(e) => handleDataChange("medicalConditions", e.target.value)}
            fullWidth
            multiline
            rows={2}
            InputProps={{
              startAdornment: <LocalHospital sx={{ mr: 1, color: "primary.light" }} />
            }}
          />

          <TextField
            label="Your Team To RQ to join *"
            value={registrationData.proofOfIdentity}
            onChange={(e) => handleDataChange("proofOfIdentity", e.target.value)}
            fullWidth
            required
            error={registrationData.proofOfIdentity === ""}
            helperText={registrationData.proofOfIdentity === "" ? "Your Team To RQ to join" : ""}
            InputProps={{
              startAdornment: <VerifiedUser sx={{ mr: 1, color: "primary.light" }} />
            }}
          />

          <Button 
            variant="contained" 
            onClick={handleRegister} 
            fullWidth
            disabled={loading.registration || loading.update}
            startIcon={
              loading.registration || loading.update ? 
              <CircularProgress size={20} /> : 
              editMode ? <Edit /> : <Add />
            }
            sx={{ 
              py: 1.5, 
              borderRadius: 2,
              background: editMode ? 
                'linear-gradient(90deg, #2e7d32, #4caf50)' : 
                'linear-gradient(90deg, #1976d2, #64b5f6)',
              '&:hover': {
                background: editMode ? 
                  'linear-gradient(90deg, #1b5e20, #43a047)' : 
                  'linear-gradient(90deg, #1565c0, #42a5f5)'
              }
            }}
          >
            {loading.registration ? "Registering..." : 
             loading.update ? "Updating..." : 
             editMode ? "Update Registration" : "Register for Event"}
          </Button>
        </Stack>
      </Paper>

      {/* Participants Table */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)' 
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
            My Registrations
          </Typography>
          <Tooltip title="Refresh registrations">
            <IconButton 
              onClick={() => fetchParticipants()} 
              color="primary"
              disabled={loading.participants}
            >
              {loading.participants ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {participants.length > 0 ? (
          <Box sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ background: "#f5f5f5" }}>
                  <TableCell><Typography variant="subtitle2">Event</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Payment</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Emergency Contact</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Medical Info</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Your Team To RQ to join</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{participant.event_title}</Typography>
                    </TableCell>
                    <TableCell><StatusChip type="status" label={participant.status} /></TableCell>
                    <TableCell><StatusChip type="payment" label={participant.payment_status} /></TableCell>
                    <TableCell>{participant.emergency_contact}</TableCell>
                    <TableCell>{participant.medical_conditions || "None"}</TableCell>
                    <TableCell>{participant.proof_of_identity}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit registration">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEdit(participant)}
                            disabled={participant.status === "completed"}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel registration">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(participant.id)}
                            disabled={participant.status === "completed"}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              {loading.participants ? "Loading your registrations..." : "No registrations found"}
            </Typography>
            {!loading.participants && (
              <Button 
                variant="outlined" 
                startIcon={<EventAvailable />} 
                sx={{ mt: 2 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Register for an event
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Cancel Registration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this event registration? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog} 
            color="primary"
            disabled={loading.delete}
          >
            No, Keep Registration
          </Button>
          <Button 
            onClick={handleDeleteRegistration} 
            color="error"
            disabled={loading.delete}
            startIcon={loading.delete && <CircularProgress size={20} />}
          >
            {loading.delete ? "Cancelling..." : "Yes, Cancel Registration"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventRegistration;