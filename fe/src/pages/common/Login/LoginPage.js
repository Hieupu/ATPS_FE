import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  InputAdornment,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  School,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  loginApi,
  startGoogleAuth,
  startFacebookAuth,
} from "../../../apiServices/authService";
import { useAuth } from "../../../contexts/AuthContext";
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await loginApi(formData.email, formData.password);

      // Sử dụng Auth Context để login
      login(user, token);

      if (user.role === "learner") {
        navigate("/");
      } else if (user.role === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/");
      }
    } catch (error) {
      alert(error.message || "Đăng nhập thất bại");
    }
  };

  const handleGoogleLogin = () => startGoogleAuth();
  const handleFacebookLogin = () => startFacebookAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "white",
          }}
        >
          {/* Logo Section */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                backgroundColor: "primary.light",
              }}
            >
              <AccountCircle sx={{ fontSize: 48, color: "primary.main" }} />
            </Avatar>
          </Box>

          {/* Title Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Đăng nhập
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Email
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Mật khẩu
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mb: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Đăng nhập
            </Button>

            {/* Divider */}
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Đăng nhập bằng
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: 'grey.300',
                  color: 'text.primary',
                  "&:hover": {
                    borderColor: 'grey.400',
                    backgroundColor: 'grey.50',
                  },
                }}
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
              >
                Google
              </Button>

              <Button
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: 'grey.300',
                  color: 'text.primary',
                  "&:hover": {
                    borderColor: 'grey.400',
                    backgroundColor: 'grey.50',
                  },
                }}
                variant="outlined"
                size="large"
                startIcon={<FacebookIcon />}
                onClick={handleFacebookLogin}
              >
                Facebook
              </Button>
            </Box>

            {/* Footer Links */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Link
                href="/forgot-password"
                underline="hover"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Quên mật khẩu?
              </Link>
              <Typography variant="body2" color="text.secondary">
                Chưa có tài khoản?{" "}
                <Link
                  component={RouterLink}
                  to="/auth/register"
                  underline="hover"
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  Đăng ký
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
