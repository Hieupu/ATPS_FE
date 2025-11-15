// MyProfile.js
import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Alert, Typography } from "@mui/material";
import {
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  updateAvatarApi,
} from "../../apiServices/profileService";
import AppHeader from "../../components/Header/AppHeader";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInformation from "./components/PersonalInformation";
import SecuritySection from "./components/SecuritySection";

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
      setFormData({
        ...profileData,
        Phone: profileData.account?.Phone || "",
      });
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
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "FullName" && value) {
      const generatedUsername = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
        .replace(/\s+/g, "");

      setFormData({
        ...formData,
        [name]: value,
        Username: generatedUsername,
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

  const handleShowPasswordToggle = (field, value) => {
    setShowPassword({
      ...showPassword,
      [field]: value,
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

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload an image file" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "File size must be less than 2MB" });
      return;
    }

    try {
      setLoading(true);

      const tempUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, ProfilePicture: tempUrl }));

      const updatedProfile = await updateAvatarApi(file);
      setProfile(updatedProfile.profile);

      URL.revokeObjectURL(tempUrl);

      setMessage({ type: "success", text: "Avatar updated successfully" });
    } catch (error) {
      fetchProfile();
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        pb: 6,
      }}
    >
      <AppHeader />

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {message.text && (
          <Alert
            severity={message.type}
            sx={{
              mb: 3,
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {message.text}
          </Alert>
        )}

        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          loading={loading}
          onEditToggle={handleEditToggle}
          onAvatarUpload={handleAvatarUpload}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <PersonalInformation
              profile={profile}
              formData={formData}
              isEditing={isEditing}
              loading={loading}
              onInputChange={handleInputChange}
              onSaveProfile={handleSaveProfile}
              onCancelEdit={handleEditToggle}
            />
          </Grid>

          <Grid item xs={12} lg={4}>
            <SecuritySection
              isChangingPassword={isChangingPassword}
              showPassword={showPassword}
              passwordData={passwordData}
              loading={loading}
              onPasswordToggle={handlePasswordToggle}
              onPasswordChange={handlePasswordChange}
              onShowPasswordToggle={handleShowPasswordToggle}
              onChangePassword={handleChangePassword}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MyProfile;