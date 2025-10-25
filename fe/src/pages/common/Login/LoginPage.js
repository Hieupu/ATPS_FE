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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  loginApi,
  startGoogleAuth,
  startFacebookAuth,
} from "../../../apiServices/authService";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

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
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (error) {
      alert(error.message || "Login failed");
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
              <School sx={{ fontSize: 48, color: "primary.main" }} />
            </Avatar>
          </Box>

          {/* Title Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Login to Your Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Please enter your details
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
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
              Login
            </Button>

            {/* Divider */}
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                mb: 2,
                py: 1.5,
                fontWeight: 600,
                borderColor: "grey.300",
                color: "text.primary",
                "&:hover": {
                  borderColor: "grey.400",
                  backgroundColor: "grey.50",
                },
              }}
            >
              Login with Google
            </Button>

            {/* Facebook Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<FacebookIcon />}
              onClick={handleFacebookLogin}
              sx={{
                mb: 3,
                py: 1.5,
                fontWeight: 600,
                borderColor: "grey.300",
                color: "text.primary",
                "&:hover": {
                  borderColor: "grey.400",
                  backgroundColor: "grey.50",
                },
              }}
            >
              Login with Facebook
            </Button>

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
                Forgot Password?
              </Link>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/auth/register"
                  underline="hover"
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  Register
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
