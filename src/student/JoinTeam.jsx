import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Paper,
  Container,
  CircularProgress,
  Chip,
  Divider
} from "@mui/material";
import { Group, Event, Person, Info, Warning } from "@mui/icons-material";

const JoinTeam = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(true);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const studentId = localStorage.getItem("userId");

  // Fetch event details including status
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/events/${eventId}`)
      .then((response) => {
        setEventDetails(response.data);
        setIsEventOpen(response.data.status === "open");
      })
      .catch((error) => {
        console.error("Error fetching event details:", error);
        setError("Failed to load event details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [eventId]);

  // Fetch all available teams
  useEffect(() => {
    if (isEventOpen) {
      axios
        .get(`http://localhost:5000/api/events/${eventId}/teams`)
        .then((response) => {
          setTeams(response.data);
        })
        .catch((error) => {
          console.error("Error fetching teams:", error);
          setError("Failed to load teams");
        });
    }
  }, [eventId, isEventOpen]);

  // Check if the student is registered for the event
  useEffect(() => {
    if (isEventOpen) {
      axios
        .get(`http://localhost:5000/api/events/${eventId}/participants/${studentId}`)
        .then((response) => {
          setIsRegistered(response.data.isRegistered);
        })
        .catch((error) => {
          console.error("Error checking registration:", error);
        });
    }
  }, [eventId, studentId, isEventOpen]);

  // Handle joining a team
  const handleJoinTeam = () => {
    if (!isEventOpen) {
      setError("This event is closed. You cannot join teams.");
      return;
    }

    if (!isRegistered) {
      setError("You must register for the event before joining a team.");
      return;
    }

    if (!selectedTeamId) {
      setError("Please select a team to join.");
      return;
    }

    setLoading(true);
    axios
      .post("http://localhost:5000/api/teams/join", {
        team_id: selectedTeamId,
        student_id: studentId,
      })
      .then((response) => {
        // Update the teams list to reflect the change
        const updatedTeams = teams.map(team => {
          if (team.id === selectedTeamId) {
            return { ...team, current_members: (team.current_members || 0) + 1 };
          }
          return team;
        });
        setTeams(updatedTeams);
        setError(null);
        setSelectedTeamId("");
        alert(response.data.message);
      })
      .catch((error) => {
        setError(
          "Error joining team: " +
          (error.response ? error.response.data.error : "Unknown error")
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRegisterForEvent = () => {
    navigate(`/events/${eventId}/register`);
  };

  if (loading && !teams.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Group fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            Join a Team
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {eventDetails && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Event fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
              {eventDetails.name}
            </Typography>
            <Chip 
              icon={<Info />} 
              label={isEventOpen ? "Event Open" : "Event Closed"} 
              color={isEventOpen ? "success" : "error"}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            {eventDetails.description && (
              <Typography variant="body2" color="text.secondary">
                {eventDetails.description}
              </Typography>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!isEventOpen && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This event is closed. Team registration is no longer available.
          </Alert>
        )}

        {isEventOpen && !isRegistered && (
          <Alert severity="info" sx={{ mb: 3 }} icon={<Warning />}>
            You must register for the event before joining a team.
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ ml: 2 }}
              onClick={handleRegisterForEvent}
            >
              Register Now
            </Button>
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth disabled={!isEventOpen || !isRegistered}>
            <InputLabel id="team-select-label">Select a Team</InputLabel>
            <Select
              labelId="team-select-label"
              id="team-select"
              value={selectedTeamId}
              label="Select a Team"
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <MenuItem value="">
                <em>-- Select a Team --</em>
              </MenuItem>
              {teams.length > 0 ? (
                teams.map((team) => (
                  <MenuItem 
                    key={team.id} 
                    value={team.id}
                    disabled={
                      team.max_members <= (team.current_members || 0)
                    }
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <Typography>{team.team_name}</Typography>
                      <Typography color="text.secondary">
                        <Person fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                        {team.current_members || 0}/{team.max_members}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No teams available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleJoinTeam}
          disabled={!isEventOpen || !isRegistered || !selectedTeamId || loading}
          startIcon={<Group />}
          fullWidth
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Join Team"}
        </Button>
      </Paper>
    </Container>
  );
};

export default JoinTeam;