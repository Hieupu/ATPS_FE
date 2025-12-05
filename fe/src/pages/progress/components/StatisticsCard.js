import React from 'react';
import { Card, Typography, Box } from '@mui/material';

const StatisticsCard = ({ icon: Icon, title, value, gradient, iconColor, borderColor }) => {
  return (
    <Card
      elevation={0}
      sx={{
        textAlign: "center",
        p: 3,
        borderRadius: 4,
        background: gradient,
        border: `1px solid ${borderColor}`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: `0 15px 35px ${borderColor.replace('0.3', '0.2')}`,
        },
      }}
    >
      <Icon sx={{ fontSize: 48, color: iconColor, mb: 2 }} />
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Card>
  );
};

export default StatisticsCard;