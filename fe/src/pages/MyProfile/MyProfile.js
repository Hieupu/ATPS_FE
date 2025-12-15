// MyProfile.js
import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Alert, Typography } from "@mui/material";
import { toast } from "react-toastify";
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
      toast.error("Không thể tải thông tin hồ sơ");
    }
  };

 const handleEditToggle = () => {
  setIsEditing(!isEditing);
  if (isEditing) {
    // Reset lại formData khi hủy, bao gồm cả Phone từ account
    setFormData({
      ...profile,
      Phone: profile.account?.Phone || "",
    });
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

  const validatePassword = (password) => {
    // Kiểm tra khoảng trắng
    if (/\s/.test(password)) {
      toast.error("Mật khẩu không được chứa khoảng trắng");
      return false;
    }

    // Kiểm tra độ dài tối thiểu 8 ký tự
    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }

    // Kiểm tra có chứa số
    if (!/\d/.test(password)) {
      toast.error("Mật khẩu phải chứa ít nhất 1 chữ số");
      return false;
    }

    // Kiểm tra có chứa chữ cái
    if (!/[a-zA-Z]/.test(password)) {
      toast.error("Mật khẩu phải chứa ít nhất 1 chữ cái");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updatedProfile = await updateProfileApi(formData);
      setProfile(updatedProfile.profile);
      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công");
    } catch (error) {
      toast.error(error.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Kiểm tra mật khẩu hiện tại không được để trống
    if (!passwordData.currentPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    // Kiểm tra mật khẩu mới không được để trống
    if (!passwordData.newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    // Validate mật khẩu mới
    if (!validatePassword(passwordData.newPassword)) {
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    // Kiểm tra mật khẩu mới không được giống mật khẩu cũ
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    try {
      setLoading(true);
      await changePasswordApi({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      handlePasswordToggle();
    } catch (error) {
      toast.error(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng tải lên file hình ảnh");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước file phải nhỏ hơn 2MB");
      return;
    }

    try {
      setLoading(true);

      const tempUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, ProfilePicture: tempUrl }));

      const updatedProfile = await updateAvatarApi(file);
      setProfile(updatedProfile.profile);

      URL.revokeObjectURL(tempUrl);

      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      fetchProfile();
      toast.error(error.message || "Cập nhật ảnh đại diện thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Box
      sx={{
        background: "#fff",
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