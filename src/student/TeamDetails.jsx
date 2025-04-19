import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TeamDetails = () => {
  const { teamId } = useParams(); // Get team ID from the URL
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);

  // Fetch team details
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/teams/${teamId}`)
      .then((response) => {
        setTeam(response.data);
      })
      .catch((error) => console.error("Error fetching team details:", error));
  }, [teamId]);

  // Fetch team members
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/teams/${teamId}/members`)
      .then((response) => {
        setMembers(response.data);
      })
      .catch((error) => console.error("Error fetching team members:", error));
  }, [teamId]);

  if (!team) {
    return <p>Loading team details...</p>;
  }

  return (
    <div className="container mt-5">
      <h2>Team Details: {team.team_name}</h2>
      <p>Status: {team.status}</p>
      <p>Max Members: {team.max_members}</p>
      <p>Current Members: {team.current_members}</p>

      <h3>Team Members</h3>
      {members.length > 0 ? (
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.full_name} ({member.email})
            </li>
          ))}
        </ul>
      ) : (
        <p>No members in this team.</p>
      )}
    </div>
  );
};

export default TeamDetails;