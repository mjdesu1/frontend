// Schedule Components
const ScheduleContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const ScheduleItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: alpha(theme.palette.background.paper, 0.8),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 5px 15px -5px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

// Loading screen component
const LoadingScreen = ({ message }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <Zoom in timeout={800}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4} 
            sx={{
              color: theme.palette.primary.main,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }} 
          />
          
          <Box sx={{ mt: 4, position: 'relative' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {message}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please wait while we process your request...
            </Typography>
          </Box>
        </Box>
      </Zoom>
    </Box>
  );
};

// Page transition wrapper
const PageTransition = ({ children, isVisible = true }) => (
  <Fade in={isVisible} timeout={800}>
    <Box>{children}</Box>
  </Fade>
);

// Schedule view component
const EventSchedule = ({ event }) => {
  const theme = useTheme();
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // First, check if we already have a schedule in local storage
    const storedSchedule = localStorage.getItem(`event_schedule_${event.id}`);
    
    if (storedSchedule) {
      // If schedule exists in local storage, use it
      setScheduleData(JSON.parse(storedSchedule));
      setLoading(false);
    } else {
      // Otherwise fetch the team data and generate a new schedule
      const fetchScheduleData = async () => {
        try {
          setLoading(true);
          
          // API call to fetch teams for this event
          const response = await fetch(`/api/teams?event_id=${event.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch team data');
          }
          
          const teamsData = await response.json();
          
          // Generate schedule based on actual teams
          const generatedSchedule = generateScheduleForEvent(event, teamsData);
          
          // Store the generated schedule in local storage
          if (generatedSchedule) {
            localStorage.setItem(`event_schedule_${event.id}`, JSON.stringify(generatedSchedule));
          }
          
          setScheduleData(generatedSchedule);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching schedule:", err);
          setError("Failed to load schedule data");
          setLoading(false);
        }
      };
      
      fetchScheduleData();
    }
  }, [event]);
  
  // Generate a schedule based on the event and real teams
  const generateScheduleForEvent = (event, teamsData) => {
    // Check if we have enough teams to create a schedule
    if (!teamsData || teamsData.length < 2) {
      setError("Not enough teams registered to generate a schedule");
      return null;
    }
    
    // Create a copy of teams to work with
    const teams = [...teamsData];
    
    // Generate tournament dates (starting from event date or current date)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3); // Start 3 days from now
    
    // Calculate tournament structure based on number of teams
    const numTeams = teams.length;
    let tournamentDays, gamesPerDay;
    
    if (numTeams <= 4) {
      // Simple tournament: semifinals and finals
      tournamentDays = 2;
      gamesPerDay = [numTeams / 2, 1]; // semifinals, final
    } else if (numTeams <= 8) {
      // Quarterfinals, semifinals, final
      tournamentDays = 3;
      gamesPerDay = [numTeams / 2, numTeams / 4, 1]; // quarterfinals, semifinals, final
    } else {
      // Group stage, semifinals, final
      tournamentDays = 3;
      const groupMatches = Math.ceil(numTeams / 2);
      gamesPerDay = [groupMatches, 2, 1]; // group matches, semifinals, final
    }
    
    // Create schedule data structure
    const games = [];
    let gameId = 1;
    
    // Generate games for each tournament day
    for (let day = 0; day < tournamentDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      
      const dateStr = currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Different rounds based on the day
      let roundTitle;
      if (tournamentDays === 2) {
        roundTitle = day === 0 ? "Semi Finals" : "Finals";
      } else if (tournamentDays === 3) {
        if (numTeams <= 8) {
          switch (day) {
            case 0: roundTitle = "Quarter Finals"; break;
            case 1: roundTitle = "Semi Finals"; break;
            case 2: roundTitle = "Finals"; break;
            default: roundTitle = "Quarter Finals";
          }
        } else {
          switch (day) {
            case 0: roundTitle = "Group Stage"; break;
            case 1: roundTitle = "Semi Finals"; break;
            case 2: roundTitle = "Finals"; break;
            default: roundTitle = "Group Stage";
          }
        }
      }
      
      // Generate games for this day
      for (let gameNum = 0; gameNum < gamesPerDay[day]; gameNum++) {
        // Time slots with 2-hour intervals
        const hour = 9 + (gameNum * 2); // Starts at 9 AM
        const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        
        // Team selection logic
        let team1, team2;
        
        if (day === 0) {
          // First round - direct matchups from registered teams
          if (gameNum * 2 + 1 < teams.length) {
            team1 = teams[gameNum * 2];
            team2 = teams[gameNum * 2 + 1];
          } else if (gameNum * 2 < teams.length) {
            // Odd number of teams, last team gets a bye
            team1 = teams[gameNum * 2];
            team2 = { id: 'bye', team_name: 'Bye (Automatic Advance)' };
          }
        } else if (day === 1 && tournamentDays === 3) {
          // Semifinals or quarterfinals - winners determined dynamically
          if (gameNum === 0) {
            team1 = { id: "M1W", team_name: "Winner of Match 1" };
            team2 = { id: "M2W", team_name: "Winner of Match 2" };
          } else {
            team1 = { id: "M3W", team_name: "Winner of Match 3" };
            team2 = { id: "M4W", team_name: "Winner of Match 4" };
          }
        } else {
          // Finals
          team1 = { id: "SF1W", team_name: "Winner of SF1" };
          team2 = { id: "SF2W", team_name: "Winner of SF2" };
        }
        
        // Add game to schedule if both teams exist
        if (team1 && team2) {
          games.push({
            id: gameId++,
            title: `${roundTitle} - Match ${gameId - 1}`,
            team1: team1.team_name,
            team2: team2.team_name,
            time: timeStr,
            date: dateStr,
            venue: gameNum % 2 === 0 ? "Main Court" : "Secondary Court",
            status: "upcoming",
            team1Id: team1.id,
            team2Id: team2.id
          });
        }
      }
    }
    
    return {
      eventTitle: event.title,
      venue: event.location,
      teams: teams,
      games: games
    };
  };
  
  // Group games by date
  const gamesByDate = {};
  if (scheduleData && scheduleData.games) {
    scheduleData.games.forEach(game => {
      if (!gamesByDate[game.date]) {
        gamesByDate[game.date] = [];
      }
      gamesByDate[game.date].push(game);
    });
  }

  // Function to reset/regenerate schedule
  const handleRegenerateSchedule = () => {
    // Remove from local storage
    localStorage.removeItem(`event_schedule_${event.id}`);
    
    // Reset states
    setScheduleData(null);
    setLoading(true);
    setError(null);
    
    // This will trigger the useEffect to run again and generate a new schedule
    const fetchScheduleData = async () => {
      try {
        // API call to fetch teams for this event
        const response = await fetch(`/api/teams?event_id=${event.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }
        
        const teamsData = await response.json();
        
        // Generate schedule based on actual teams
        const generatedSchedule = generateScheduleForEvent(event, teamsData);
        
        // Store the generated schedule in local storage
        if (generatedSchedule) {
          localStorage.setItem(`event_schedule_${event.id}`, JSON.stringify(generatedSchedule));
        }
        
        setScheduleData(generatedSchedule);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Failed to load schedule data");
        setLoading(false);
      }
    };
    
    fetchScheduleData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {event.title} - Event Schedule
          </Typography>
        </Box>
        
        {/* Add refresh button to regenerate schedule */}
        <Tooltip title="Regenerate Schedule">
          <IconButton onClick={handleRegenerateSchedule} size="small" color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Display participating teams */}
      <Paper
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Participating Teams
          </Typography>
        </Box>
        
        <Grid container spacing={1}>
          {scheduleData && scheduleData.teams.map((team) => (
            <Grid item xs={6} sm={4} md={3} key={team.id}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1,
                  borderRadius: theme.shape.borderRadius,
                  backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: team.id % 4 === 0 ? theme.palette.primary.main : 
                             team.id % 4 === 1 ? theme.palette.secondary.main :
                             team.id % 4 === 2 ? theme.palette.error.main :
                             theme.palette.success.main,
                    mr: 1.5,
                    fontSize: '0.875rem',
                  }}
                >
                  {team.team_name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {team.team_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Max: {team.max_members} members
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Schedule Container */}
      <ScheduleContainer>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ borderRadius: theme.shape.borderRadius }}>
            <Typography variant="body2">
              This schedule is automatically generated based on the registered teams for {event.title}. Game times and venues may be subject to change.
            </Typography>
          </Alert>
        </Box>
        
        {scheduleData && Object.keys(gamesByDate).length > 0 ? (
          Object.keys(gamesByDate).map((date, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                pb: 1,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}>
                <CalendarTodayIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {date}
                </Typography>
              </Box>
              
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  borderRadius: theme.shape.borderRadius, 
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: alpha(theme.palette.primary.main, 0.05), 
                      '& th': { 
                        fontWeight: 600, 
                        color: theme.palette.text.primary 
                      } 
                    }}>
                      <TableCell>Time</TableCell>
                      <TableCell>Match</TableCell>
                      <TableCell>Teams</TableCell>
                      <TableCell>Venue</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gamesByDate[date].map((game) => (
                      <TableRow 
                        key={game.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.03) },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
                            {game.time}
                          </Box>
                        </TableCell>
                        <TableCell>{game.title}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: theme.palette.primary.light,
                                fontSize: '0.75rem',
                                mr: 1
                              }}
                            >
                              {game.team1.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {game.team1}
                            </Typography>
                            <Typography variant="body2" sx={{ mx: 1, color: theme.palette.text.secondary }}>vs</Typography>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                bgcolor: theme.palette.secondary.light,
                                fontSize: '0.75rem',
                                mr: 1
                              }}
                            >
                              {game.team2.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {game.team2}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.text.secondary }} />
                            {game.venue}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            size="small" 
                            label={game.status === "upcoming" ? "Upcoming" : "Completed"}
                            color={game.status === "upcoming" ? "primary" : "success"}
                            variant="outlined"
                            sx={{ 
                              fontWeight: 500,
                              borderRadius: '4px'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        ) : (
          <Alert severity="warning" sx={{ borderRadius: theme.shape.borderRadius }}>
            <Typography variant="body2">
              No schedule available. Please make sure enough teams are registered for this event.
            </Typography>
          </Alert>
        )}
        
        {/* Option to export or print schedule */}
        {scheduleData && scheduleData.games && scheduleData.games.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="outlined"
              startIcon={<CalendarTodayIcon />}
              size="small"
              sx={{ mr: 2 }}
              onClick={() => exportScheduleToICS(scheduleData)}
            >
              Export Schedule
            </Button>
            <Button 
              variant="contained" 
              disableElevation
              size="small"
              onClick={() => window.print()}
              startIcon={<PrintIcon />}
            >
              Print Schedule
            </Button>
          </Box>
        )}
      </ScheduleContainer>
    </Box>
  );
};

