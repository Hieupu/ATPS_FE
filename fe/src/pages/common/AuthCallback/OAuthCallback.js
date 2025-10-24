import React, { useEffect, useMemo, useState } from "react";
import { Box, Container, Paper, Typography, CircularProgress, Avatar } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from '../../../contexts/AuthContext';

export default function OAuthCallback() {
 const [search] = useSearchParams();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(3);
  const { login } = useAuth(); // Sử dụng Auth Context

  const token = search.get("token");
  const provider = search.get("provider") || "oauth";
  const userB64 = search.get("u");

  const user = useMemo(() => {
    try {
      return userB64 ? JSON.parse(atob(decodeURIComponent(userB64))) : null;
    } catch {
      return null;
    }
  }, [userB64]);

  useEffect(() => {
    if (token && user) {
      // Sử dụng Auth Context để login
      login(user, token);
    }
    
    const iv = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    const to = setTimeout(() => navigate("/"), 3000);
    
    return () => {
      clearInterval(iv);
      clearTimeout(to);
    };
  }, [token, user, navigate, login]);

  const ok = Boolean(token);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", p: 3 }}>
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          {ok ? (
            <>
              <Avatar sx={{ bgcolor: "success.light", width: 72, height: 72, mx: "auto", mb: 2 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 44, color: "success.main" }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {provider === "google" || provider === "facebook"
                  ? "Xác thực thành công!"
                  : "Đăng ký thành công!"}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Automatically return to home page {seconds}s...
              </Typography>
              <CircularProgress />
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: "error.main" }}>
                There was an error while authenticating.
              </Typography>
              <Typography color="text.secondary">
                Please try again or return to the login page.
              </Typography>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
