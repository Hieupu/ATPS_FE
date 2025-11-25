import React, { useEffect, useRef, useState } from "react";
import {
  Box, Container, Paper, Typography, TextField,
  Button, Divider, Link, InputAdornment, IconButton, Avatar,
  Alert, Collapse, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  Visibility, VisibilityOff,
  Google as GoogleIcon, Facebook as FacebookIcon, School,
  AccountCircle,
} from "@mui/icons-material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { registerApi, startGoogleAuth, startFacebookAuth } from "../../../apiServices/authService";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [seconds, setSeconds] = useState(4);
  const [successOpen, setSuccessOpen] = useState(false);
  const countdownRef = useRef(null);
  const timeoutRef = useRef(null);

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

  const goLogin = () => {
    navigate("/auth/login", { replace: true, state: { email: form.email.trim() } });
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

      setSuccessMsg(res?.message || "Account created successfully!");
      setSeconds(4);
      setSuccessOpen(true);

 
      countdownRef.current = setInterval(() => {
        setSeconds((s) => (s > 1 ? s - 1 : 0));
      }, 1000);
      timeoutRef.current = setTimeout(goLogin, 4000);
    } catch (error) {
      console.error("Register error:", error);
      setErrorMsg(error?.message || "Register failed. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCloseSuccess = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSuccessOpen(false);
    goLogin();
  };

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
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, backgroundColor: "primary.light" }}>
              <AccountCircle sx={{ fontSize: 48, color: "primary.main" }} />
            </Avatar>
          </Box>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Đăng kí tài khoản
            </Typography>
          </Box>
          <Collapse in={!!errorMsg} unmountOnExit>
            <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
          </Collapse>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Tên đăng nhập
              </Typography>
              <TextField
                fullWidth name="username" placeholder="tên đăng nhập"
                value={form.username} onChange={handleChange} required disabled={loading || successOpen}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Email
              </Typography>
              <TextField
                fullWidth name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required disabled={loading || successOpen}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Điện thoại
              </Typography>
              <TextField
                fullWidth name="phone" placeholder="0987xxxxxx"
                value={form.phone} onChange={handleChange} disabled={loading || successOpen}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Mật khẩu
              </Typography>
              <TextField
                fullWidth name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={form.password} onChange={handleChange} required disabled={loading || successOpen}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" disabled={loading || successOpen}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Xác thực mật khẩu
              </Typography>
              <TextField
                fullWidth name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword} onChange={handleChange} required disabled={loading || successOpen}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" disabled={loading || successOpen}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading || successOpen}
              sx={{ mb: 3, py: 1.5, fontWeight: 600, fontSize: "1rem" }}
            >
              {loading ? "Đang xử lý" : "Đăng ký"}
            </Button>
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Đăng ký bằng</Typography>
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
              onClick={startGoogleAuth}
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
              onClick={startFacebookAuth}
            >
              Facebook
            </Button>
          </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Đã có tài khoản?{" "}
                <Link component={RouterLink} to="/auth/login" underline="hover" sx={{ color: "primary.main", fontWeight: 600 }}>
                  Đăng nhập
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Dialog open={successOpen} onClose={handleCloseSuccess} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 56 }} color="success" />
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
            Registration Successful
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ mb: 1 }}>
            {successMsg || "Your account has been created successfully."}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to login in <b>{seconds}s</b>…
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button variant="contained" onClick={handleCloseSuccess}>
            Go to Login now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisterPage;
