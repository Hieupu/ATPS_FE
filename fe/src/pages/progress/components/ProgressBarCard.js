import React from 'react';
import { Paper, Box, Typography, LinearProgress, Alert } from '@mui/material';

const ProgressBarCard = ({ 
  icon: Icon, 
  title, 
  completed, 
  total, 
  percentage, 
  averageScore, 
  totalHours,
  emptyMessage,
  color = "primary",
  showAverage = false,
  showHours = false 
}) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "info";
    return "warning";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: "#f8f9fe",
        border: "1px solid rgba(99,102,241,0.1)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon sx={{ color: `${color}.main` }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: `${color}.main` }}>
          {completed}/{total}
        </Typography>
      </Box>
      
      {total > 0 ? (
        <>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={getProgressColor(percentage)}
            sx={{
              height: 12,
              borderRadius: 999,
              bgcolor: `rgba(99,102,241,0.1)`,
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {title === "Bài Tập" ? "Tiến độ hoàn thành" : "Tỷ lệ tham gia"}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {Math.round(percentage)}%
            </Typography>
          </Box>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              {showAverage ? "Điểm trung bình:" : showHours ? "Tổng giờ học:" : ""}
            </Typography>
            {showAverage && (
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 800,
                  color: averageScore >= 8 ? "success.main" : averageScore >= 6.5 ? "warning.main" : "error.main",
                }}
              >
                {averageScore}
              </Typography>
            )}
            {showHours && (
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                }}
              >
                {totalHours}h
              </Typography>
            )}
          </Box>
        </>
      ) : (
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
            border: "1px solid rgba(33,150,243,0.2)",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {emptyMessage}
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default ProgressBarCard;