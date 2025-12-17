import React, { useEffect, useRef, useState } from "react";
import {
  Box, Container, Paper, Typography, TextField,
  Button, Divider, Link, InputAdornment, IconButton,
  Alert, Collapse, Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel
} from "@mui/material";
import {
  Visibility, VisibilityOff,
  Google as GoogleIcon,
} from "@mui/icons-material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { 
  registerApi, 
  startGoogleAuth, 
  sendRegisterVerification, 
  verifyRegisterCodeApi 
} from "../../../apiServices/authService";

const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [seconds, setSeconds] = useState(4);
  const [successOpen, setSuccessOpen] = useState(false);
  const countdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Refs cho các ô nhập mã xác thực
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const navigate = useNavigate();

  const steps = ["Thông tin tài khoản", "Xác thực email", "Hoàn tất"];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // === Xử lý thay đổi mã xác thực ===
  const handleCodeChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCodes = [...verificationCode];
      newCodes[index] = value;
      setVerificationCode(newCodes);

      if (value !== "" && index < 3) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && verificationCode[index] === "" && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // === Bước 1: Kiểm tra thông tin và gửi mã xác thực ===
  const validateStep1 = () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      return "Vui lòng nhập đầy đủ thông tin: Họ và tên, email, mật khẩu!";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Email không hợp lệ!";
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(form.password)) {
      return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ cái và số!";
    }
    if (form.password !== form.confirmPassword) return "Mật khẩu xác thực không khớp!";
    if (form.phone && !/^\d{9,11}$/.test(form.phone)) return "Số điện thoại không hợp lệ!";
    return null;
  };

  const handleSendVerification = async () => {
    const err = validateStep1();
    if (err) {
      setErrorMsg(err);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      await sendRegisterVerification(form.email);
      setActiveStep(1);
      // Focus vào ô đầu tiên sau khi chuyển bước
      setTimeout(() => {
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }, 100);
    } catch (error) {
      setErrorMsg(error.message || "Gửi mã xác thực thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // === Bước 2: Xác thực mã ===
  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 4) {
      setErrorMsg("Vui lòng nhập đầy đủ 4 số mã xác thực!");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      await verifyRegisterCodeApi(form.email, code);
      setVerifiedEmail(form.email);
      setActiveStep(2);
      setSuccessMsg("Xác thực email thành công!");
    } catch (error) {
      setErrorMsg(error.message || "Mã xác thực không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  // === Bước 3: Hoàn tất đăng ký ===
  const handleCompleteRegister = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await registerApi({
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      setSeconds(4);
      setSuccessOpen(true);

      countdownRef.current = setInterval(() => {
        setSeconds((s) => (s > 1 ? s - 1 : 0));
      }, 1000);
      timeoutRef.current = setTimeout(goLogin, 4000);
    } catch (error) {
      console.error("Register error:", error);
      setErrorMsg(error?.message || "Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => {
    navigate("/auth/login", { replace: true, state: { email: form.email.trim() } });
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

  // === Render nội dung từng bước ===
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              Vui lòng nhập thông tin tài khoản của bạn
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Họ và tên
              </Typography>
              <TextField
                fullWidth 
                name="username" 
                placeholder="Họ và tên của bạn"
                value={form.username} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Email
              </Typography>
              <TextField
                fullWidth 
                name="email" 
                type="email" 
                placeholder="nguyenvana@mail.com"
                value={form.email} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Điện thoại
              </Typography>
              <TextField
                fullWidth 
                name="phone" 
                placeholder="0987xxxxxx"
                value={form.phone} 
                onChange={handleChange} 
                disabled={loading}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Mật khẩu
              </Typography>
              <TextField
                fullWidth 
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={form.password} 
                onChange={handleChange} 
                required 
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Xác thực mật khẩu
              </Typography>
              <TextField
                fullWidth 
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword} 
                onChange={handleChange} 
                required 
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" disabled={loading}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Button
              fullWidth 
              variant="contained" 
              onClick={handleSendVerification}
              disabled={loading}
              size="large"
              sx={{ mb: 3, py: 1.5, fontWeight: 600 }}
            >
              {loading ? "Đang xử lý..." : "Tiếp tục xác thực email"}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              Nhập mã xác thực 4 số đã được gửi đến <b>{form.email}</b>
            </Typography>
            
            <Box
              sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 4 }}
            >
              {[0, 1, 2, 3].map((index) => (
                <TextField
                  key={index}
                  inputRef={inputRefs[index]}
                  value={verificationCode[index]}
                  onChange={(e) => handleCodeChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: "center", fontSize: "1.5rem" },
                  }}
                  sx={{ width: 60 }}
                />
              ))}
            </Box>
            
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setActiveStep(0);
                  setVerificationCode(["", "", "", ""]);
                }}
                disabled={loading}
              >
                Quay lại
              </Button>
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.join("").length !== 4}
              >
                {loading ? "Đang xác thực..." : "Xác thực mã"}
              </Button>
            </Box>
            
            <Typography variant="body2" align="center" color="text.secondary">
              Không nhận được mã?{" "}
              <Link 
                component="button" 
                variant="body2"
                onClick={handleSendVerification}
                disabled={loading}
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                Gửi lại mã
              </Link>
            </Typography>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 4, color: "text.secondary", textAlign: "center" }}>
              <CheckCircleOutlineRoundedIcon 
                color="success" 
                sx={{ fontSize: 48, mb: 2, display: "block", margin: "0 auto" }}
              />
              Email <b>{verifiedEmail}</b> đã được xác thực thành công!
            </Typography>
            
            <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Thông tin tài khoản của bạn:
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Họ và tên:</strong> {form.username}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> {form.email}
              </Typography>
              
              {form.phone && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Điện thoại:</strong> {form.phone}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                Chỉnh sửa
              </Button>
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleCompleteRegister}
                disabled={loading}
              >
                {loading ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký"}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
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
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Đăng kí tài khoản
            </Typography>
          </Box>
          
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Hiển thị lỗi */}
          <Collapse in={!!errorMsg} unmountOnExit>
            <Alert 
              severity="error" 
              sx={{ mb: 2 }} 
              onClose={() => setErrorMsg("")}
            >
              {errorMsg}
            </Alert>
          </Collapse>
          
          {/* Nội dung từng bước */}
          {renderStepContent(activeStep)}
          
          {/* Phần đăng ký bằng Google (chỉ hiển thị ở bước 1) */}
          {activeStep === 0 && (
            <>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">Hoặc đăng ký bằng</Typography>
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
              </Box>
            </>
          )}
          
          {/* Link đăng nhập */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?{" "}
              <Link component={RouterLink} to="/auth/login" underline="hover" sx={{ color: "primary.main", fontWeight: 600 }}>
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
      
      {/* Dialog thông báo thành công */}
      <Dialog open={successOpen} onClose={handleCloseSuccess} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 56 }} color="success" />
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
            Đăng ký thành công
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ mb: 1 }}>
            Tài khoản của bạn đã được tạo thành công.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đang chuyển hướng đến trang đăng nhập <b>{seconds}s</b>…
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button variant="contained" onClick={handleCloseSuccess}>
            Đăng nhập ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegisterPage;