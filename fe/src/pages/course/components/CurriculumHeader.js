import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CurriculumHeader = ({ totalUnits, totalLessons, totalAssignments, totalDuration }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 3,
          fontFamily: "'Poppins', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        🎯 Lộ trình học
      </Typography>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2.5, md: 3 }, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          boxShadow: "0 15px 40px rgba(102, 126, 234, 0.3)",
        }}
      >
        <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap', justifyContent: 'space-around' }}>
          <StatItem 
            icon="📖"
            value={totalUnits}
            label="Chương học"
          />
          <StatItem 
            icon="✍️"
            value={totalLessons}
            label="Bài học"
          />
          <StatItem 
            icon="📝"
            value={totalAssignments}
            label="Bài tập"
          />
          <StatItem 
            icon="⏱️"
            value={`${Math.round(totalDuration / 60)}h`}
            label="Tổng thời lượng"
          />
        </Box>
      </Paper>
    </Box>
  );
};

const StatItem = ({ icon, value, label }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.5,
      bgcolor: 'rgba(255,255,255,0.15)',
      borderRadius: 3,
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.2)",
    }}
  >
    <Box sx={{ 
      width: 48, 
      height: 48, 
      borderRadius: 2.5, 
      bgcolor: 'rgba(255,255,255,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}>
      <Typography sx={{ fontSize: '1.6rem' }}>{icon}</Typography>
    </Box>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.92)', fontSize: "0.8rem" }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

export default CurriculumHeader;