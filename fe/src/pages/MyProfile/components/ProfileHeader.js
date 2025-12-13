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
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

const ProfileHeader = ({
  profile,
  isEditing,
  loading,
  onEditToggle,
  onAvatarUpload,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e0e0e0",
        overflow: "visible",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 2, sm: 3 },
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          {/* Phần Avatar */}
          <AvatarSection
            profile={profile}
            loading={loading}
            onAvatarUpload={onAvatarUpload}
          />

          {/* Thông tin hồ sơ */}
          <ProfileInfo profile={profile} />

          {/* Nút hành động */}
          <Box sx={{ ml: "auto", mt: { xs: 2, md: 0 } }}>
            <EditProfileButton 
              isEditing={isEditing} 
              onEditToggle={onEditToggle} 
            />
          </Box>
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
        background: "linear-gradient(135deg, #e8e9f4ff 0%, #ecedf8ff 100%)",
        borderRadius: "50%",
        display: "inline-block",
      }}
    >
      <Avatar
        src={profile.ProfilePicture}
        alt="Ảnh đại diện"
        sx={{
          width: { xs: 100, sm: 120 },
          height: { xs: 100, sm: 120 },
          border: "4px solid white",
          boxShadow: "0 4px 12px rgba(26, 35, 126, 0.15)",
          fontSize: { xs: "2.5rem", sm: "3rem" },
        }}
      >
        {!profile.ProfilePicture && profile.FullName?.charAt(0)}
      </Avatar>
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
          bottom: 8,
          right: 8,
          backgroundColor: "#1a237e",
          color: "white",
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          "&:hover": {
            backgroundColor: "#283593",
            transform: "scale(1.1)",
          },
          boxShadow: "0 3px 10px rgba(26, 35, 126, 0.3)",
          transition: "all 0.2s ease",
        }}
      >
        <UploadIcon fontSize="small" />
      </IconButton>
    </label>
  </Box>
);

const ProfileInfo = ({ profile }) => (
  <Box sx={{ flex: 1, minWidth: 250 }}>
    <Typography
      variant="h5"
      fontWeight="600"
      sx={{
        mb: 1,
        color: "#1a237e",
        fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
      }}
    >
      {profile.FullName || "Người dùng"}
    </Typography>
    
    <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
      <Chip
        icon={<BadgeIcon sx={{ fontSize: 16 }} />}
        label={profile.Role || "Người dùng"}
        sx={{
          backgroundColor: "#f5f5f5",
          color: "#424242",
          fontWeight: 500,
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          "& .MuiChip-icon": {
            color: "#1a237e",
          },
        }}
      />
      {profile.account?.Email && (
        <Chip
          icon={<EmailIcon sx={{ fontSize: 16 }} />}
          label={profile.account.Email}
          sx={{
            backgroundColor: "#e8eaf6",
            color: "#1a237e",
            fontWeight: 500,
            borderRadius: "8px",
            border: "1px solid #c5cae9",
            "& .MuiChip-icon": {
              color: "#3949ab",
            },
          }}
        />
      )}
    </Box>
    
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ 
        display: "block",
        maxWidth: 500,
        color: "#757575",
        fontSize: "0.75rem",
        lineHeight: 1.4,
      }}
    >
      Định dạng ảnh: JPG, PNG hoặc GIF. Kích thước tối đa 2MB.
    </Typography>
  </Box>
);

const EditProfileButton = ({ isEditing, onEditToggle }) => (
  <Button
    variant={isEditing ? "outlined" : "contained"}
    startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
    onClick={onEditToggle}
    sx={{
      borderRadius: "10px",
      px: 3,
      py: 1,
      minWidth: 140,
      backgroundColor: isEditing ? "#ffffff" : "#1a237e",
      color: isEditing ? "#d32f2f" : "#ffffff",
      borderColor: isEditing ? "#d32f2f" : "transparent",
      borderWidth: isEditing ? 2 : 0,
      textTransform: "none",
      fontSize: "0.9375rem",
      fontWeight: 500,
      "&:hover": {
        backgroundColor: isEditing ? "#ffebee" : "#283593",
        borderColor: isEditing ? "#d32f2f" : "transparent",
        transform: "translateY(-1px)",
      },
      transition: "all 0.2s ease",
      boxShadow: isEditing ? "none" : "0 3px 12px rgba(26, 35, 126, 0.2)",
    }}
  >
    {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
  </Button>
);

export default ProfileHeader;