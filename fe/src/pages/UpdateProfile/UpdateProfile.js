
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { PhotoCamera, Save, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getUserById, updateUser, getUserProfile, updateUserProfile , getUserRole } from '../../apiServices/userService';

const UpdateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    status: 'active'
  });

  const [profileData, setProfileData] = useState({
    fullName: '',
    dateOfBirth: '',
    job: '',
    address: '',
    major: '',
    cv: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (location.state?.user) {
      initializeUserData(location.state.user);
    } else {
      fetchUserData();
    }
  }, [id, location.state]);

  const initializeUserData = (userData) => {
    setUser(userData);
    setFormData({
      username: userData.Username || '',
      email: userData.Email || '',
      phone: userData.Phone || '',
      status: userData.Status || 'active'
    });
    fetchProfileData(userData);
  };

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data for ID:', id);
      const userData = await getUserById(id);
      console.log('User data received:', userData);
      
      if (!userData) {
        setMessage({ type: 'error', text: 'User not found' });
        setLoading(false);
        return;
      }
      
      initializeUserData(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage({ type: 'error', text: 'Failed to load user data: ' + error.message });
      setLoading(false);
    }
  };

  const fetchProfileData = async (userData) => {
    try {
      // Sử dụng API mới để lấy role chính xác
      const role = await getUserRole(id);
      console.log('Detected role:', role);
      
      if (!role) {
        console.warn('No role detected for user');
        return;
      }
      
      const profileData = await getUserProfile(id, role);
      console.log('Profile data received:', profileData);
      
      setProfile(profileData);
      setProfileData({
        fullName: profileData.FullName || '',
        dateOfBirth: profileData.DateOfBirth ? formatDateForInput(profileData.DateOfBirth) : '',
        job: profileData.Job || '',
        address: profileData.Address || '',
        major: profileData.Major || '',
        cv: profileData.CV || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'warning', text: 'Profile data not available' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleFromUsername = (username) => {
    if (username.includes('parent')) return 'parent';
    if (username.includes('instructor')) return 'instructor';
    if (username.includes('learner')) return 'learner';
    return 'user';
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Update basic user info
      await updateUser(id, formData);

      // Update profile info
      const role = getRoleFromUsername(user.Username);
      await updateUserProfile(id, role, profileData);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const getRoleSpecificFields = () => {
    const role = getRoleFromUsername(user?.Username);
    
    switch (role) {
      case 'instructor':
        return (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Major"
              name="major"
              value={profileData.major}
              onChange={handleProfileChange}
              placeholder="Enter your major"
            />
          </Grid>
        );
      case 'learner':
        return (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Learning Preferences"
              name="learningPreferences"
              multiline
              rows={3}
              placeholder="Describe your learning preferences"
            />
          </Grid>
        );
      case 'parent':
        return (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Relationship"
              name="relationship"
              placeholder="Relationship to learner"
            />
          </Grid>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user) {
    return <Typography>User not found</Typography>;
  }

  const role = getRoleFromUsername(user.Username);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/users')}
          sx={{ mb: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Update Profile
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Manage personal information and account settings for {user.Username}
        </Typography>
        <Chip 
          label={role.charAt(0).toUpperCase() + role.slice(1)} 
          color="primary" 
          sx={{ mt: 1 }}
        />
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column - Profile Picture and Navigation */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Learning Preferences
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Notification Settings
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Privacy & Security
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Profile Picture
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 100, height: 100, mb: 2 }}
                src={profile?.ProfilePicture || `/api/images/${profile?.ProfilePicture}`}
              >
                {profileData.fullName?.charAt(0) || user.Username?.charAt(0)}
              </Avatar>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                component="label"
              >
                Upload new photo
                <input type="file" hidden accept="image/*" />
              </Button>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                JPG, PNG or GIF. Max size 2MB.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Forms */}
        <Grid item xs={12} md={8}>
          {/* Personal Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Update your basic information
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={handleProfileChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job"
                  name="job"
                  value={profileData.job}
                  onChange={handleProfileChange}
                  placeholder="Enter your job"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Role-specific fields */}
              {getRoleSpecificFields()}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Change Password */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Update your password to keep your account secure
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Password must be at least 8 characters long and include uppercase, lowercase, and numbers.
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Save Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UpdateProfile;