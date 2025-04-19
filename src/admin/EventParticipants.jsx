import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  TableContainer,
  Paper,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Avatar,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Backdrop,
  Fade,
  Stack,
  Divider
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  MedicalServices as MedicalIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
} from "@mui/icons-material";

// Set the base URL for API requests
axios.defaults.baseURL = "http://localhost:5000/api";

const AdminParticipants = () => {
  const theme = useTheme();
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [sortField, setSortField] = useState("full_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch all participants on component mount
  useEffect(() => {
    fetchParticipants();
  }, []);

  // Filter participants when search changes
  useEffect(() => {
    filterParticipants();
  }, [search, participants, sortField, sortDirection]);

  // Fetch all participants
  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/admin/event-participants");
      setParticipants(response.data);
      handleSort(sortField); // Initial sort
    } catch (error) {
      showSnackbar("Error fetching participants", "error");
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort participants
  const filterParticipants = () => {
    const filtered = participants
      .filter(
        (participant) =>
          participant.full_name.toLowerCase().includes(search.toLowerCase()) ||
          participant.email.toLowerCase().includes(search.toLowerCase()) ||
          participant.event_title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortDirection === "asc") {
          return a[sortField] > b[sortField] ? 1 : -1;
        } else {
          return a[sortField] < b[sortField] ? 1 : -1;
        }
      });
    
    setFilteredParticipants(filtered);
  };

  // Sort participants
  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Delete a participant
  const deleteParticipant = async (id) => {
    try {
      await axios.delete(`/event-participants/${id}`);
      showSnackbar("Participant deleted successfully");
      fetchParticipants();
    } catch (error) {
      showSnackbar(
        `Error: ${error.response ? error.response.data.error : "Unknown error"}`,
        "error"
      );
    }
  };

  // Open the edit dialog
  const openEditDialog = (participant) => {
    setCurrentParticipant(participant);
    setEditDialogOpen(true);
  };

  // Close the edit dialog
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentParticipant(null);
  };

  // Handle editing participant details
  const handleEditSubmit = async () => {
    try {
      await axios.put(`/event-participants/${currentParticipant.id}`, currentParticipant);
      showSnackbar("Participant details updated successfully");
      fetchParticipants();
      closeEditDialog();
    } catch (error) {
      showSnackbar(
        `Error: ${error.response ? error.response.data.error : "Unknown error"}`,
        "error"
      );
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Get status chip based on status
  const getStatusChip = (status) => {
    // Check if status is null or undefined and provide a default value
    if (!status) {
      status = "pending"; // Default value when status is null or undefined
    }
    
    const statusConfig = {
      pending: { color: "warning", icon: <WarningIcon fontSize="small" /> },
      approved: { color: "success", icon: <CheckCircleIcon fontSize="small" /> },
      rejected: { color: "error", icon: <CancelIcon fontSize="small" /> },
      disqualified: { color: "default", icon: <CancelIcon fontSize="small" /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Chip 
        icon={config.icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };
  
  // Get payment status chip
  const getPaymentChip = (status) => {
    // Check if status is null or undefined and provide a default value
    if (!status) {
      status = "pending"; // Default value when status is null or undefined
    }
    
    const paymentConfig = {
      pending: { color: "warning", icon: <WarningIcon fontSize="small" /> },
      paid: { color: "success", icon: <CheckCircleIcon fontSize="small" /> },
      failed: { color: "error", icon: <CancelIcon fontSize="small" /> }
    };
    
    const config = paymentConfig[status] || paymentConfig.pending;
    
    return (
      <Chip
        icon={config.icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ];
    
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1
          }}
        >
          Event Participants Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage all participant registrations and their details
        </Typography>
      </Box>

      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)"
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search by name, email or event"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title={`Sort by ${sortField}: ${sortDirection}`}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SortIcon />}
                  onClick={() => handleSort(sortField)}
                  size="small"
                >
                  {sortField.replace("_", " ")}
                </Button>
              </Tooltip>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<FilterIcon />}
                size="small"
              >
                Filters
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" color="text.secondary">
              {filteredParticipants.length} participants found
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<SortIcon />}
                onClick={() => handleSort("full_name")}
                color={sortField === "full_name" ? "primary" : "inherit"}
              >
                Name
              </Button>
              <Button
                size="small"
                startIcon={<SortIcon />}
                onClick={() => handleSort("email")}
                color={sortField === "email" ? "primary" : "inherit"}
              >
                Email
              </Button>
              <Button
                size="small"
                startIcon={<SortIcon />}
                onClick={() => handleSort("event_title")}
                color={sortField === "event_title" ? "primary" : "inherit"}
              >
                Event
              </Button>
              <Button
                size="small"
                startIcon={<SortIcon />}
                onClick={() => handleSort("status")}
                color={sortField === "status" ? "primary" : "inherit"}
              >
                Status
              </Button>
            </Stack>
          </Box>

          <TableContainer 
            component={Paper} 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden"
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell>Participant</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Payment</TableCell>
                  <TableCell>Emergency Contact</TableCell>
                  <TableCell>Medical Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No participants found matching your search
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((participant) => (
                    <TableRow 
                      key={participant.id} 
                      hover
                      sx={{ 
                        '&:nth-of-type(odd)': { 
                          bgcolor: alpha(theme.palette.background.default, 0.5) 
                        } 
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: getAvatarColor(participant.full_name),
                              width: 40,
                              height: 40
                            }}
                          >
                            {getInitials(participant.full_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{participant.full_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {participant.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={participant.event_title} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">{getStatusChip(participant.status)}</TableCell>
                      <TableCell align="center">{getPaymentChip(participant.payment_status)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {participant.emergency_contact || "Not provided"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {participant.medical_conditions || "None"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Tooltip title="Edit participant">
                            <IconButton 
                              size="small" 
                              onClick={() => openEditDialog(participant)}
                              sx={{ 
                                color: theme.palette.primary.main,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete participant">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this participant?")) {
                                  deleteParticipant(participant.id);
                                }
                              }}
                              sx={{ 
                                color: theme.palette.error.main,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.2)
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={closeEditDialog}
        TransitionComponent={Fade}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: currentParticipant ? getAvatarColor(currentParticipant.full_name) : theme.palette.primary.main,
                width: 40,
                height: 40
              }}
            >
              {currentParticipant ? getInitials(currentParticipant.full_name) : ""}
            </Avatar>
            <Box>
              <Typography variant="h6">Edit Participant</Typography>
              {currentParticipant && (
                <Typography variant="caption" color="text.secondary">
                  {currentParticipant.full_name} • {currentParticipant.email}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ pt: 3 }}>
          {currentParticipant && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Participation Status</InputLabel>
                <Select
                  value={currentParticipant.status || "pending"}
                  onChange={(e) =>
                    setCurrentParticipant({
                      ...currentParticipant,
                      status: e.target.value,
                    })
                  }
                  label="Participation Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="disqualified">Disqualified</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={currentParticipant.payment_status || "pending"}
                  onChange={(e) =>
                    setCurrentParticipant({
                      ...currentParticipant,
                      payment_status: e.target.value,
                    })
                  }
                  label="Payment Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Emergency Contact"
                value={currentParticipant.emergency_contact}
                onChange={(e) =>
                  setCurrentParticipant({
                    ...currentParticipant,
                    emergency_contact: e.target.value,
                  })
                }
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
              
              <TextField
                label="Medical Conditions"
                value={currentParticipant.medical_conditions}
                onChange={(e) =>
                  setCurrentParticipant({
                    ...currentParticipant,
                    medical_conditions: e.target.value,
                  })
                }
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={closeEditDialog} 
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminParticipants;