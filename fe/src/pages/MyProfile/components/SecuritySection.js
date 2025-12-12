// components/SecuritySection.js
import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
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
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 4px 12px rgba(13, 37, 77, 0.05)",
        border: "1px solid #e2e8f0",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "#0d254d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="600" sx={{ color: "#0d254d" }}>
              Bảo mật
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Quản lý mật khẩu
            </Typography>
          </Box>
        </Box>

        {!isChangingPassword ? (
          <Box>
            <Button
              variant="contained"
              fullWidth
              onClick={onPasswordToggle}
              sx={{
                borderRadius: "10px",
                py: 1.5,
                background: "#0d254d",
                color: "white",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 500,
                "&:hover": {
                  background: "#1a3b6b",
                },
              }}
            >
              Đổi mật khẩu
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <PasswordField
              label="Mật khẩu hiện tại"
              name="currentPassword"
              showPassword={showPassword.current}
              value={passwordData.currentPassword}
              onChange={onPasswordChange}
              onToggleShowPassword={() =>
                onShowPasswordToggle("current", !showPassword.current)
              }
            />

            <PasswordField
              label="Mật khẩu mới"
              name="newPassword"
              showPassword={showPassword.new}
              value={passwordData.newPassword}
              onChange={onPasswordChange}
              onToggleShowPassword={() =>
                onShowPasswordToggle("new", !showPassword.new)
              }
            />

            <PasswordField
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              showPassword={showPassword.confirm}
              value={passwordData.confirmPassword}
              onChange={onPasswordChange}
              onToggleShowPassword={() =>
                onShowPasswordToggle("confirm", !showPassword.confirm)
              }
            />

            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Mật khẩu: 8+ ký tự, chữ hoa/thường, số
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={onChangePassword}
                disabled={loading}
                sx={{
                  borderRadius: "10px",
                  py: 1.5,
                  background: "#0d254d",
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  "&:hover": {
                    background: "#1a3b6b",
                  },
                }}
              >
                Cập nhật
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={onPasswordToggle}
                sx={{
                  borderRadius: "10px",
                  py: 1.5,
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    background: "#f8fafc",
                  },
                }}
              >
                Hủy
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

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
    size="small"
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton 
            onClick={onToggleShowPassword} 
            size="small"
            sx={{ color: "#64748b" }}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        background: "#f8fafc",
        "& fieldset": {
          borderColor: "#e2e8f0",
        },
        "&:hover fieldset": {
          borderColor: "#cbd5e1",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#0d254d",
        },
      },
      "& .MuiInputLabel-root": {
        color: "#64748b",
      },
    }}
  />
);

export default SecuritySection;