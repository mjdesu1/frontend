import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  TableSortLabel,
  Box,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  alpha,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  AppBar,
  Badge,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from "chart.js";
import {
  Person,
  Group,
  Event,
  SportsEsports,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  PictureAsPdf as PictureAsPdfIcon,
  EmojiEvents as EmojiEventsIcon
} from "@mui/icons-material";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Tab panel component for event-specific content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}


// Updated TournamentBracket component with PNG/JPG export functionality
const TournamentBracket = ({ teams, event, eventScores }) => {
  const theme = useTheme();
  const pdfRef = useRef(null);
  
  // Enhanced state management for bracket with localStorage persistence
  const [bracketRounds, setBracketRounds] = useState(() => {
    const savedData = localStorage.getItem(`tournament-bracket-${event}`);
    return savedData ? JSON.parse(savedData) : {
      firstRound: [],
      semiFinals: [],
      final: null
    };
  });
  
  const [scheduledMatches, setScheduledMatches] = useState(() => {
    const savedMatches = localStorage.getItem(`tournament-matches-${event}`);
    return savedMatches ? JSON.parse(savedMatches).map(match => ({
      ...match,
      scheduledTime: new Date(match.scheduledTime)
    })) : [];
  });
  
  const [editingMatch, setEditingMatch] = useState(null);
  const [editForm, setEditForm] = useState({
    team1Score: 0,
    team2Score: 0,
    scheduledDate: '',
    scheduledTime: '',
    status: 'scheduled'
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // New states for export options
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOption, setExportOption] = useState('both');
  const [imageFormat, setImageFormat] = useState('png');
  const [exportGenerating, setExportGenerating] = useState(false);
  
  // Filter teams that are participating in this specific event
  const getTeamsForEvent = useCallback(() => {
    if (!eventScores || !eventScores[event]) {
      return [];
    }
    
    // Extract unique team names from event scores
    const eventTeams = [...new Set(eventScores[event].map(score => score.team_name))];
    return eventTeams;
  }, [event, eventScores]);
  
  // Generate bracket matches with proper round structure
  const generateBracket = useCallback((teamList) => {
    // Handle empty team list
    if (teamList.length === 0) {
      return { firstRound: [], semiFinals: [], final: null };
    }
    
    // Ensure we have power of 2 number of teams
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(teamList.length)));
    const filledTeams = [...teamList];
    
    // Fill with "TBD" for empty slots
    while (filledTeams.length < bracketSize) {
      filledTeams.push("TBD");
    }
    
    // Create first round matches
    const firstRound = [];
    for (let i = 0; i < filledTeams.length; i += 2) {
      firstRound.push({
        id: `match-r1-${i/2 + 1}`,
        team1: filledTeams[i],
        team2: filledTeams[i+1],
        team1Score: 0,
        team2Score: 0,
        winner: null,
        round: 1,
        matchNumber: i/2 + 1,
        status: 'scheduled',
        event: event // Store the event to check for event changes
      });
    }
    
    // Create semi-finals placeholders
    const semiFinals = [];
    for (let i = 0; i < firstRound.length / 2; i++) {
      semiFinals.push({
        id: `match-r2-${i + 1}`,
        team1: "Winner M" + (i*2 + 1),
        team2: "Winner M" + (i*2 + 2),
        team1Score: 0,
        team2Score: 0,
        winner: null,
        round: 2,
        matchNumber: i + 1,
        status: 'scheduled',
        team1SourceMatch: firstRound[i*2]?.id,
        team2SourceMatch: firstRound[i*2 + 1]?.id,
        event: event
      });
    }
    
    // Create final placeholder
    const final = {
      id: 'match-final',
      team1: "SF1 Winner",
      team2: "SF2 Winner", 
      team1Score: 0,
      team2Score: 0,
      winner: null,
      round: 3,
      matchNumber: 1,
      status: 'scheduled',
      team1SourceMatch: semiFinals[0]?.id,
      team2SourceMatch: semiFinals[1]?.id,
      event: event
    };
    
    return { firstRound, semiFinals, final };
  }, [event]);

  // Generate schedule with dates and times
  const generateSchedule = useCallback((bracketRounds) => {
    const today = new Date();
    const allMatches = [
      ...bracketRounds.firstRound,
      ...bracketRounds.semiFinals,
      bracketRounds.final
    ].filter(match => match !== null);
    
    const schedule = allMatches.map((match, index) => {
      const matchDate = new Date(today);
      // First round on day 1, semi-finals on day 2, finals on day 3
      matchDate.setDate(today.getDate() + match.round - 1);
      
      // Set different times for matches based on round
      let hours = 10; // Default start time
      
      if (match.round === 1) {
        hours = 10 + (match.matchNumber - 1) % 3 * 2; // 10AM, 12PM, 2PM
      } else if (match.round === 2) {
        hours = 14 + (match.matchNumber - 1) * 2; // 2PM, 4PM
      } else {
        hours = 16; // Finals at 4PM
      }
      
      matchDate.setHours(hours, 0, 0, 0);
      
      return {
        ...match,
        scheduledTime: matchDate
      };
    });
    
    return schedule;
  }, []);
  
  // Update brackets when match results change
  const updateBracketProgression = useCallback((updatedMatch, allMatches) => {
    const { round, matchNumber, winner, id } = updatedMatch;
    
    // Find matches that depend on this match's result
    const nextRoundMatches = allMatches.filter(m => 
      m.team1SourceMatch === id || m.team2SourceMatch === id
    );
    
    // Update all dependent matches
    const updatedMatches = allMatches.map(match => {
      if (match.team1SourceMatch === id) {
        return {
          ...match,
          team1: winner || match.team1
        };
      }
      if (match.team2SourceMatch === id) {
        return {
          ...match,
          team2: winner || match.team2
        };
      }
      return match;
    });
    
    return updatedMatches;
  }, []);
  
  // Save tournament data to localStorage
  const saveTournamentData = useCallback((rounds, matches) => {
    localStorage.setItem(`tournament-bracket-${event}`, JSON.stringify(rounds));
    
    // We need to convert Date objects to strings for localStorage
    const matchesForStorage = matches.map(match => ({
      ...match,
      scheduledTime: match.scheduledTime.toISOString()
    }));
    localStorage.setItem(`tournament-matches-${event}`, JSON.stringify(matchesForStorage));
  }, [event]);
  
  // Initialize tournament data
  useEffect(() => {
    const teamsInEvent = getTeamsForEvent();
    
    // Check if we should initialize or reset data
    const shouldInitialize = 
      // If there's no data yet
      scheduledMatches.length === 0 || 
      // Or if the event has changed
      (scheduledMatches.length > 0 && scheduledMatches[0].event !== event) ||
      // Or if this is a fresh component mount and we don't have data
      (!isInitialized && teamsInEvent.length > 0 && bracketRounds.firstRound.length === 0);
    
    if (shouldInitialize) {
      const rounds = generateBracket(teamsInEvent);
      setBracketRounds(rounds);
      const schedule = generateSchedule(rounds);
      setScheduledMatches(schedule);
      
      // Save the initial data
      saveTournamentData(rounds, schedule);
      setIsInitialized(true);
    }
  }, [event, eventScores, generateBracket, generateSchedule, getTeamsForEvent, 
      bracketRounds.firstRound, scheduledMatches, isInitialized, saveTournamentData]);
  
  // Convert date to input friendly format
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Convert time to input friendly format
  const formatTimeForInput = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Open edit dialog for a match
  const handleEditMatch = (match) => {
    setEditingMatch(match);
    setEditForm({
      team1Score: match.team1Score || 0,
      team2Score: match.team2Score || 0,
      scheduledDate: formatDateForInput(match.scheduledTime),
      scheduledTime: formatTimeForInput(match.scheduledTime),
      status: match.status || 'scheduled'
    });
    setEditDialogOpen(true);
  };
  
  // Save match edits
  const handleSaveMatch = () => {
    // Combine date and time for scheduledTime
    const dateStr = editForm.scheduledDate;
    const timeStr = editForm.scheduledTime;
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const scheduledTime = new Date(year, month - 1, day, hours, minutes);
    
    // Determine winner based on scores
    let winner = null;
    if (editForm.team1Score > editForm.team2Score && editForm.status === 'completed') {
      winner = editingMatch.team1;
    } else if (editForm.team2Score > editForm.team1Score && editForm.status === 'completed') {
      winner = editingMatch.team2;
    }
    
    // Update the specific match
    const updatedMatch = {
      ...editingMatch,
      team1Score: parseInt(editForm.team1Score),
      team2Score: parseInt(editForm.team2Score),
      scheduledTime,
      status: editForm.status,
      winner
    };
    
    // Update all matches in the scheduling system
    let updatedMatches = scheduledMatches.map(match => 
      match.id === editingMatch.id ? updatedMatch : match
    );
    
    // If match is completed and has a winner, update the bracket progression
    if (editForm.status === 'completed' && winner) {
      updatedMatches = updateBracketProgression(updatedMatch, updatedMatches);
    }
    
    setScheduledMatches(updatedMatches);
    
    // Update bracketRounds state to reflect changes
    const updatedBracketRounds = {
      firstRound: updatedMatches.filter(m => m.round === 1),
      semiFinals: updatedMatches.filter(m => m.round === 2),
      final: updatedMatches.find(m => m.round === 3) || null
    };
    
    setBracketRounds(updatedBracketRounds);
    
    // Save updated data to localStorage
    saveTournamentData(updatedBracketRounds, updatedMatches);
    
    // Close dialog
    setEditDialogOpen(false);
  };

  // Get appropriate color for match status
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return theme.palette.success.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'scheduled':
        return theme.palette.info.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  // Get appropriate label for match status
  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'scheduled':
        return 'Scheduled';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Scheduled';
    }
  };
  
  // Get appropriate icon for match status
  const getMatchResult = (match) => {
    if (match.status !== 'completed') {
      return (
        <Chip size="small" label="VS" sx={{ background: alpha(theme.palette.primary.main, 0.1) }} />
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
          {match.team1Score}
        </Typography>
        <Typography variant="body2" sx={{ mx: 1 }}>-</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 1 }}>
          {match.team2Score}
        </Typography>
      </Box>
    );
  };
  
  // Mark team as winner in UI
  const getTeamStyle = (team, match) => {
    // Check if team is undefined or null first
    if (!team) {
      return { fontWeight: 400 };
    }
    
    if (match.status !== 'completed' || !match.winner) {
      return { 
        fontWeight: team !== 'TBD' && 
                  !team.startsWith('Winner') && 
                  !team.startsWith('SF') ? 500 : 400 
      };
    }
    
    return {
      fontWeight: team === match.winner ? 700 : 400,
      color: team === match.winner ? theme.palette.success.main : theme.palette.text.secondary
    };
  };

  // Group matches by round
  const getMatchesByRound = () => {
    const rounds = {
      1: [],
      2: [],
      3: []
    };
    
    scheduledMatches.forEach(match => {
      if (rounds[match.round]) {
        rounds[match.round].push(match);
      }
    });
    
    return rounds;
  };
  
  // Reset bracket with confirmation
  const handleResetBracket = () => {
    if (window.confirm('Are you sure you want to reset the bracket? All match results will be lost.')) {
      // Clear localStorage for this event
      localStorage.removeItem(`tournament-bracket-${event}`);
      localStorage.removeItem(`tournament-matches-${event}`);
      
      const teamsInEvent = getTeamsForEvent();
      const rounds = generateBracket(teamsInEvent);
      setBracketRounds(rounds);
      const schedule = generateSchedule(rounds);
      setScheduledMatches(schedule);
      
      // Save the reset data
      saveTournamentData(rounds, schedule);
    }
  };

  // Open the export dialog
  const handleExport = () => {
    setExportDialogOpen(true);
  };

  // Generate PDF
  const generatePDF = async () => {
    setExportGenerating(true);
    setExportDialogOpen(false);

    try {
      let content;
      if (exportOption === 'bracket') {
        content = document.getElementById('bracket-visualization');
      } else if (exportOption === 'schedule') {
        content = document.getElementById('schedule-table');
      } else {
        content = document.getElementById('tournament-content');
      }

      const pdf = new jsPDF('l', 'mm', 'a4');
      
      // Add Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${event} Tournament`, 15, 15);
      
      // Add Date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 22);
      
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 15, 30, pdfWidth, pdfHeight);
      
      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page 1 of ${pageCount}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
      
      // Save PDF
      pdf.save(`${event}-tournament-${exportOption}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
    
    setExportGenerating(false);
  };

  // NEW: Generate image (PNG/JPG)
  const generateImage = async () => {
    setExportGenerating(true);
    setExportDialogOpen(false);

    try {
      let content;
      if (exportOption === 'bracket') {
        content = document.getElementById('bracket-visualization');
      } else if (exportOption === 'schedule') {
        content = document.getElementById('schedule-table');
      } else {
        content = document.getElementById('tournament-content');
      }

      // Create a canvas with higher resolution for better quality
      const canvas = await html2canvas(content, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: theme.palette.background.paper,
        scrollX: 0,
        scrollY: 0,
      });
      
      // Create image and trigger download
      const mimeType = imageFormat === 'png' ? 'image/png' : 'image/jpeg';
      const imgData = canvas.toDataURL(mimeType, 0.9); // 0.9 is quality for JPEG
      
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      const fileName = `${event}-tournament-${exportOption}.${imageFormat}`;
      
      downloadLink.href = imgData;
      downloadLink.download = fileName;
      downloadLink.click();
      
    } catch (error) {
      console.error('Error generating image:', error);
      alert('There was an error generating the image. Please try again.');
    }
    
    setExportGenerating(false);
  };

  // Handle export based on selected format
  const handleExportGenerate = () => {
    if (exportFormat === 'pdf') {
      generatePDF();
    } else {
      generateImage();
    }
  };

  const teamsInEvent = getTeamsForEvent();
  const matchesByRound = getMatchesByRound();
  
  return (
    <Box sx={{ mt: 4 }} ref={pdfRef} id="tournament-content">
      {teamsInEvent.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No teams found for this event. Add scores to see the tournament bracket.
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Tournament Bracket - {event}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Teams participating: {teamsInEvent.length}
              </Typography>
            </Box>
            <Box>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleResetBracket}
                sx={{ mr: 2 }}
              >
                Reset Bracket
              </Button>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExport}
                disabled={exportGenerating}
              >
                {exportGenerating ? 'Generating...' : 'Export'}
              </Button>
            </Box>
          </Box>
          
          {/* Bracket Visualization */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              mb: 4,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)}, ${alpha(theme.palette.background.paper, 0.9)})` 
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.background.paper, 0.7)})`
            }}
            id="bracket-visualization"
          >
            <Box sx={{ overflowX: 'auto', py: 2 }}>
              <Box sx={{ display: 'flex', minWidth: 700 }}>
                {/* First Round */}
                <Box sx={{ display: 'flex', flexDirection: 'column', mr: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                    First Round
                  </Typography>
                  
                  {matchesByRound[1].map((match, index) => (
                    <Paper
                      key={index}
                      elevation={2}
                      sx={{
                        p: 2,
                        mb: 3,
                        width: 200,
                        borderRadius: 2,
                        borderLeft: `4px solid ${getStatusColor(match.status)}`,
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: theme.shadows[6],
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                          Match #{match.matchNumber}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleEditMatch(match)}
                          sx={{ p: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Divider sx={{ mb: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={getTeamStyle(match.team1, match)}>
                          {match.team1}
                        </Typography>
                        {getMatchResult(match)}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={getTeamStyle(match.team2, match)}>
                          {match.team2}
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mt: 1
                        }}
                      >
                        <Chip 
                          size="small" 
                          label={getStatusLabel(match.status)} 
                          sx={{ 
                            backgroundColor: alpha(getStatusColor(match.status), 0.1),
                            color: getStatusColor(match.status),
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }} 
                        />
                      </Box>
                      {match.winner && (
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 500, color: theme.palette.success.main }}>
                            Winner: {match.winner}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
                
                {/* Semi-finals (second round) */}
                {matchesByRound[2].length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', mr: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                      Semi-Finals
                    </Typography>
                    
                    {matchesByRound[2].map((match, index) => (
                      <Paper
                        key={index}
                        elevation={2}
                        sx={{
                          p: 2,
                          mb: 3,
                          width: 200,
                          borderRadius: 2,
                          borderLeft: `4px solid ${getStatusColor(match.status)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: theme.shadows[6],
                            transform: 'translateY(-3px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                            Semi-Final #{match.matchNumber}
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="primary"
                            sx={{ p: 0.5 }}
                            onClick={() => handleEditMatch(match)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography sx={getTeamStyle(match.team1, match)}>
                            {match.team1}
                          </Typography>
                          {getMatchResult(match)}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography sx={getTeamStyle(match.team2, match)}>
                            {match.team2}
                          </Typography>
                        </Box>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mt: 1
                          }}
                        >
                          <Chip 
                            size="small" 
                            label={getStatusLabel(match.status)} 
                            sx={{ 
                              backgroundColor: alpha(getStatusColor(match.status), 0.1),
                              color: getStatusColor(match.status),
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }} 
                          />
                        </Box>
                        {match.winner && (
                          <Box sx={{ mt: 1, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 500, color: theme.palette.success.main }}>
                              Winner: {match.winner}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
                
                {/* Finals */}
                {matchesByRound[3] && matchesByRound[3].length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                      Finals
                    </Typography>
                    
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        width: 200,
                        borderRadius: 2,
                        borderLeft: `4px solid ${getStatusColor(matchesByRound[3][0].status)}`,
                        background: alpha(theme.palette.error.main, 0.05),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmojiEventsIcon sx={{ color: theme.palette.warning.main, mr: 1, fontSize: '1rem' }} />
                          <Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                            Final Match
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          color="primary"
                          sx={{ p: 0.5 }}
                          onClick={() => handleEditMatch(matchesByRound[3][0])}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Divider sx={{ mb: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={getTeamStyle(matchesByRound[3][0].team1, matchesByRound[3][0])}>
                          {matchesByRound[3][0].team1}
                        </Typography>
                        {getMatchResult(matchesByRound[3][0])}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={getTeamStyle(matchesByRound[3][0].team2, matchesByRound[3][0])}>
                          {matchesByRound[3][0].team2}
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mt: 1
                        }}
                      >
                        <Chip 
                          size="small" 
                          label={getStatusLabel(matchesByRound[3][0].status)} 
                          sx={{ 
                            backgroundColor: alpha(getStatusColor(matchesByRound[3][0].status), 0.1),
                            color: getStatusColor(matchesByRound[3][0].status),
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }} 
                        />
                      </Box>
                      {matchesByRound[3][0].winner && (
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            Winner: {matchesByRound[3][0].winner}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
          
          {/* Match Schedule Section */}
          <Paper 
            elevation={3} 
            sx={{ p: 3, borderRadius: 2 }}
            id="schedule-table"
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Match Schedule
            </Typography>
            
            <TableContainer sx={{ mt: 2 }}>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Match</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Teams</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Result</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledMatches.sort((a, b) => {
                    // Sort by round first, then by match number
                    if (a.round !== b.round) {
                      return a.round - b.round;
                    }
                    return a.matchNumber - b.matchNumber;
                  }).map((match, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: match.status === 'completed' 
                          ? alpha(theme.palette.success.main, 0.05)
                          : 'inherit'
                      }}
                    >
                      <TableCell>
                        {match.round === 1 && `R1 Match ${match.matchNumber}`}
                        {match.round === 2 && `Semi-Final ${match.matchNumber}`}
                        {match.round === 3 && 'Final'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={getTeamStyle(match.team1, match)}>
                            {match.team1}
                          </Typography>
                          <Typography sx={{ mx: 1 }}>vs</Typography>
                          <Typography sx={getTeamStyle(match.team2, match)}>
                            {match.team2}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {match.scheduledTime?.toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={getStatusLabel(match.status)} 
                          sx={{ 
                            backgroundColor: alpha(getStatusColor(match.status), 0.1),
                            color: getStatusColor(match.status)
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        {match.status === 'completed' 
                          ? `${match.team1Score} - ${match.team2Score}` 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditMatch(match)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
      
      {/* Edit Match Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>
          Edit Match Details
          {editingMatch && (
            <Typography variant="subtitle2" color="textSecondary">
              {editingMatch.team1} vs {editingMatch.team2}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Match Status</InputLabel>
                <Select
                  value={editForm.status}
                  label="Match Status"
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={editForm.scheduledDate}
                onChange={(e) => setEditForm({...editForm, scheduledDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={editForm.scheduledTime}
                onChange={(e) => setEditForm({...editForm, scheduledTime: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={`${editingMatch?.team1 || 'Team 1'} Score`}
                type="number"
                fullWidth
                value={editForm.team1Score}
                onChange={(e) => setEditForm({...editForm, team1Score: e.target.value})}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={`${editingMatch?.team2 || 'Team 2'} Score`}
                type="number"
                fullWidth
                value={editForm.team2Score}
                onChange={(e) => setEditForm({...editForm, team2Score: e.target.value})}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveMatch} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Options Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Tournament</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={exportFormat}
                  label="Export Format"
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <MenuItem value="pdf">PDF Document</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {exportFormat === 'image' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Image Format</InputLabel>
                  <Select
                    value={imageFormat}
                    label="Image Format"
                    onChange={(e) => setImageFormat(e.target.value)}
                  >
                    <MenuItem value="png">PNG (Higher quality)</MenuItem>
                    <MenuItem value="jpg">JPG (Smaller file)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Content to Export</InputLabel>
                <Select
                  value={exportOption}
                  label="Content to Export"
                  onChange={(e) => setExportOption(e.target.value)}
                >
                  <MenuItem value="both">Complete Tournament (Bracket & Schedule)</MenuItem>
                  <MenuItem value="bracket">Bracket Only</MenuItem>
                  <MenuItem value="schedule">Schedule Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExportGenerate} variant="contained" color="primary">
            Generate {exportFormat === 'pdf' ? 'PDF' : 'Image'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  
  const [stats, setStats] = useState({
    user_count: 0,
    team_count: 0,
    event_count: 0,
    player_count: 0,
  });
  const [scores, setScores] = useState([]);
  const [editingScore, setEditingScore] = useState(null);
  const [editForm, setEditForm] = useState({ score: 0, position: "none" });
  const [sortDirection, setSortDirection] = useState("asc");
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scoreToDelete, setScoreToDelete] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [eventScores, setEventScores] = useState({});
  const [bracketDialogOpen, setBracketDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventFilter, setEventFilter] = useState('all');

  // Process ranking data for each event and create separate charts
  const processRankingData = (scores) => {
    if (!scores || scores.length === 0) {
      return [];
    }

    const events = [...new Set(scores.map((score) => score.event_name))];
    const teams = [...new Set(scores.map((score) => score.team_name))];

    // Generate a line chart for each event with improved styling
    const eventCharts = events.map((event, index) => {
      const eventScores = teams.map((team) => {
        const score = scores.find(
          (s) => s.event_name === event && s.team_name === team
        );
        return score ? score.score : 0;
      });

      // Generate a unique color for each event using theme palette
      const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main
      ];
      
      const color = colors[index % colors.length];

      return {
        event,
        chartData: {
          labels: teams,
          datasets: [
            {
              label: event,
              data: eventScores,
              borderColor: color,
              backgroundColor: alpha(color, 0.2),
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: color,
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            },
            title: {
              display: true,
              text: `${event} Performance`,
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
              titleColor: theme.palette.text.primary,
              bodyColor: theme.palette.text.secondary,
              borderColor: theme.palette.divider,
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              callbacks: {
                title: function(tooltipItems) {
                  return `Team: ${tooltipItems[0].label}`;
                },
                label: function(context) {
                  return `Score: ${context.raw}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: alpha(theme.palette.divider, 0.1)
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            }
          }
        }
      };
    });

    return eventCharts;
  };

  // Group scores by event
  const processEventScores = (scores) => {
    if (!scores || scores.length === 0) {
      return {};
    }

    const eventScoresByName = {};
    
    // Group scores by event
    scores.forEach(score => {
      if (!eventScoresByName[score.event_name]) {
        eventScoresByName[score.event_name] = [];
      }
      eventScoresByName[score.event_name].push(score);
    });
    
    // Sort each event's scores by score value (descending)
    Object.keys(eventScoresByName).forEach(event => {
      eventScoresByName[event] = eventScoresByName[event].sort((a, b) => b.score - a.score);
    });
    
    return eventScoresByName;
  };

  // Fetch dashboard statistics and scores
  const fetchData = async () => {
    setLoading(true);
    try {
      const statsResponse = await axios.get("http://localhost:5000/api/dashboard");
      setStats(statsResponse.data);
      
      const scoresResponse = await axios.get("http://localhost:5000/api/scores");
      setScores(scoresResponse.data);
      
      // Extract unique events and teams
      const uniqueEvents = [...new Set(scoresResponse.data.map(score => score.event_name))];
      setEvents(uniqueEvents);
      
      const uniqueTeams = [...new Set(scoresResponse.data.map(score => score.team_name))];
      setTeams(uniqueTeams);
      
      // Group scores by event
      setEventScores(processEventScores(scoresResponse.data));
      
      // Process ranking data for charts
      setRankingData(processRankingData(scoresResponse.data));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle delete score
  const openDeleteDialog = (id) => {
    setScoreToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/scores/${scoreToDelete}`);
      // After successful deletion, fetch fresh data instead of filtering locally
      fetchData();
      setDeleteDialogOpen(false);
      setScoreToDelete(null);
    } catch (error) {
      console.error("Error deleting score:", error);
    }
  };

  // Handle edit score
  const handleEdit = (score) => {
    // Make sure we use score.position or "none" as a fallback if it's null/undefined
    setEditingScore(score.id);
    setEditForm({ 
      score: score.score, 
      position: score.position || "none" 
    });
  };

  // Handle save edited score
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/scores/${editingScore}`, editForm);
      // After successful update, fetch fresh data instead of updating locally
      fetchData();
      setEditingScore(null);
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingScore(null);
  };

  // Sort scores by score value
  const handleSort = () => {
    const sortedScores = [...scores].sort((a, b) => {
      return sortDirection === "asc" ? a.score - b.score : b.score - a.score;
    });
    setScores(sortedScores);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };
  
  // Handle tab changes for event navigation
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  // Open bracket creation dialog
  const openBracketDialog = (event) => {
    setSelectedEvent(event);
    setBracketDialogOpen(true);
  };

  // Filter scores by selected event
  const getFilteredScores = () => {
    if (eventFilter === 'all') {
      return scores;
    }
    return scores.filter(score => score.event_name === eventFilter);
  };

  // Get position label - Improved to handle all position types
  const getPositionLabel = (position) => {
    // Handle case where position is null, undefined, or empty string
    if (!position || position === "none") {
      return <Chip size="small" label="None" variant="outlined" />;
    }
    
    // Handle numeric positions
    switch (position) {
      case "1":
      case 1:
        return <Chip size="small" label="1st" color="error" sx={{ fontWeight: 'bold' }} />;
      case "2":
      case 2:
        return <Chip size="small" label="2nd" color="warning" sx={{ fontWeight: 'bold' }} />;
      case "3":
      case 3:
        return <Chip size="small" label="3rd" color="success" sx={{ fontWeight: 'bold' }} />;
      default:
        // For any other value, just display it
        return <Chip size="small" label={position} variant="outlined" />;
    }
  };

  // Stats card config
  const statsCards = [
    { 
      title: "Total Users", 
      value: stats.user_count, 
      icon: <Person sx={{ fontSize: 50 }} />, 
      color: theme.palette.primary.main,
      path: "/users"
    },
    { 
      title: "Total Teams", 
      value: stats.team_count, 
      icon: <Group sx={{ fontSize: 50 }} />, 
      color: theme.palette.success.main,
      path: "/teams"
    },
    { 
      title: "Total Events", 
      value: stats.event_count, 
      icon: <Event sx={{ fontSize: 50 }} />, 
      color: theme.palette.warning.main,
      path: "/events"
    },
    { 
      title: "Total Players", 
      value: stats.player_count, 
      icon: <SportsEsports sx={{ fontSize: 50 }} />, 
      color: theme.palette.error.main,
      path: "/players"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          color="textPrimary"
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            letterSpacing: '0.05em',
            backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textShadow: '1px 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          Dashboard Overview
        </Typography>
        <Divider sx={{ 
          width: '80px', 
          mx: 'auto', 
          my: 2, 
          borderWidth: 2,
          borderColor: theme.palette.primary.main
        }} />
        <Typography variant="subtitle1" color="textSecondary">
          Comprehensive view of system data and performance metrics
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        component={Paper}
        elevation={3}
        sx={{
          borderRadius: 4,
          p: 3,
          mb: 6,
          backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)}), 
                            linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
          backgroundBlendMode: 'normal',
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main,.1)}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Key Metrics</Typography>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchData} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Grid container spacing={4}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 20px 0 ${alpha(card.color, 0.15)}`,
                  border: `1px solid ${alpha(card.color, 0.1)}`,
                  overflow: 'visible',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 28px 0 ${alpha(card.color, 0.25)}`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    backgroundImage: `linear-gradient(135deg, ${alpha(card.color, 0.2)} 0%, ${alpha(card.color, 0.05)} 100%)`,
                    zIndex: 0,
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mb: 2 
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 500, 
                        color: theme.palette.text.primary 
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: '50%',
                        backgroundColor: alpha(card.color, 0.15),
                        color: card.color
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      color: card.color,
                      mb: 1
                    }}
                  >
                    {card.value.toLocaleString()}
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mt: 2
                    }}
                  >
                    <Button 
                      variant="text" 
                      size="small" 
                      sx={{ color: card.color }}
                      onClick={() => alert(`Navigating to ${card.path}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Event Tabs for Score Segregation */}
      <Paper elevation={3} sx={{ borderRadius: 4, mb: 6, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Event Performance & Brackets
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            View scores, rankings, and tournament brackets for each event
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
              sx={{ '& .MuiTab-root': { fontWeight: 500 } }}
            >
              {events.map((event, index) => (
               <Tab 
               key={index} 
               label={
                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
                   <Typography sx={{ mr: 1 }}>
                     {event}
                   </Typography>
                   <Badge 
                     badgeContent={eventScores[event]?.length || 0} 
                     color="primary"
                     size="small"
                   />
                 </Box>
               } 
               {...{id: `event-tab-${index}`, 'aria-controls': `event-tabpanel-${index}`}}
             />
           ))}
         </Tabs>
       </Box>
     </Box>
     
     {/* Tab Panels for Event Content */}
     {events.map((event, index) => (
       <TabPanel key={index} value={currentTab} index={index}>
         <Box sx={{ mb: 4 }}>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
             <Typography variant="h6" sx={{ fontWeight: 600 }}>
               {event} Scores
             </Typography>
             <Button 
               variant="contained" 
               color="primary" 
               startIcon={<TrophyIcon />}
               onClick={() => openBracketDialog(event)}
             >
               View Tournament Bracket
             </Button>
           </Box>
           
           {/* Event Scores Table */}
           <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
             <Table>
               <TableHead>
                 <TableRow>
                   <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                   <TableCell sx={{ fontWeight: 'bold' }}>
                     <TableSortLabel
                       active={true}
                       direction={sortDirection}
                       onClick={handleSort}
                     >
                       Score
                     </TableSortLabel>
                   </TableCell>
                   <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                   <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                   <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {eventScores[event]?.map((score) => (
                   <TableRow key={score.id} hover>
                     <TableCell>
                       <Typography variant="body2" sx={{ fontWeight: 500 }}>
                         {score.team_name}
                       </Typography>
                     </TableCell>
                     <TableCell>
                       {editingScore === score.id ? (
                         <TextField
                           type="number"
                           value={editForm.score}
                           onChange={(e) => setEditForm({ ...editForm, score: e.target.value })}
                           variant="outlined"
                           size="small"
                           fullWidth
                         />
                       ) : (
                         <Typography variant="body2" sx={{ fontWeight: 600 }}>
                           {score.score}
                         </Typography>
                       )}
                     </TableCell>
                     <TableCell>
                       {editingScore === score.id ? (
                         <FormControl variant="outlined" size="small" fullWidth>
                           <Select
                             value={editForm.position}
                             onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                           >
                             <MenuItem value="none">None</MenuItem>
                             <MenuItem value="1">1st Place</MenuItem>
                             <MenuItem value="2">2nd Place</MenuItem>
                             <MenuItem value="3">3rd Place</MenuItem>
                           </Select>
                         </FormControl>
                       ) : (
                         getPositionLabel(score.position)
                       )}
                     </TableCell>
                     <TableCell>
                       {new Date(score.date).toLocaleDateString()}
                     </TableCell>
                     <TableCell>
                       {editingScore === score.id ? (
                         <Box>
                           <IconButton color="primary" onClick={handleSave} size="small">
                             <SaveIcon />
                           </IconButton>
                           <IconButton color="error" onClick={handleCancelEdit} size="small">
                             <CancelIcon />
                           </IconButton>
                         </Box>
                       ) : (
                         <Box>
                           <IconButton color="primary" onClick={() => handleEdit(score)} size="small">
                             <EditIcon />
                           </IconButton>
                           <IconButton color="error" onClick={() => openDeleteDialog(score.id)} size="small">
                             <DeleteIcon />
                           </IconButton>
                         </Box>
                       )}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </TableContainer>
           
           {/* Event Performance Chart */}
           {rankingData.find(data => data.event === event) && (
             <Box sx={{ height: 400, mb: 4 }}>
               <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                 Team Performance
               </Typography>
               <Paper 
                 elevation={3} 
                 sx={{ 
                   p: 3, 
                   height: '100%', 
                   borderRadius: 2 
                 }}
               >
                 <Line 
                   data={rankingData.find(data => data.event === event).chartData} 
                   options={rankingData.find(data => data.event === event).options}
                   height={100}
                 />
               </Paper>
             </Box>
           )}
         </Box>
       </TabPanel>
     ))}
   </Paper>
   
   {/* All Scores Table with Filtering */}
   <Paper elevation={3} sx={{ borderRadius: 4, mb: 6, overflow: 'hidden' }}>
     <Box sx={{ 
       p: 3, 
       backgroundColor: alpha(theme.palette.secondary.main, 0.1),
       borderBottom: `1px solid ${theme.palette.divider}`
     }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
         <Typography variant="h5" sx={{ fontWeight: 600 }}>
           All Scores
         </Typography>
         <Box sx={{ display: 'flex', alignItems: 'center' }}>
           <Box sx={{ mr: 2, minWidth: 200 }}>
             <FormControl variant="outlined" size="small" fullWidth>
               <InputLabel id="event-filter-label">Filter by Event</InputLabel>
               <Select
                 labelId="event-filter-label"
                 value={eventFilter}
                 onChange={(e) => setEventFilter(e.target.value)}
                 label="Filter by Event"
               >
                 <MenuItem value="all">All Events</MenuItem>
                 {events.map((event, index) => (
                   <MenuItem key={index} value={event}>{event}</MenuItem>
                 ))}
               </Select>
             </FormControl>
           </Box>
           <Button 
             variant="outlined" 
             color="primary" 
             startIcon={<RefreshIcon />}
             onClick={fetchData}
           >
             Refresh
           </Button>
         </Box>
       </Box>
       
       {loading ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
           <CircularProgress />
         </Box>
       ) : (
         <TableContainer sx={{ maxHeight: 440 }}>
           <Table stickyHeader>
             <TableHead>
               <TableRow>
                 <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                 <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                 <TableCell sx={{ fontWeight: 'bold' }}>
                   <TableSortLabel
                     active={true}
                     direction={sortDirection}
                     onClick={handleSort}
                   >
                     Score
                   </TableSortLabel>
                 </TableCell>
                 <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                 <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                 <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               {getFilteredScores().map((score) => (
                 <TableRow key={score.id} hover>
                   <TableCell>
                     <Typography variant="body2" sx={{ fontWeight: 500 }}>
                       {score.team_name}
                     </Typography>
                   </TableCell>
                   <TableCell>
                     <Chip 
                       size="small" 
                       label={score.event_name} 
                       sx={{ 
                         backgroundColor: alpha(theme.palette.primary.main, 0.1),
                         color: theme.palette.primary.main
                       }} 
                     />
                   </TableCell>
                   <TableCell>
                     {editingScore === score.id ? (
                       <TextField
                         type="number"
                         value={editForm.score}
                         onChange={(e) => setEditForm({ ...editForm, score: e.target.value })}
                         variant="outlined"
                         size="small"
                         fullWidth
                       />
                     ) : (
                       <Typography variant="body2" sx={{ fontWeight: 600 }}>
                         {score.score}
                       </Typography>
                     )}
                   </TableCell>
                   <TableCell>
                     {editingScore === score.id ? (
                       <FormControl variant="outlined" size="small" fullWidth>
                         <Select
                           value={editForm.position}
                           onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                         >
                           <MenuItem value="none">None</MenuItem>
                           <MenuItem value="1">1st Place</MenuItem>
                           <MenuItem value="2">2nd Place</MenuItem>
                           <MenuItem value="3">3rd Place</MenuItem>
                         </Select>
                       </FormControl>
                     ) : (
                       getPositionLabel(score.position)
                     )}
                   </TableCell>
                   <TableCell>
                     {new Date(score.date).toLocaleDateString()}
                   </TableCell>
                   <TableCell>
                     {editingScore === score.id ? (
                       <Box>
                         <IconButton color="primary" onClick={handleSave} size="small">
                           <SaveIcon />
                         </IconButton>
                         <IconButton color="error" onClick={handleCancelEdit} size="small">
                           <CancelIcon />
                         </IconButton>
                       </Box>
                     ) : (
                       <Box>
                         <IconButton color="primary" onClick={() => handleEdit(score)} size="small">
                           <EditIcon />
                         </IconButton>
                         <IconButton color="error" onClick={() => openDeleteDialog(score.id)} size="small">
                           <DeleteIcon />
                         </IconButton>
                       </Box>
                     )}
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </TableContainer>
       )}
     </Box>
   </Paper>
   
   {/* Delete Confirmation Dialog */}
   <Dialog
     open={deleteDialogOpen}
     onClose={() => setDeleteDialogOpen(false)}
   >
     <DialogTitle>Confirm Deletion</DialogTitle>
     <DialogContent>
       <DialogContentText>
         Are you sure you want to delete this score record? This action cannot be undone.
       </DialogContentText>
     </DialogContent>
     <DialogActions>
       <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
         Cancel
       </Button>
       <Button onClick={handleDelete} color="error" variant="contained">
         Delete
       </Button>
     </DialogActions>
   </Dialog>
   
 
{/* Tournament Bracket Dialog */}
<Dialog
  open={bracketDialogOpen}
  onClose={() => setBracketDialogOpen(false)}
  fullWidth
  maxWidth="lg"
>
  <DialogTitle>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TrophyIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
      Tournament Bracket - {selectedEvent}
    </Box>
  </DialogTitle>
  <DialogContent>
    <TournamentBracket 
      teams={teams} 
      event={selectedEvent} 
      eventScores={eventScores} 
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setBracketDialogOpen(false)} color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog>
 </Container>
);
};

export default Dashboard;