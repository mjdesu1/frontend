import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  Tooltip,
  Divider,
  CircularProgress,
  Collapse,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Grid,
  CardActions
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import EventIcon from "@mui/icons-material/Event";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [editTeam, setEditTeam] = useState(null);
  const [editForm, setEditForm] = useState({ team_name: "", max_members: "", status: "" });
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [kickingMemberId, setKickingMemberId] = useState(null); // Track which member is being kicked
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Fetch all teams
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("http://localhost:5000/api/teams");
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Search teams
  const searchTeams = async () => {
    if (searchQuery.trim() === "") {
      fetchTeams();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/teams/search?query=${searchQuery}`);
      setTeams(response.data);
    } catch (error) {
      console.error("Error searching teams:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search on enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchTeams();
    }
  };

  // Fetch members for a selected team
  const fetchMembers = async (teamId, teamName) => {
    setLoading(true);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/teams/${teamId}/members`);
      setMembers(response.data);
      setSelectedTeam({ id: teamId, name: teamName });
      setOpenMembersDialog(true);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError("Failed to load team members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const kickMember = async (teamId, studentId) => {
    // Validate parameters before making the request
    if (!teamId || !studentId) {
      console.error("Cannot kick member: Missing teamId or studentId");
      return;
    }
    
    try {
      console.log(`Attempting to kick student ${studentId} from team ${teamId}`);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:5000/api/teams/${teamId}/members/${studentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Successfully removed team member");
      // Update your UI or state here
      
      return response.data; // Return the response data in case you need it
    } catch (error) {
      console.error("Error kicking team member:", error);
      // Handle the error in your UI
      throw error; // Re-throw to allow the caller to handle it if needed
    }
  };

  // Delete a team
  const deleteTeam = async (teamId, teamName) => {
    if (window.confirm(`Are you sure you want to delete the team "${teamName}"?`)) {
      setLoading(true);
      
      try {
        await axios.delete(`http://localhost:5000/api/teams/${teamId}`);
        setTeams(teams.filter((team) => team.id !== teamId));
        showSuccess("Team deleted successfully");
      } catch (error) {
        console.error("Error deleting team:", error);
        setError("Failed to delete team. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Open edit form for a team
  const openEditForm = (team) => {
    setEditTeam(team.id);
    setEditForm({ 
      team_name: team.team_name, 
      max_members: team.max_members, 
      status: team.status 
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.put(`http://localhost:5000/api/teams/${editTeam}`, editForm);
      
      setTeams(
        teams.map((team) =>
          team.id === editTeam ? { ...team, ...editForm } : team
        )
      );
      
      setEditTeam(null);
      showSuccess("Team updated successfully");
    } catch (error) {
      console.error("Error updating team:", error);
      setError("Failed to update team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show success message temporarily
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Toggle expanded event
  const toggleExpandEvent = (eventTitle) => {
    if (expandedEvent === eventTitle) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventTitle);
    }
  };

  // Filter teams based on active tab
  const filterTeamsByStatus = () => {
    if (activeTab === 0) return teams; // All teams
    if (activeTab === 1) return teams.filter(team => team.status === "active");
    if (activeTab === 2) return teams.filter(team => team.status === "inactive");
    return teams;
  };

  // Group teams by event
  const groupedTeams = filterTeamsByStatus().reduce((acc, team) => {
    if (!acc[team.event_title]) {
      acc[team.event_title] = [];
    }
    acc[team.event_title].push(team);
    return acc;
  }, {});

  // Get status chip color
  const getStatusColor = (status) => {
    return status === "active" ? "success" : "error";
  };

  // Get avatar initials from team name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color for avatar based on team name
  const getAvatarColor = (name) => {
    const colors = [
      "#1976d2", "#2196f3", "#03a9f4", "#00bcd4", 
      "#009688", "#4caf50", "#8bc34a", "#cddc39",
      "#ffc107", "#ff9800", "#ff5722", "#f44336"
    ];
    
    const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        mb: 4
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main,
            mb: 1 
          }}
        >
          Team Management
        </Typography>
        <Divider sx={{ width: "60%", mb: 2 }} />
      </Box>

      {/* Error and Success Messages */}
      <Collapse in={!!error || !!success}>
        <Box sx={{ mb: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <IconButton size="small" onClick={() => setError(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success"
              action={
                <IconButton size="small" onClick={() => setSuccess(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              {success}
            </Alert>
          )}
        </Box>
      </Collapse>

      {/* Search Bar and Filter Tabs */}
      <Box sx={{ mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            borderRadius: 2,
            background: "linear-gradient(to right, #f9fafb, #ffffff)"
          }}
        >
          <Box sx={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            gap: 2, 
            mb: 2
          }}>
            <TextField
              label="Search teams"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={searchTeams}
                disabled={loading}
                sx={{ 
                  flexShrink: 0,
                  minWidth: isMobile ? "100%" : "120px" 
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
              </Button>
              <Tooltip title="Refresh teams">
                <IconButton 
                  color="primary" 
                  onClick={fetchTeams}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="All Teams" />
            <Tab label="Active Teams" />
            <Tab label="Inactive Teams" />
          </Tabs>
        </Paper>
      </Box>

      {/* Loading State */}
      {loading && !openMembersDialog && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* No Teams Message */}
      {!loading && Object.keys(groupedTeams).length === 0 && (
        <Paper 
          elevation={2}
          sx={{ 
            p: 4, 
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: "#f9fafb"
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No teams found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchQuery ? "Try a different search term." : "No teams are available."}
          </Typography>
        </Paper>
      )}

      {/* Grouped Team List */}
      {!loading && Object.keys(groupedTeams).length > 0 && (
        <Box sx={{ mb: 4 }}>
          {Object.keys(groupedTeams).map((eventTitle) => (
            <Fade in={true} key={eventTitle} timeout={500}>
              <Paper 
                elevation={2}
                sx={{ 
                  mb: 3, 
                  overflow: "hidden",
                  borderRadius: 2
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "space-between", 
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    cursor: "pointer"
                  }}
                  onClick={() => toggleExpandEvent(eventTitle)}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EventIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {eventTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Chip 
                      label={`${groupedTeams[eventTitle].length} teams`}
                      size="small"
                      sx={{ 
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        mr: 1
                      }}
                    />
                    {expandedEvent === eventTitle ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </Box>
                </Box>
                
                <Collapse in={expandedEvent === eventTitle}>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                        <TableRow>
                          <TableCell>Team Name</TableCell>
                          {!isMobile && (
                            <>
                              <TableCell align="center">Members</TableCell>
                              <TableCell align="center">Status</TableCell>
                            </>
                          )}
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedTeams[eventTitle].map((team) => (
                          <TableRow 
                            key={team.id}
                            sx={{
                              "&:hover": { bgcolor: "#f9fafb" },
                              transition: "background-color 0.2s"
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: getAvatarColor(team.team_name),
                                    mr: 2
                                  }}
                                >
                                  {getInitials(team.team_name)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {team.team_name}
                                  </Typography>
                                  {isMobile && (
                                    <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
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
                                </Box>
                              </Box>
                            </TableCell>
                            
                            {!isMobile && (
                              <>
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {team.current_members}/{team.max_members}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={team.status}
                                    size="small"
                                    color={getStatusColor(team.status)}
                                  />
                                </TableCell>
                              </>
                            )}
                            
                            <TableCell align="right">
                              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <Tooltip title="View Members">
                                  <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => fetchMembers(team.id, team.team_name)}
                                    sx={{ mr: 1 }}
                                  >
                                    <GroupIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Team">
                                  <IconButton
                                    color="warning"
                                    size="small"
                                    onClick={() => openEditForm(team)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Team">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => deleteTeam(team.id, team.team_name)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Paper>
            </Fade>
          ))}
        </Box>
      )}

      {/* Members Dialog */}
      <Dialog 
        open={openMembersDialog} 
        onClose={() => setOpenMembersDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <GroupIcon sx={{ mr: 1 }} />
            Team Members: {selectedTeam?.name}
          </Box>
          <IconButton 
            onClick={() => setOpenMembersDialog(false)}
            sx={{ color: "white" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : members.length > 0 ? (
            <Grid container spacing={2}>
              {members.map((member) => (
                <Grid item xs={12} sm={6} key={member.id}>
                  <Card 
                    sx={{ 
                      borderRadius: 2, 
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      height: "100%",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
                      },
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <Box sx={{ 
                      p: 2, 
                      display: "flex", 
                      alignItems: "flex-start",
                      borderBottom: "1px solid #eee"
                    }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          width: 56,
                          height: 56
                        }}
                      >
                        {getInitials(member.full_name)}
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {member.full_name}
                        </Typography>
                        <Chip 
                          label={member.role || "Member"} 
                          size="small"
                          color={member.role === "Team Leader" ? "primary" : "default"}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">{member.email}</Typography>
                      </Box>
                      
                      {member.phone && (
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">{member.phone}</Typography>
                        </Box>
                      )}
                      
                      {member.specialization && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <WorkIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">{member.specialization}</Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    {/* FIXED: Kick Member Button with handleKickMember implemented inline */}
                    <CardActions sx={{ 
                      borderTop: "1px solid #eee", 
                      justifyContent: "flex-end",
                      p: 1.5
                    }}>
                      {member.role === "Team Leader" ? (
                        <Tooltip title="Cannot remove Team Leader">
                          <span>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<PersonRemoveIcon />}
                              size="small"
                              disabled={true}
                              sx={{ 
                                borderRadius: 4,
                                minWidth: "120px",
                                opacity: 0.5
                              }}
                            >
                              Team Leader
                            </Button>
                          </span>
                        </Tooltip>
                      ) : (
                        // In the TeamList.jsx file, replace the kick member button code with this fixed version:

<Button
  variant="outlined"
  color="error"
  startIcon={kickingMemberId === member.id ? <CircularProgress size={16} color="error" /> : <PersonRemoveIcon />}
  size="small"
  onClick={() => {
    console.log("Member object:", member);
    
    // Get teamId from selectedTeam
    const teamId = selectedTeam?.id;
    
    // Try to find studentId from different possible properties
    // Looking at the DB schema, it should be student_id
    const studentId = member.student_id || member.id;
    
    console.log("Using teamId:", teamId, "studentId:", studentId);
    
    if (!teamId || !studentId) {
      console.error("Missing required properties for kicking member:", { teamId, studentId, member });
      setError("Cannot remove member: Missing required information");
      return;
    }
    
    setKickingMemberId(member.id);
    
    kickMember(teamId, studentId)
      .then(() => {
        // Remove the kicked member from the members list
        setMembers(members.filter(m => m.id !== member.id));
        showSuccess("Team member removed successfully");
      })
      .catch(error => {
        setError(`Failed to remove team member: ${error.message}`);
      })
      .finally(() => {
        setKickingMemberId(null);
      });
  }}
  disabled={kickingMemberId === member.id}
  sx={{
    borderRadius: 4,
    minWidth: "120px",
    "&:hover": {
      backgroundColor: "#FFEBEE",
      borderColor: theme.palette.error.main
    },
    cursor: kickingMemberId === member.id ? "default" : "pointer",
    position: "relative",
    zIndex: 1
  }}
>
  {kickingMemberId === member.id ? "Removing..." : "Kick Member"}
</Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                No members in this team.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Team Form */}
      {editTeam && (
        <Dialog 
          open={true} 
          onClose={() => setEditTeam(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: theme.palette.warning.main, 
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Team
            </Box>
            <IconButton 
              onClick={() => setEditTeam(null)}
              sx={{ color: "white" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Box component="form" onSubmit={handleEditSubmit}>
              <TextField
                label="Team Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={editForm.team_name}
                onChange={(e) => setEditForm({ ...editForm, team_name: e.target.value })}
                required
              />
              
              <TextField
                label="Max Members"
                type="number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={editForm.max_members}
                onChange={(e) => setEditForm({ ...editForm, max_members: e.target.value })}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
              
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant={editForm.status === "active" ? "contained" : "outlined"}
                    color="success"
                    onClick={() => setEditForm({ ...editForm, status: "active" })}
                    sx={{ flex: 1 }}
                  >
                    Active
                  </Button>
                  <Button
                    variant={editForm.status === "inactive" ? "contained" : "outlined"}
                    color="error"
                    onClick={() => setEditForm({ ...editForm, status: "inactive" })}
                    sx={{ flex: 1 }}
                  >
                    Inactive
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setEditTeam(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default TeamList;