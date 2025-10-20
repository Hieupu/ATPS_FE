
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Container
} from '@mui/material';
import { Edit, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../apiServices/userService';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRole = (username) => {
    if (username.includes('parent')) return 'Parent';
    if (username.includes('instructor')) return 'Instructor';
    if (username.includes('learner')) return 'Learner';
    return 'User';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  const handleEditUser = (user) => {
    navigate(`/update-profile/${user.AccID}`, { state: { user } });
  };

  if (loading) {
    return <Typography>Loading users...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Click edit icon to update user profile
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.AccID}>
                  <TableCell>{user.AccID}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="action" />
                      {user.Username}
                    </Box>
                  </TableCell>
                  <TableCell>{user.Email}</TableCell>
                  <TableCell>{user.Phone}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getRole(user.Username)} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.Status} 
                      size="small" 
                      color={getStatusColor(user.Status)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default UserListPage;