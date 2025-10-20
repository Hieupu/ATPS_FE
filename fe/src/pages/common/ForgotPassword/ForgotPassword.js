import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  sendResetEmail,
  verifyResetCode,
  resetPassword,
} from "../../../apiServices/authService";

const ForgotPassword = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const steps = ["Nhập Email", "Xác thực", "Đổi mật khẩu"];

  // === Bước 1: Gửi email ===
  const handleSendEmail = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await sendResetEmail(email);
      setActiveStep(1);
      setSuccess("✅ Mã xác thực đã được gửi đến email của bạn!");
    } catch (err) {
      setError(err.message || "❌ Lỗi khi gửi email.");
    } finally {
      setLoading(false);
    }
  };

  // === Bước 2: Xác thực mã ===
  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError("");
      const code = verificationCode.join("");
      const data = await verifyResetCode(email, code);
      setResetToken(data.resetToken);
      setActiveStep(2);
      setSuccess("✅ Xác thực thành công! Vui lòng đặt mật khẩu mới.");
    } catch (err) {
      setError(err.message || "❌ Mã xác thực không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  // === Bước 3: Đổi mật khẩu ===
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await resetPassword(resetToken, newPassword);
      setSuccess("🎉 Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "❌ Không thể đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi mã 4 số
  const handleCodeChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCodes = [...verificationCode];
      newCodes[index] = value;
      setVerificationCode(newCodes);
    }
  };

  // === Giao diện từng bước ===
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu.
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSendEmail}
              disabled={loading || !email}
              size="large"
            >
              {loading ? "Đang gửi..." : "Gửi mã xác thực"}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Nhập mã xác thực 4 số đã được gửi đến <b>{email}</b>
            </Typography>
            <Box
              sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 3 }}
            >
              {[0, 1, 2, 3].map((index) => (
                <TextField
                  key={index}
                  value={verificationCode[index]}
                  onChange={(e) => handleCodeChange(e.target.value, index)}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: "center", fontSize: "1.5rem" },
                  }}
                  sx={{ width: 60 }}
                />
              ))}
            </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.join("").length !== 4}
              size="large"
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Nhập mật khẩu mới của bạn.
            </Typography>
            <TextField
              fullWidth
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleResetPassword}
              disabled={loading || !newPassword || !confirmPassword}
              size="large"
            >
              {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  // === Render chính ===
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
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4 }}
          >
            Quên mật khẩu
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button onClick={() => navigate("/login")}>Quay lại đăng nhập</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