// Helper function to export schedule to ICS format
const exportScheduleToICS = (scheduleData) => {
  let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ASSCAT Intramurals//EN\n';
  
  scheduleData.games.forEach(game => {
    // Parse date and time
    const [month, day, year] = game.date.split(' ')[0].split(',')[0].split('/');
    const [time, ampm] = game.time.split(' ');
    const [hour, minute] = time.split(':');
    
    // Convert to 24-hour format
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour24 < 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    
    // Format date and time for ICS
    const startDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}T${hour24.toString().padStart(2, '0')}${minute.padStart(2, '0')}00`;
    
    // Add 2 hours for end time
    let endHour24 = hour24 + 2;
    if (endHour24 >= 24) endHour24 -= 24;
    const endDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}T${endHour24.toString().padStart(2, '0')}${minute.padStart(2, '0')}00`;
    
    // Add event to ICS
    icsContent += 'BEGIN:VEVENT\n';
    icsContent += `SUMMARY:${game.team1} vs ${game.team2}\n`;
    icsContent += `DTSTART:${startDate}\n`;
    icsContent += `DTEND:${endDate}\n`;
    icsContent += `LOCATION:${game.venue}\n`;
    icsContent += `DESCRIPTION:${game.title} for ${scheduleData.eventTitle}\n`;
    icsContent += 'END:VEVENT\n';
  });
  
  icsContent += 'END:VCALENDAR';
  
  // Create blob and download link
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${scheduleData.eventTitle.replace(/\s+/g, '-')}-schedule.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};