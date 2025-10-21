import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { getProfileApi, updateProfileApi, changePasswordApi, updateAvatarApi } from "../../apiServices/profileService";
import AppHeader from "../../components/Header/AppHeader";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await getProfileApi();
      setProfile(profileData);
      setFormData(profileData);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load profile" });
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setFormData(profile);
    }
  };

  const handlePasswordToggle = () => {
    setIsChangingPassword(!isChangingPassword);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'FullName' && value) {
      const generatedUsername = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '');
      
      setFormData({
        ...formData,
        [name]: value,
        Username: generatedUsername
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updatedProfile = await updateProfileApi(formData);
      setProfile(updatedProfile.profile);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      await changePasswordApi({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully" });
      handlePasswordToggle();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: "error", text: "Please upload an image file" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size must be less than 2MB" });
      return;
    }

    try {
      setLoading(true);
      const avatarUrl = URL.createObjectURL(file);
      const updatedProfile = await updateAvatarApi(avatarUrl);
      setProfile(updatedProfile.profile);
      setMessage({ type: "success", text: "Avatar updated successfully" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getRoleSpecificFields = () => {
    if (!profile) return null;

    const commonFields = (
      <>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Name"
            name="FullName"
            value={formData.FullName || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#6366f1' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#6366f1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="Phone"
            value={formData.account?.Phone || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: '#6366f1' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#6366f1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date of Birth"
            name="DateOfBirth"
            type="date"
            value={formData.DateOfBirth ? formData.DateOfBirth.split('T')[0] : ""}
            onChange={handleInputChange}
            disabled={!isEditing}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon sx={{ color: '#6366f1' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#6366f1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Job"
            name="Job"
            value={formData.Job || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WorkIcon sx={{ color: '#6366f1' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#6366f1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="Address"
            value={formData.Address || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
            multiline
            rows={2}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HomeIcon sx={{ color: '#6366f1' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: '#6366f1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6366f1',
                },
              },
            }}
          />
        </Grid>
      </>
    );

    if (profile.Role === 'instructor') {
      return (
        <>
          {commonFields}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Major"
              name="Major"
              value={formData.Major || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon sx={{ color: '#6366f1' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
              }}
            />
          </Grid>
        </>
      );
    }

    return commonFields;
  };

  if (!profile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: "100vh",
      pb: 6
    }}>
      <AppHeader />

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ 
              mb: 3,
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            {message.text}
          </Alert>
        )}

        {/* Profile Header Card */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'visible'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              {/* Avatar Section */}
              <Box sx={{ position: 'relative' }}>
                <Box sx={{
                  p: 0.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'inline-block'
                }}>
                  <Avatar 
                    src={profile.ProfilePicture} 
                    sx={{ 
                      width: 120, 
                      height: 120,
                      border: '4px solid white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }} 
                  />
                </Box>
                <input
                  accept="image/jpeg,image/png,image/gif"
                  style={{ display: "none" }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarUpload}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    disabled={loading}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    <UploadIcon />
                  </IconButton>
                </label>
              </Box>

              {/* Profile Info */}
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Typography variant="h4" fontWeight="700" sx={{ 
                  mb: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {profile.FullName || 'User'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={profile.Role || 'User'} 
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }} 
                  />
                  {profile.account?.Email && (
                    <Chip 
                      icon={<EmailIcon sx={{ color: 'white !important' }} />}
                      label={profile.account.Email} 
                      sx={{ 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        fontWeight: 500,
                        borderRadius: '8px'
                      }} 
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>
                  JPG, PNG or GIF format. Maximum file size 2MB.
                </Typography>
              </Box>

              {/* Action Button */}
              <Button
                variant="contained"
                startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                  background: isEditing 
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Personal Information Card */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ 
              borderRadius: '24px',
              background: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="700">
                      Personal Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your personal details here
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={profile.account?.Email || ""}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#9ca3af' }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Email address cannot be changed"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#f9fafb'
                        },
                      }}
                    />
                  </Grid>
                  {getRoleSpecificFields()}
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                      sx={{
                        borderRadius: '12px',
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        textTransform: 'none',
                        fontSize: '16px',
                        fontWeight: 600,
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={handleEditToggle}
                      sx={{
                        borderRadius: '12px',
                        px: 4,
                        py: 1.5,
                        borderColor: '#667eea',
                        color: '#667eea',
                        textTransform: 'none',
                        fontSize: '16px',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#764ba2',
                          color: '#764ba2',
                          bgcolor: 'rgba(102, 126, 234, 0.04)',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Security Card */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 3
                }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LockIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="700">
                      Security
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Keep your account secure
                    </Typography>
                  </Box>
                </Box>

                {!isChangingPassword ? (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                      Regular password updates help protect your account from unauthorized access.
                    </Typography>
                    <Button 
                      variant="contained"
                      fullWidth
                      onClick={handlePasswordToggle}
                      sx={{
                        borderRadius: '12px',
                        py: 1.5,
                        background: 'white',
                        color: '#667eea',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        textTransform: 'none',
                        fontSize: '16px',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'rgba(255,255,255,0.95)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                        }
                      }}
                    >
                      Change Password
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowPassword({ ...showPassword, current: !showPassword.current })
                                }
                                sx={{ color: '#667eea' }}
                              >
                                {showPassword.current ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& fieldset': {
                              borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowPassword({ ...showPassword, new: !showPassword.new })
                                }
                                sx={{ color: '#667eea' }}
                              >
                                {showPassword.new ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& fieldset': {
                              borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                                }
                                sx={{ color: '#667eea' }}
                              >
                                {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& fieldset': {
                              borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 2 }}>
                        Password must be at least 8 characters with uppercase, lowercase, and numbers.
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", gap: 1, flexDirection: 'column' }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          onClick={handleChangePassword} 
                          disabled={loading}
                          sx={{
                            borderRadius: '12px',
                            py: 1.5,
                            background: 'white',
                            color: '#667eea',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            textTransform: 'none',
                            fontSize: '16px',
                            fontWeight: 600,
                            '&:hover': {
                              background: 'rgba(255,255,255,0.95)',
                            }
                          }}
                        >
                          Update Password
                        </Button>
                        <Button 
                          variant="outlined" 
                          fullWidth
                          onClick={handlePasswordToggle}
                          sx={{
                            borderRadius: '12px',
                            py: 1.5,
                            borderColor: 'white',
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '16px',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: 'white',
                              background: 'rgba(255,255,255,0.1)',
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MyProfile;