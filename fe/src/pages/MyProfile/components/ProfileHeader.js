// components/ProfileHeader.js
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

const ProfileHeader = ({
  profile,
  isEditing,
  loading,
  onEditToggle,
  onAvatarUpload,
}) => {
  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: "24px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          {/* Avatar Section */}
          <AvatarSection
            profile={profile}
            loading={loading}
            onAvatarUpload={onAvatarUpload}
          />

          {/* Profile Info */}
          <ProfileInfo profile={profile} />

          {/* Action Button */}
          <EditProfileButton isEditing={isEditing} onEditToggle={onEditToggle} />
        </Box>
      </CardContent>
    </Card>
  );
};

const AvatarSection = ({ profile, loading, onAvatarUpload }) => (
  <Box sx={{ position: "relative" }}>
    <Box
      sx={{
        p: 0.5,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "50%",
        display: "inline-block",
      }}
    >
      <Avatar
        src={profile.ProfilePicture}
        sx={{
          width: 120,
          height: 120,
          border: "4px solid white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      />
    </Box>
    <input
      accept="image/jpeg,image/png,image/gif"
      style={{ display: "none" }}
      id="avatar-upload"
      type="file"
      onChange={onAvatarUpload}
    />
    <label htmlFor="avatar-upload">
      <IconButton
        component="span"
        disabled={loading}
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          "&:hover": {
            background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
          },
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <UploadIcon />
      </IconButton>
    </label>
  </Box>
);

const ProfileInfo = ({ profile }) => (
  <Box sx={{ flex: 1, minWidth: 250 }}>
    <Typography
      variant="h4"
      fontWeight="700"
      sx={{
        mb: 1,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {profile.FullName || "User"}
    </Typography>
    <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
      <Chip
        label={profile.Role || "User"}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontWeight: 600,
          borderRadius: "8px",
        }}
      />
      {profile.account?.Email && (
        <Chip
          icon={<EmailIcon sx={{ color: "white !important" }} />}
          label={profile.account.Email}
          sx={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            fontWeight: 500,
            borderRadius: "8px",
          }}
        />
      )}
    </Box>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ maxWidth: 600 }}
    >
      JPG, PNG or GIF format. Maximum file size 2MB.
    </Typography>
  </Box>
);

const EditProfileButton = ({ isEditing, onEditToggle }) => (
  <Button
    variant="contained"
    startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
    onClick={onEditToggle}
    sx={{
      borderRadius: "12px",
      px: 3,
      py: 1.5,
      background: isEditing
        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      textTransform: "none",
      fontSize: "16px",
      fontWeight: 600,
      "&:hover": {
        boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        transform: "translateY(-2px)",
      },
      transition: "all 0.3s ease",
    }}
  >
    {isEditing ? "Cancel Edit" : "Edit Profile"}
  </Button>
);

export default ProfileHeader;