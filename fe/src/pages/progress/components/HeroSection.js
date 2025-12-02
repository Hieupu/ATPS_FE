import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const HeroSection = () => {
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
        "&::before": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          background: "radial-gradient(circle at 15% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          zIndex: 1,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          right: 0,
          background: "radial-gradient(circle at 85% 70%, rgba(255,255,255,0.22) 0%, transparent 60%)",
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
        {['📊', '✅', '📈', '🎯', '💯', '🏆'].map((icon, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              fontSize: `${3 + Math.random()}rem`,
              top: `${15 + Math.random() * 60}%`,
              left: index % 2 === 0 ? `${5 + Math.random() * 15}%` : `${70 + Math.random() * 25}%`,
              transform: `rotate(${-20 + Math.random() * 40}deg)`,
            }}
          >
            {icon}
          </Box>
        ))}
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
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.18))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 35px 90px rgba(0,0,0,0.35), 0 0 80px rgba(255,255,255,0.35), inset 0 1px 1px rgba(255,255,255,0.5)",
            backdropFilter: "blur(25px)",
            fontSize: "2.5rem",
            border: "3px solid rgba(255,255,255,0.35)",
          }}
        >
          📊
        </Box>

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
          Báo Cáo Tiến Độ Học Tập
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            opacity: 0.92,
            maxWidth: 700,
            mx: "auto",
            fontWeight: 300,
            lineHeight: 1.7,
            fontSize: { xs: "0.9rem", md: "1rem" },
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: "0.2px",
          }}
        >
          Theo dõi chi tiết điểm số, bài tập và điểm danh của bạn
        </Typography>
      </Container>
    </Box>
  );
};

export default HeroSection;