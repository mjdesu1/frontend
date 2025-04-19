import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Tooltip,
  FormHelperText,
  InputAdornment
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

const UserManagement = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
    full_name: "",
    email: "",
    phone_number: "",
    role: "student",
    department: ""
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Alert state
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" // success, error, warning, info
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        user => 
          user.username.toLowerCase().includes(term) ||
          user.full_name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.department && user.department.toLowerCase().includes(term))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Fetch all users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAlert({
        open: true,
        message: "Failed to fetch users data. Please try again.",
        severity: "error"
      });
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = "Username is required";
    if (openAddDialog && !formData.password) errors.password = "Password is required";
    if (openAddDialog && formData.password !== formData.confirm_password) errors.confirm_password = "Passwords do not match";
    if (!formData.full_name) errors.full_name = "Full name is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone_number) errors.phone_number = "Phone number is required";
    
    if (formData.role === "student" && !formData.department) errors.department = "Department is required for students";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setFormData({
      username: "",
      password: "",
      confirm_password: "",
      full_name: "",
      email: "",
      phone_number: "",
      role: "student",
      department: ""
    });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: "",
      confirm_password: "",
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      department: user.department || ""
    });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  // API actions
  const handleAddUser = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Remove confirm_password field from request
      const { confirm_password, ...requestData } = formData;
      
      await axios.post("http://localhost:5000/api/users", requestData);
      
      fetchUsers();
      handleCloseDialog();
      setAlert({
        open: true,
        message: "User added successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error adding user:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to add user",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Remove confirm_password field from request
      const { confirm_password, ...requestData } = formData;
      
      // If password is empty, remove it from the request
      if (!requestData.password) {
        delete requestData.password;
      }
      
      await axios.put(`http://localhost:5000/api/users/${selectedUser.id}`, requestData);
      
      fetchUsers();
      handleCloseDialog();
      setAlert({
        open: true,
        message: "User updated successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error updating user:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to update user",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/users/${selectedUser.id}`);
      
      fetchUsers();
      handleCloseDialog();
      setAlert({
        open: true,
        message: "User deleted successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to delete user",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Close alert
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "#fff"
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "#1565c0" }}>
            User Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "capitalize",
              px: 3
            }}
          >
            Add User
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Full Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                backgroundColor: user.role === "admin" ? "#e1f5fe" : "#e8f5e9",
                                color: user.role === "admin" ? "#0277bd" : "#2e7d32",
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                display: "inline-block",
                                fontWeight: "medium",
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                              }}
                            >
                              {user.role}
                            </Box>
                          </TableCell>
                          <TableCell>{user.department || "-"}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Edit User">
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenEditDialog(user)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleOpenDeleteDialog(user)}
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
          Add New User
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="username"
                label="Username/Email"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.username}
                onChange={handleFormChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="full_name"
                label="Full Name"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.full_name}
                onChange={handleFormChange}
                error={!!formErrors.full_name}
                helperText={formErrors.full_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.password}
                onChange={handleFormChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="confirm_password"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.confirm_password}
                onChange={handleFormChange}
                error={!!formErrors.confirm_password}
                helperText={formErrors.confirm_password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleToggleConfirmPasswordVisibility} edge="end">
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone_number"
                label="Phone Number"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.phone_number}
                onChange={handleFormChange}
                error={!!formErrors.phone_number}
                helperText={formErrors.phone_number}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                  labelId="role-select-label"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                margin="normal" 
                disabled={formData.role !== "student"}
                error={!!formErrors.department}
              >
                <InputLabel id="department-select-label">Department</InputLabel>
                <Select
                  labelId="department-select-label"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  label="Department"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="BSIT">BSIT</MenuItem>
                  <MenuItem value="BSCS">BSCS</MenuItem>
                  <MenuItem value="BSIS">BSIS</MenuItem>
                  <MenuItem value="BSCE">BSCE</MenuItem>
                  <MenuItem value="BSEE">BSEE</MenuItem>
                  <MenuItem value="BSME">BSME</MenuItem>
                </Select>
                {formErrors.department && (
                  <FormHelperText>{formErrors.department}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
          Edit User - {selectedUser?.full_name}
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="username"
                label="Username/Email"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.username}
                onChange={handleFormChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="full_name"
                label="Full Name"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.full_name}
                onChange={handleFormChange}
                error={!!formErrors.full_name}
                helperText={formErrors.full_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="Password (Leave blank to keep current)"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.password}
                onChange={handleFormChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="confirm_password"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.confirm_password}
                onChange={handleFormChange}
                error={!!formErrors.confirm_password}
                helperText={formErrors.confirm_password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleToggleConfirmPasswordVisibility} edge="end">
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone_number"
                label="Phone Number"
                fullWidth
                variant="outlined"
                margin="normal"
                value={formData.phone_number}
                onChange={handleFormChange}
                error={!!formErrors.phone_number}
                helperText={formErrors.phone_number}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-edit-select-label">Role</InputLabel>
                <Select
                  labelId="role-edit-select-label"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                margin="normal" 
                disabled={formData.role !== "student"}
                error={!!formErrors.department}
              >
                <InputLabel id="department-edit-select-label">Department</InputLabel>
                <Select
                  labelId="department-edit-select-label"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  label="Department"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="BSIT">BSIT</MenuItem>
                  <MenuItem value="BSCS">BSCS</MenuItem>
                  <MenuItem value="BSIS">BSIS</MenuItem>
                  <MenuItem value="BSCE">BSCE</MenuItem>
                  <MenuItem value="BSEE">BSEE</MenuItem>
                  <MenuItem value="BSME">BSME</MenuItem>
                </Select>
                {formErrors.department && (
                  <FormHelperText>{formErrors.department}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateUser} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Update User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{selectedUser?.full_name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;