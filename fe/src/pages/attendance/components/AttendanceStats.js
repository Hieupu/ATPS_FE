import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@mui/material";

const AttendanceStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <Card
          sx={{
            background: "linear-gradient(135deg, #bd92deff 0%, #b571d7ff 100%)",
            color: "white",
            borderRadius: 3,
            boxShadow: "0 4px 14px rgba(152, 56, 168, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 24px rgba(119, 65, 163, 0.4)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9, 
                mb: 1.5,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              Tỷ lệ điểm danh
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                fontSize: "3rem",
                lineHeight: 1,
              }}
            >
              {stats.attendanceRate}%
            </Typography>
            <Chip
              label={stats.grade}
              sx={{
                mt: 1,
                bgcolor: "rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.875rem",
                height: 32,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "2px solid #dcfce7",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              borderColor: "#86efac",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#6b7280",
                mb: 1.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              Có mặt
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: "#10b981",
                fontSize: "2.5rem",
                lineHeight: 1,
              }}
            >
              {stats.totalPresent}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: "#9ca3af",
                mt: 1,
                display: "block",
                fontWeight: 500,
              }}
            >
              buổi học
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "2px solid #fef3c7",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              borderColor: "#fcd34d",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#6b7280",
                mb: 1.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              Đi muộn
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: "#f59e0b",
                fontSize: "2.5rem",
                lineHeight: 1,
              }}
            >
              {stats.totalLate}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: "#9ca3af",
                mt: 1,
                display: "block",
                fontWeight: 500,
              }}
            >
              buổi học
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "2px solid #fee2e2",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              borderColor: "#fca5a5",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#6b7280",
                mb: 1.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              Vắng mặt
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: "#ef4444",
                fontSize: "2.5rem",
                lineHeight: 1,
              }}
            >
              {stats.totalAbsent}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: "#9ca3af",
                mt: 1,
                display: "block",
                fontWeight: 500,
              }}
            >
              buổi học
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AttendanceStats;