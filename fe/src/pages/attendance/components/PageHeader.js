import React from "react";
import { Box, Container, Typography } from "@mui/material";

const PageHeader = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
        color: "white",
        py: 6,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "40%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800, 
            mb: 2, 
            textAlign: "center",
            fontSize: { xs: "2rem", md: "2.5rem" },
            letterSpacing: "-0.02em",
          }}
        >
          Điểm danh
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: "center", 
            opacity: 0.95,
            fontWeight: 400,
            fontSize: "1.125rem",
          }}
        >
          Theo dõi chi tiết tình hình tham gia học tập của bạn
        </Typography>
      </Container>
    </Box>
  );
};

export default PageHeader;