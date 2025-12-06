import React from 'react';
import {
  ListItem,
  Box,
  Typography,
  Button,
  Chip,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { PlayCircle, Lock, AccessTime } from '@mui/icons-material';
import { getFileIcon, getTypeColor, formatLessonTime } from './utils';

const LessonItem = ({ lesson, isEnrolled, onViewMaterial, index }) => {
  const canPreview = isEnrolled && lesson.FileURL;
  const typeInfo = getTypeColor(lesson.Type);

  return (
    <ListItem
      sx={{
        py: 2.5,
        px: 3,
        borderBottom: '1px solid',
        borderColor: 'rgba(99,102,241,0.1)',
        '&:last-child': { borderBottom: 'none' },
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: '#f8f9fe',
          transform: 'translateX(6px)',
        }
      }}
      secondaryAction={
        canPreview ? (
          <Button
            variant="contained"
            size="small"
            onClick={() => onViewMaterial(lesson)}
            startIcon={<PlayCircle />}
            sx={{
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #653a8b 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
              },
            }}
          >
            Học ngay
          </Button>
        ) : (
          <Chip
            icon={<Lock />}
            label="Cần đăng ký"
            size="small"
            sx={{
              bgcolor: 'warning.light',
              color: 'warning.dark',
              fontWeight: 600,
            }}
          />
        )
      }
    >
      <LessonIndex index={index} />
      
      <ListItemIcon sx={{ minWidth: 48 }}>
        {getFileIcon(lesson.Type)}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {lesson.Title}
            </Typography>
            <TypeChip typeInfo={typeInfo} />
          </Box>
        }
        secondary={
          <LessonSecondaryInfo 
            time={lesson.Time} 
            isEnrolled={isEnrolled} 
          />
        }
      />
    </ListItem>
  );
};

const LessonIndex = ({ index }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    minWidth: 40,
    height: 40,
    borderRadius: 2,
    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
    mr: 2,
    fontWeight: 700,
    fontSize: '0.95rem',
    color: 'primary.main',
    border: "1px solid rgba(99,102,241,0.2)",
  }}>
    {index + 1}
  </Box>
);

const TypeChip = ({ typeInfo }) => (
  <Chip
    label={typeInfo.label}
    size="small"
    sx={{
      bgcolor: typeInfo.bg,
      color: typeInfo.text,
      fontWeight: 700,
      height: 24,
      fontSize: '0.7rem',
      borderRadius: 1.5,
    }}
  />
);

const LessonSecondaryInfo = ({ time, isEnrolled }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
    {time && <TimeInfo time={time} />}
    {!isEnrolled && (
      <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
        📌 Đăng ký để mở khóa
      </Typography>
    )}
  </Box>
);

const TimeInfo = ({ time }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
    <Typography variant="body2" color="text.secondary">
      {formatLessonTime(time)}
    </Typography>
  </Box>
);

export default LessonItem;