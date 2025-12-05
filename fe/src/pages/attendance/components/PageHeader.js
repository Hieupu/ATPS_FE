import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

const PageHeader = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
        color: "white",
        py: { xs: 3, md: 4 },
        mb: 5,
        position: "relative",
        overflow: "hidden",
        borderBottomLeftRadius: { xs: 40, md: 60 },
        borderBottomRightRadius: { xs: 40, md: 60 },
        boxShadow: "0 50px 100px rgba(102, 126, 234, 0.4)",
        // Gradient overlay với light glow
        "&::before": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          background:
            "radial-gradient(circle at 15% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          zIndex: 1,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          right: 0,
          background:
            "radial-gradient(circle at 85% 70%, rgba(255,255,255,0.22) 0%, transparent 60%)",
          zIndex: 1,
        },
      }}
    >
      {/* Decorative Background Icons */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          opacity: 0.12,
          zIndex: 0,
        }}
      >
        {/* Icon Checkmark */}
        <Box
          sx={{
            position: "absolute",
            fontSize: "4rem",
            top: "15%",
            left: "8%",
            transform: "rotate(-15deg)",
          }}
        >
          ✅
        </Box>
        {/* Icon Clock */}
        <Box
          sx={{
            position: "absolute",
            fontSize: "3.5rem",
            top: "65%",
            left: "12%",
            transform: "rotate(25deg)",
          }}
        >
          ⏰
        </Box>
        {/* Icon Statistics */}
        <Box
          sx={{
            position: "absolute",
            fontSize: "3rem",
            top: "25%",
            right: "10%",
            transform: "rotate(15deg)",
          }}
        >
          📊
        </Box>
        {/* Icon Star */}
        <Box
          sx={{
            position: "absolute",
            fontSize: "3.5rem",
            top: "70%",
            right: "15%",
            transform: "rotate(-20deg)",
          }}
        >
          ⭐
        </Box>
        {/* Icon Target */}
        <Box
          sx={{
            position: "absolute",
            fontSize: "4rem",
            top: "45%",
            left: "5%",
            transform: "rotate(10deg)",
          }}
        >
          🎯
        </Box>
        {/* Icon Calendar */}
        <Box
          sx={{
            position: "absolute",
            fontSize: "3.5rem",
            top: "50%",
            right: "8%",
            transform: "rotate(-12deg)",
          }}
        >
          📅
        </Box>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Hero Icon */}
        {/* <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.18))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 35px 90px rgba(0,0,0,0.35), 0 0 80px rgba(255,255,255,0.35), inset 0 1px 1px rgba(255,255,255,0.5)",
            backdropFilter: "blur(25px)",
            fontSize: "2.5rem",
            border: "3px solid rgba(255,255,255,0.35)",
          }}
        >
          ✅
        </Box> */}

        {/* Title */}
        <Typography
          component="h1"
          sx={{
            fontFamily: "'Poppins', 'Inter', sans-serif",
            fontWeight: 900,
            textAlign: "center",
            mb: 0.5,
            letterSpacing: "-0.5px",
            fontSize: { xs: "1.6rem", sm: "2rem", md: "2.5rem" },
            textShadow: "0 20px 40px rgba(0,0,0,0.3)",
            lineHeight: 1.2,
          }}
        >
          Điểm danh
        </Typography>

        {/* Subtitle
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            opacity: 0.92,
            maxWidth: 700,
            mx: "auto",
            fontWeight: 300,
            lineHeight: 1.6,
            fontSize: { xs: "0.9rem", md: "1rem" },
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: "0.2px",
          }}
        >
          Theo dõi chi tiết tình hình tham gia học tập của bạn
        </Typography> */}
      </Container>
    </Box>
  );
};

export default PageHeader;