import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Box,
} from "@mui/material";

const AdminScores = () => {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState("none");

  // Fetch all events
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  // Fetch teams for the selected event
  useEffect(() => {
    if (selectedEvent) {
      axios
        .get(`http://localhost:5000/api/events/${selectedEvent}/teams`)
        .then((response) => setTeams(response.data))
        .catch((error) => console.error("Error fetching teams:", error));
    }
  }, [selectedEvent]);

  // Handle score submission
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/scores", {
        team_id: selectedTeam,
        event_id: selectedEvent,
        score,
        position,
      })
      .then(() => {
        alert("Scores assigned successfully");
        setScore(0);
        setPosition("none");
        setSelectedTeam("");
      })
      .catch((error) => console.error("Error assigning scores:", error));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Assign Scores
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Event Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="event-select-label">Event</InputLabel>
            <Select
              labelId="event-select-label"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              required
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

          {/* Team Selection */}
          <FormControl fullWidth margin="normal" disabled={!selectedEvent}>
            <InputLabel id="team-select-label">Team</InputLabel>
            <Select
              labelId="team-select-label"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              required
            >
              <MenuItem value="">
                <em>Select a Team</em>
              </MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.team_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Score Input */}
          <TextField
            label="Score"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />

          {/* Position Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="position-select-label">Position</InputLabel>
            <Select
              labelId="position-select-label"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="1st">1st</MenuItem>
              <MenuItem value="2nd">2nd</MenuItem>
              <MenuItem value="3rd">3rd</MenuItem>
              <MenuItem value="4th">4th</MenuItem>
            </Select>
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "capitalize",
              borderRadius: 2,
            }}
          >
            Assign Score
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminScores;