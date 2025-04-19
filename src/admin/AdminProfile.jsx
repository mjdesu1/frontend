import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  TextField,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null); // Store admin details
  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
  const [image, setImage] = useState(null); // Store uploaded image

  useEffect(() => {
    // Simulate fetching admin details from localStorage
    const storedAdmin = {
      full_name: localStorage.getItem("adminFullName") || "John Doe",
      email: localStorage.getItem("adminEmail") || "admin@example.com",
      role: localStorage.getItem("adminRole") || "Administrator",
    };
    setAdmin(storedAdmin);
  }, []);

  const handleSave = () => {
    // Save updated details to localStorage
    localStorage.setItem("adminFullName", admin.full_name);
    localStorage.setItem("adminEmail", admin.email);
    localStorage.setItem("adminRole", admin.role);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // Save the image as a base64 string
    };
    reader.readAsDataURL(file);
  };

  if (!admin) {
    return <p>Loading admin details...</p>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar
              sx={{ bgcolor: "#42a5f5", width: 80, height: 80 }}
              src={image}
            >
              {!image && <AccountCircleIcon sx={{ fontSize: 50 }} />}
            </Avatar>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                <TextField
                  label="Full Name"
                  value={admin.full_name}
                  onChange={(e) =>
                    setAdmin({ ...admin, full_name: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={admin.email}
                  onChange={(e) =>
                    setAdmin({ ...admin, email: e.target.value })
                  }
                  fullWidth
                  sx={{ mt: 2 }}
                />
                <TextField
                  label="Role"
                  value={admin.role}
                  onChange={(e) =>
                    setAdmin({ ...admin, role: e.target.value })
                  }
                  fullWidth
                  sx={{ mt: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  sx={{ mt: 2 }}
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {admin.full_name}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {admin.email}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: "#42a5f5",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: "bold",
                  }}
                >
                  {admin.role}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(true)}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminProfile;