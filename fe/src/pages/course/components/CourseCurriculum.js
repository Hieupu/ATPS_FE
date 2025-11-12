import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import {
  ExpandMore,
  PlayCircle,
  VideoLibrary,
  InsertDriveFile,
  AccessTime,
  Lock,
  Headphones,
  MenuBook,
  Edit,
} from '@mui/icons-material';
import { getCourseCurriculumApi } from "../../../apiServices/courseService";
import LessonPreviewDialog from './LessonPreviewDialog';

const getFileIcon = (type) => {
  switch ((type || "").toLowerCase()) {
    case "video":
    case "mp4":
      return <VideoLibrary sx={{ color: '#E74C3C' }} />;
    case "listening":
    case "audio":
    case "mp3":
      return <Headphones sx={{ color: '#3498DB' }} />;
    case "reading":
    case "pdf":
      return <MenuBook sx={{ color: '#27AE60' }} />;
    case "writing":
    case "exercise":
      return <Edit sx={{ color: '#F39C12' }} />;
    default:
      return <InsertDriveFile sx={{ color: '#95A5A6' }} />;
  }
};

const getTypeColor = (type) => {
  switch ((type || "").toLowerCase()) {
    case "video":
    case "mp4":
      return { bg: '#FADBD8', text: '#E74C3C', label: 'Video' };
    case "listening":
    case "audio":
    case "mp3":
      return { bg: '#D6EAF8', text: '#3498DB', label: 'Listening' };
    case "reading":
    case "pdf":
      return { bg: '#D5F4E6', text: '#27AE60', label: 'Reading' };
    case "writing":
    case "exercise":
      return { bg: '#FCF3CF', text: '#F39C12', label: 'Writing' };
    default:
      return { bg: '#ECF0F1', text: '#95A5A6', label: type };
  }
};

const formatLessonTime = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
};

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
      
      <ListItemIcon sx={{ minWidth: 40 }}>
        {getFileIcon(lesson.Type)}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {lesson.Title}
            </Typography>
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
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
            {lesson.Time && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatLessonTime(lesson.Time)}
                </Typography>
              </Box>
            )}
            {!isEnrolled && (
              <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
                📌 Đăng ký để mở khóa
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

const CourseCurriculum = ({ courseId, isEnrolled }) => {
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const fetchCurriculum = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCourseCurriculumApi(courseId);
      setCurriculum(data.curriculum || []);
    } catch (err) {
      console.error('Error fetching curriculum:', err);
      setError(err.message || 'Không thể tải lộ trình học');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const handleViewMaterial = (lesson) => {
    setPreviewItem(lesson);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };

  const totalUnits = curriculum.length;
  const totalLessons = curriculum.reduce((total, unit) => total + (unit.Lessons?.length || 0), 0);
  const totalDuration = curriculum.reduce((total, unit) => {
    const unitDuration = unit.Lessons?.reduce((sum, lesson) => sum + (lesson.Time || 0), 0) || 0;
    return total + unitDuration;
  }, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress size={50} thickness={4} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Đang tải chương trình học...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Curriculum Header */}
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
                <Typography sx={{ fontSize: '1.5rem' }}>📖</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                  {totalUnits}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Chương học
                </Typography>
              </Box>
            </Box>
            
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
                <Typography sx={{ fontSize: '1.5rem' }}>✍️</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                  {totalLessons}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Bài học
                </Typography>
              </Box>
            </Box>
            
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
                <Typography sx={{ fontSize: '1.5rem' }}>⏱️</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                  {Math.round(totalDuration / 60)}h
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Tổng thời lượng
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Curriculum Content */}
      {curriculum.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Chưa có chương trình học cho khóa học này.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {curriculum.map((unit, unitIndex) => (
            <Card 
              key={unit.UnitID}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <Accordion 
                disableGutters
                sx={{
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMore />}
                  sx={{ 
                    px: 3, 
                    py: 2,
                    background: 'linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      flexShrink: 0,
                    }}>
                      {unitIndex + 1}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {unit.Title}
                      </Typography>
                      {unit.Description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {unit.Description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`${unit.Lessons?.length || 0} bài học`} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            fontWeight: 600,
                          }}
                        />
                        {unit.Duration && (
                          <Chip 
                            label={unit.Duration} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'success.light',
                              color: 'success.dark',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  {!unit.Lessons || unit.Lessons.length === 0 ? (
                    <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
                      Chưa có bài học trong chương này.
                    </Alert>
                  ) : (
                    <List disablePadding>
                      {unit.Lessons.map((lesson, lessonIndex) => (
                        <LessonItem
                          key={lesson.LessonID}
                          lesson={lesson}
                          isEnrolled={isEnrolled}
                          onViewMaterial={handleViewMaterial}
                          index={lessonIndex}
                        />
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            </Card>
          ))}
        </Box>
      )}

      {/* Preview Dialog */}
      <LessonPreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        lesson={previewItem}
      />
    </Box>
  );
};

export default CourseCurriculum;