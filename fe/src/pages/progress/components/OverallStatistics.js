import React from 'react';
import { Paper, Box, Typography, Grid } from '@mui/material';
import { Assessment, LibraryBooks, Timer, Assignment, Star } from '@mui/icons-material';
import StatisticsCard from './StatisticsCard';
import { Fade } from '@mui/material';

const OverallStatistics = ({ statistics }) => {
  if (!statistics) return null;

  const statsCards = [
    {
      icon: LibraryBooks,
      title: "Khóa học",
      value: statistics.totalCourses,
      gradient: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
      iconColor: "#667eea",
      borderColor: "rgba(99,102,241,0.2)"
    },
    {
      icon: Timer,
      title: "Giờ học",
      value: `${statistics.totalHoursLearned}h`,
      gradient: "linear-gradient(135deg, rgba(240,147,251,0.1) 0%, rgba(245,175,251,0.1) 100%)",
      iconColor: "#f093fb",
      borderColor: "rgba(240,147,251,0.3)"
    },
    {
      icon: Assignment,
      title: "Bài tập đã nộp",
      value: statistics.totalSubmissions,
      gradient: "linear-gradient(135deg, rgba(79,172,254,0.1) 0%, rgba(0,242,254,0.1) 100%)",
      iconColor: "#4facfe",
      borderColor: "rgba(79,172,254,0.3)"
    },
    {
      icon: Star,
      title: "Điểm trung bình",
      value: statistics.overallAvgScore,
      gradient: "linear-gradient(135deg, rgba(254,202,87,0.15) 0%, rgba(255,177,66,0.15) 100%)",
      iconColor: "#feca57",
      borderColor: "rgba(254,202,87,0.4)"
    }
  ];

  return (
    <Fade in={true} timeout={500}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 5,
          borderRadius: 4,
          border: "1px solid rgba(99,102,241,0.15)",
          boxShadow: "0 20px 50px rgba(15,23,42,0.1)",
          background: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Assessment sx={{ color: "primary.main", fontSize: 32 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Tổng Quan Thành Tích
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {statsCards.map((card, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <StatisticsCard {...card} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Fade>
  );
};

export default OverallStatistics;