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
        py: 2,
        px: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateX(4px)',
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
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
            }}
          >
            Học ngay
          </Button>
        ) : (
          <Chip
            icon={<Lock />}
            label="Cần đăng ký"
            size="small"
            sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}
          />
        )
      }
    >
      <LessonIndex index={index} />
      
      <ListItemIcon sx={{ minWidth: 40 }}>
        {getFileIcon(lesson.Type)}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
    minWidth: 36,
    height: 36,
    borderRadius: '50%',
    bgcolor: 'grey.100',
    mr: 2,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'text.secondary',
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
      fontWeight: 600,
      height: 22,
      fontSize: '0.75rem',
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