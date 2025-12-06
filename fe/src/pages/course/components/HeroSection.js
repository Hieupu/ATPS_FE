import React from "react";
import { Container, Typography, Box } from "@mui/material";

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
        {['📅', '🎓', '👨‍🏫', '📚', '⏰', '✅'].map((icon, index) => (
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
          Lịch Khai Giảng
        </Typography>
        
        {/* Subtitle */}
        <Typography
          sx={{
            textAlign: "center",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            opacity: 0.9,
            maxWidth: "600px",
            fontWeight: 300,
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          Xem và đăng ký lớp học sắp khai giảng
        </Typography>
      </Container>
    </Box>
  );
};

export default HeroSection;