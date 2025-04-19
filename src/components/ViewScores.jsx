import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Chip,
  Fade,
  Grow,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";

const ViewScores = () => {
  const { eventId } = useParams();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch scores for the event
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/events/${eventId}/scores`)
      .then((response) => {
        setScores(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching scores:", error);
        setError("Failed to load scores. Please try again later.");
        setLoading(false);
      });
  }, [eventId]);

  // Function to get medal color based on position
  const getMedalColor = (position) => {
    switch (position) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Fade in={true} timeout={800}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 4,
            background: "linear-gradient(to right bottom, #ffffff, #f8f9fa)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <EmojiEventsIcon
              sx={{ fontSize: 36, color: "#1976d2", mr: 1.5 }}
            />
            <Typography
              variant="h4"
              component="h1"
              align="center"
              sx={{
                fontWeight: 700,
                color: "#1976d2",
                letterSpacing: "0.5px",
              }}
            >
              Leaderboard
            </Typography>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 6,
              }}
            >
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : error ? (
            <Box
              sx={{
                mt: 3,
                p: 3,
                textAlign: "center",
                bgcolor: "#ffe9e9",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="error">
                {error}
              </Typography>
            </Box>
          ) : scores.length > 0 ? (
            <Grow in={!loading} timeout={500}>
              <TableContainer
                component={Paper}
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <Table>
                  <TableHead
                    sx={{
                      background:
                        "linear-gradient(to right, #1976d2, #2196f3)",
                    }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          pl: 3,
                        }}
                      >
                        Team Name
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Score
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          pr: 3,
                        }}
                      >
                        Position
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scores.map((score, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": {
                            backgroundColor: "#f5f9ff",
                          },
                          backgroundColor:
                            index % 2 === 0 ? "#f8f9fa" : "white",
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <TableCell
                          sx={{
                            pl: 3,
                            py: 2.5,
                            fontWeight:
                              score.position <= 3 ? "bold" : "normal",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <GroupsIcon
                            fontSize="small"
                            sx={{ color: "#555" }}
                          />
                          {score.team_name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight:
                              score.position <= 3 ? "bold" : "normal",
                            fontSize: score.position <= 3 ? "1.1rem" : "1rem",
                          }}
                        >
                          {score.score}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ pr: 3, py: 2.5 }}
                        >
                          {score.position <= 3 ? (
                            <Chip
                              label={`#${score.position}`}
                              sx={{
                                bgcolor: getMedalColor(score.position),
                                color: "white",
                                fontWeight: "bold",
                                minWidth: "60px",
                              }}
                            />
                          ) : (
                            <Typography sx={{ color: "#555" }}>
                              #{score.position}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grow>
          ) : (
            <Box
              sx={{
                mt: 4,
                mb: 2,
                textAlign: "center",
                p: 4,
                bgcolor: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                color="textSecondary"
                sx={{ fontWeight: 500 }}
              >
                No scores available for this event yet.
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                Check back later when results have been posted.
              </Typography>
            </Box>
          )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default ViewScores;