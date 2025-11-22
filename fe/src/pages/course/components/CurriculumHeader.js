import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CurriculumHeader = ({ totalUnits, totalLessons, totalAssignments, totalDuration }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
        📚 Lộ trình học
      </Typography>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
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
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ 
      width: 40, 
      height: 40, 
      borderRadius: 2, 
      bgcolor: 'rgba(255,255,255,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Typography sx={{ fontSize: '1.5rem' }}>{icon}</Typography>
    </Box>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

export default CurriculumHeader;