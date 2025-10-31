import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
  Tooltip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  PhotoCamera,
  Save,
  Visibility,
  VisibilityOff,
  UploadFile,
  Language,
  Notifications,
  Security,
  Palette,
  CloudUpload,
  CheckCircle,
  HourglassEmpty,
} from "@mui/icons-material";
import "./style.css";

export default function InstructorSettings() {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    schedule: true,
  });

  // Dữ liệu giảng viên
  const [profile, setProfile] = useState({
    name: "Dr. Nguyễn Văn An",
    email: "an.nguyen@university.edu.vn",
    phone: "+84 912 345 678",
    bio: "Giảng viên cao cấp với 15 năm kinh nghiệm giảng dạy Lập trình Web và Mobile. Tác giả 3 sách về React Native.",
    specialty: "Web Development, Mobile App",
    experience: "15 years",
    degree: "Ph.D. in Computer Science",
    university: "ĐH Bách Khoa Hà Nội",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [verificationStatus, setVerificationStatus] = useState("verified"); // pending, verified, rejected
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "PhD_Diploma.pdf", size: "2.1 MB", status: "verified" },
    { name: "Teaching_Certificate.pdf", size: "1.8 MB", status: "verified" },
  ]);

  const handleProfileChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswords({ ...passwords, [field]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles([...uploadedFiles, {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: "pending"
      }]);
    }
  };

  return (
    <div className="instructor-page">
      <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your profile, security, and preferences
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            mb: 3,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
            "& .Mui-selected": { color: "#667eea" },
            "& .MuiTabs-indicator": { backgroundColor: "#667eea" },
          }}
        >
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="Verification" />
          <Tab label="Preferences" />
        </Tabs>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Avatar & Basic Info */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, textAlign: "center", p: 3 }}>
                <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: 48,
                      bgcolor: "#667eea",
                      fontWeight: 600,
                    }}
                  >
                    NA
                  </Avatar>
                  <Tooltip title="Change Photo">
                    <IconButton
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        bgcolor: "#667eea",
                        color: "white",
                        "&:hover": { bgcolor: "#5568d3" },
                      }}
                      size="small"
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {profile.name}
                </Typography>
                <Chip
                  label="Verified Instructor"
                  size="small"
                  color="success"
                  icon={<CheckCircle />}
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>

            {/* Profile Form */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profile.name}
                      onChange={handleProfileChange("name")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profile.email}
                      onChange={handleProfileChange("email")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={profile.phone}
                      onChange={handleProfileChange("phone")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="University"
                      value={profile.university}
                      onChange={handleProfileChange("university")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={3}
                      value={profile.bio}
                      onChange={handleProfileChange("bio")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Specialty"
                      value={profile.specialty}
                      onChange={handleProfileChange("specialty")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Experience"
                      value={profile.experience}
                      onChange={handleProfileChange("experience")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Degree"
                      value={profile.degree}
                      onChange={handleProfileChange("degree")}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    sx={{
                      backgroundColor: "#667eea",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#5568d3" },
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Card sx={{ borderRadius: 3, p: 4, maxWidth: 600, mx: "auto" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <Security /> Change Password
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPassword ? "text" : "password"}
                value={passwords.current}
                onChange={handlePasswordChange("current")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={passwords.new}
                onChange={handlePasswordChange("new")}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                value={passwords.confirm}
                onChange={handlePasswordChange("confirm")}
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                Password must be at least 8 characters, include uppercase, lowercase, number, and special character.
              </Alert>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: "#667eea",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#5568d3" },
                }}
              >
                Update Password
              </Button>
            </Stack>
          </Card>
        )}

        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Instructor Verification
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload credentials to verify your teaching qualifications
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      verificationStatus === "verified" ? "Verified" :
                      verificationStatus === "pending" ? "Pending" : "Not Verified"
                    }
                    color={
                      verificationStatus === "verified" ? "success" :
                      verificationStatus === "pending" ? "warning" : "error"
                    }
                    icon={
                      verificationStatus === "verified" ? <CheckCircle /> :
                      verificationStatus === "pending" ? <HourglassEmpty /> : null
                    }
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Uploaded Documents
                </Typography>

                {uploadedFiles.map((file, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      border: "1px solid #e2e8f0",
                      borderRadius: 2,
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <UploadFile color="action" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {file.size}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={file.status}
                      size="small"
                      color={file.status === "verified" ? "success" : "warning"}
                    />
                  </Box>
                ))}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{ textTransform: "none" }}
                  >
                    Upload New Document
                    <input type="file" hidden accept=".pdf" onChange={handleFileUpload} />
                  </Button>
                </Box>

                {verificationStatus === "pending" && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    Your documents are under review. This usually takes 1-3 business days.
                  </Alert>
                )}
              </Card>
            </Grid>
          </Grid>
        )}

        {tabValue === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <Notifications /> Notifications
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} />}
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={<Switch checked={notifications.push} onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })} />}
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={<Switch checked={notifications.schedule} onChange={(e) => setNotifications({ ...notifications, schedule: e.target.checked })} />}
                    label="Schedule Reminders"
                  />
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <Palette /> Appearance
                </Typography>
                <FormControlLabel
                  control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
                  label="Dark Mode"
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <Language /> Language
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Preferred Language</InputLabel>
                  <Select defaultValue="vi">
                    <MenuItem value="vi">Tiếng Việt</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </div>
  );
}