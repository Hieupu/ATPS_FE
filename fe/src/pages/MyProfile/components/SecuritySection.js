// components/SecuritySection.js
import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const SecuritySection = ({
  isChangingPassword,
  showPassword,
  passwordData,
  loading,
  onPasswordToggle,
  onPasswordChange,
  onChangePassword,
  onShowPasswordToggle,
}) => {
  return (
    <Card
      sx={{
        borderRadius: "24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        color: "white",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <SectionHeader
          icon={<LockIcon />}
          title="Security"
          subtitle="Keep your account secure"
        />

        {!isChangingPassword ? (
          <PasswordOverview onPasswordToggle={onPasswordToggle} />
        ) : (
          <PasswordChangeForm
            showPassword={showPassword}
            passwordData={passwordData}
            loading={loading}
            onPasswordChange={onPasswordChange}
            onShowPasswordToggle={onShowPasswordToggle}
            onChangePassword={onChangePassword}
            onCancel={onPasswordToggle}
          />
        )}
      </CardContent>
    </Card>
  );
};

const SectionHeader = ({ icon, title, subtitle }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      mb: 3,
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "12px",
        background: "rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {React.cloneElement(icon, { sx: { color: "white", fontSize: 28 } })}
    </Box>
    <Box>
      <Typography variant="h5" fontWeight="700">
        {title}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

const PasswordOverview = ({ onPasswordToggle }) => (
  <Box>
    <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
      Regular password updates help protect your account from unauthorized access.
    </Typography>
    <Button
      variant="contained"
      fullWidth
      onClick={onPasswordToggle}
      sx={{
        borderRadius: "12px",
        py: 1.5,
        background: "white",
        color: "#667eea",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        textTransform: "none",
        fontSize: "16px",
        fontWeight: 600,
        "&:hover": {
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        },
      }}
    >
      Change Password
    </Button>
  </Box>
);

const PasswordChangeForm = ({
  showPassword,
  passwordData,
  loading,
  onPasswordChange,
  onShowPasswordToggle,
  onChangePassword,
  onCancel,
}) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <PasswordField
        label="Current Password"
        name="currentPassword"
        showPassword={showPassword.current}
        value={passwordData.currentPassword}
        onChange={onPasswordChange}
        onToggleShowPassword={() =>
          onShowPasswordToggle("current", !showPassword.current)
        }
      />
    </Grid>

    <Grid item xs={12}>
      <PasswordField
        label="New Password"
        name="newPassword"
        showPassword={showPassword.new}
        value={passwordData.newPassword}
        onChange={onPasswordChange}
        onToggleShowPassword={() =>
          onShowPasswordToggle("new", !showPassword.new)
        }
      />
    </Grid>

    <Grid item xs={12}>
      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        showPassword={showPassword.confirm}
        value={passwordData.confirmPassword}
        onChange={onPasswordChange}
        onToggleShowPassword={() =>
          onShowPasswordToggle("confirm", !showPassword.confirm)
        }
      />
    </Grid>

    <Grid item xs={12}>
      <Typography
        variant="caption"
        sx={{ opacity: 0.9, display: "block", mb: 2 }}
      >
        Password must be at least 8 characters with uppercase, lowercase, and numbers.
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <ActionButtons
        loading={loading}
        onChangePassword={onChangePassword}
        onCancel={onCancel}
      />
    </Grid>
  </Grid>
);

const PasswordField = ({
  label,
  name,
  showPassword,
  value,
  onChange,
  onToggleShowPassword,
}) => (
  <TextField
    fullWidth
    label={label}
    name={name}
    type={showPassword ? "text" : "password"}
    value={value}
    onChange={onChange}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={onToggleShowPassword} sx={{ color: "#667eea" }}>
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        bgcolor: "white",
        "& fieldset": {
          borderColor: "transparent",
        },
        "&:hover fieldset": {
          borderColor: "#667eea",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#667eea",
        },
      },
    }}
  />
);

const ActionButtons = ({ loading, onChangePassword, onCancel }) => (
  <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
    <Button
      variant="contained"
      fullWidth
      onClick={onChangePassword}
      disabled={loading}
      sx={{
        borderRadius: "12px",
        py: 1.5,
        background: "white",
        color: "#667eea",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        textTransform: "none",
        fontSize: "16px",
        fontWeight: 600,
        "&:hover": {
          background: "rgba(255,255,255,0.95)",
        },
      }}
    >
      Update Password
    </Button>
    <Button
      variant="outlined"
      fullWidth
      onClick={onCancel}
      sx={{
        borderRadius: "12px",
        py: 1.5,
        borderColor: "white",
        color: "white",
        textTransform: "none",
        fontSize: "16px",
        fontWeight: 600,
        "&:hover": {
          borderColor: "white",
          background: "rgba(255,255,255,0.1)",
        },
      }}
    >
      Cancel
    </Button>
  </Box>
);

export default SecuritySection;