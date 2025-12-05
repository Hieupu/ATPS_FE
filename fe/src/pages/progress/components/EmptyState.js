import React from 'react';
import { Box, Typography, Button, Fade } from '@mui/material';

const EmptyState = () => {
  return (
    <Fade in={true} timeout={500}>
      <Box
        sx={{
          textAlign: "center",
          py: 10,
          px: 2,
        }}
      >
        <Box sx={{ fontSize: "6rem", mb: 2 }}>📊</Box>
        <Typography
          variant="h5"
          color="text.primary"
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Chưa có dữ liệu tiến độ
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Bạn chưa có khóa học nào để theo dõi tiến độ. Hãy đăng ký khóa học để bắt đầu!
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => window.location.href = "/courses"}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
          }}
        >
          Khám phá khóa học
        </Button>
      </Box>
    </Fade>
  );
};

export default EmptyState;