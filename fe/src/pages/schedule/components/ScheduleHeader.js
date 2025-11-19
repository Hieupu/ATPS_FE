import React from "react";
import { Container, Typography, Box } from "@mui/material";

const ScheduleHeader = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
        >
          Lịch học của tôi
        </Typography>
        <Typography variant="h6" sx={{ textAlign: "center", opacity: 0.9 }}>
          Xem lịch học và theo dõi các buổi học sắp tới
        </Typography>
      </Container>
    </Box>
  );
};

export default ScheduleHeader;