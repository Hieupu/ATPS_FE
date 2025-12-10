import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
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
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginApi(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      login(data.user, data.token);

      const userName = data.user.username || data.user.email.split("@")[0];
      toast.success(`Xin chào ${userName}! Đăng nhập thành công`, {
        autoClose: 2000,
      });

      setTimeout(() => {
        if (data.user.role === "learner") {
          navigate("/");
        } else if (data.user.role === "instructor") {
          navigate("/instructor");
        } else if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error) {
      toast.error(error.message || "Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
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
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Đăng nhập
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
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

            <Box sx={{ mb: 2 }}>
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

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" component="span">
                      Ghi nhớ đăng nhập
                    </Typography>
                  </Box>
                }
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Đăng nhập bằng
              </Typography>
            </Divider>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Button
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: "grey.300",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "grey.400",
                    backgroundColor: "grey.50",
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
                  borderColor: "grey.300",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "grey.400",
                    backgroundColor: "grey.50",
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
