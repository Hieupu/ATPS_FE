import React, { useEffect, useRef, useState } from "react";
import {
  Box, Container, Paper, Typography, TextField,
  Button, Divider, Link, InputAdornment, IconButton, Avatar, Alert, Collapse
} from "@mui/material";
import {
  Visibility, VisibilityOff,
  Google as GoogleIcon, Facebook as FacebookIcon, School,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { registerApi, startGoogleAuth, startFacebookAuth } from "../../../apiServices/authService";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // form state
  const [form, setForm] = useState({
    username: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  // success / error UI
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [seconds, setSeconds] = useState(4);
  const countdownRef = useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      return "Please enter complete information: username, email, password!";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Invalid email!";
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(form.password)) {
      return "Password must be at least 6 characters, including letters and numbers!";
    }
    if (form.password !== form.confirmPassword) return "Password confirmation does not match!";
    if (form.phone && !/^\d{9,11}$/.test(form.phone)) return "Invalid phone number (9–11 digits only)!";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }

    try {
      setLoading(true);
      const res = await registerApi({
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      // ✅ Hiển thị thông báo thành công ngay tại trang
      setSuccessMsg(res?.message || "Account created successfully!");
      setSeconds(4);

      // Đếm ngược & chuyển sang trang login sau 4s
      countdownRef.current = setInterval(() => {
        setSeconds((s) => (s > 1 ? s - 1 : 0));
      }, 1000);

      setTimeout(() => {
        navigate("/auth/login", { replace: true, state: { email: form.email.trim() } });
      }, 4000);
    } catch (error) {
      console.error("Register error:", error);
      setErrorMsg(error?.message || "Register failed. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  // clear interval khi unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

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
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3, backgroundColor: "white" }}>
          {/* Logo */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, backgroundColor: "primary.light" }}>
              <School sx={{ fontSize: 48, color: "primary.main" }} />
            </Avatar>
          </Box>

          {/* Title */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Create your account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join us and start your journey
            </Typography>
          </Box>

          {/* Alerts */}
          <Collapse in={!!successMsg} unmountOnExit>
            <Alert severity="success" sx={{ mb: 2, fontWeight: 500 }}>
              {successMsg} — Redirecting to login in {seconds}s…
            </Alert>
          </Collapse>
          <Collapse in={!!errorMsg} unmountOnExit>
            <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
          </Collapse>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Username */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Username
              </Typography>
              <TextField
                fullWidth name="username" placeholder="your_username"
                value={form.username} onChange={handleChange} required disabled={loading || !!successMsg}
              />
            </Box>

            {/* Email */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Email
              </Typography>
              <TextField
                fullWidth name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required disabled={loading || !!successMsg}
              />
            </Box>

            {/* Phone (optional) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Phone (optional)
              </Typography>
              <TextField
                fullWidth name="phone" placeholder="0987xxxxxx"
                value={form.phone} onChange={handleChange} disabled={loading || !!successMsg}
              />
            </Box>

            {/* Password */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Password
              </Typography>
              <TextField
                fullWidth name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password} onChange={handleChange} required disabled={loading || !!successMsg}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" disabled={loading || !!successMsg}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Confirm Password */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Confirm Password
              </Typography>
              <TextField
                fullWidth name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword} onChange={handleChange} required disabled={loading || !!successMsg}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" disabled={loading || !!successMsg}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Register Button */}
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading || !!successMsg}
              sx={{ mb: 3, py: 1.5, fontWeight: 600, fontSize: "1rem" }}
            >
              {loading ? "Processing..." : "Register"}
            </Button>

            {/* Divider */}
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            {/* Social buttons */}
            <Button
              fullWidth variant="outlined" size="large"
              startIcon={<GoogleIcon />} onClick={startGoogleAuth}
              disabled={loading || !!successMsg}
              sx={{
                mb: 2, py: 1.5, fontWeight: 600,
                borderColor: "grey.300", color: "text.primary",
                "&:hover": { borderColor: "grey.400", backgroundColor: "grey.50" },
              }}
            >
              Continue with Google
            </Button>

            <Button
              fullWidth variant="outlined" size="large"
              startIcon={<FacebookIcon />} onClick={startFacebookAuth}
              disabled={loading || !!successMsg}
              sx={{
                mb: 3, py: 1.5, fontWeight: 600,
                borderColor: "grey.300", color: "text.primary",
                "&:hover": { borderColor: "grey.400", backgroundColor: "grey.50" },
              }}
            >
              Continue with Facebook
            </Button>

            {/* Footer Links */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link component={RouterLink} to="/auth/login" underline="hover" sx={{ color: "primary.main", fontWeight: 600 }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
