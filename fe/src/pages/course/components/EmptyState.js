import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";

const EmptyState = ({ onRetry }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 4,
        textAlign: "center",
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 1,
        mt: 2,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Hiện không có khóa học nào
      </Typography>
      <Button 
        variant="outlined" 
        size="small"
        onClick={onRetry}
        sx={{ 
          mt: 1,
          fontSize: '0.75rem'
        }}
      >
        Tải lại
      </Button>
    </Box>
  );
};

export default EmptyState;