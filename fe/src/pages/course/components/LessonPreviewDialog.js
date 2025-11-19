import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  AccessTime,
  Close,
  Headphones,
  Download,
  Fullscreen,
  InsertDriveFile,
  VideoLibrary,
  MenuBook,
  Edit,
} from '@mui/icons-material';

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

const LessonPreviewDialog = ({ open, onClose, lesson }) => {
  const [fullscreen, setFullscreen] = useState(false);

  if (!lesson) return null;

  const typeInfo = getTypeColor(lesson.Type);
  const isVideo = ['video', 'mp4'].includes((lesson.Type || "").toLowerCase());
  const isAudio = ['listening', 'audio', 'mp3'].includes((lesson.Type || "").toLowerCase());
  const isPDF = ['reading', 'pdf'].includes((lesson.Type || "").toLowerCase());

  const handleDownload = () => {
    if (lesson.FileURL) {
      window.open(lesson.FileURL, '_blank');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={fullscreen ? false : "lg"}
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          borderRadius: fullscreen ? 0 : 2,
          maxHeight: fullscreen ? '100vh' : '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1, 
            bgcolor: 'rgba(255,255,255,0.2)', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
          }}>
            {getFileIcon(lesson.Type)}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {lesson.Title}
            </Typography>
            <Chip
              label={typeInfo.label}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 500,
                mt: 0.5,
              }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setFullscreen(!fullscreen)}
            sx={{ color: 'white' }}
          >
            <Fullscreen />
          </IconButton>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          bgcolor: '#f8f9fa',
          height: fullscreen ? 'calc(100vh - 120px)' : '70vh', 
          overflow: 'auto',
        }}
      >
        <Box sx={{ position: 'relative', bgcolor: 'black' }}>
          {isVideo && lesson.FileURL && (
            <Box
              sx={{
                width: '100%',
                height: fullscreen ? '85vh' : '65vh',   
                backgroundColor: 'black',
              }}
            >
              <video
                controls
                autoPlay
                style={{
                  width: '100%',
                  height: '100%',                        
                  objectFit: 'contain',                   
                  backgroundColor: 'black',
                }}
              >
                <source src={lesson.FileURL} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            </Box>
          )}

          {isAudio && lesson.FileURL && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                p: 4,
              }}
            >
              <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 600 }}>
                <Headphones sx={{ fontSize: 80, color: 'white', mb: 3 }} />
                <Typography variant="h5" sx={{ color: 'white', mb: 4, fontWeight: 500 }}>
                  Listening Exercise
                </Typography>
                <audio
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    filter: 'brightness(0) invert(1)',
                  }}
                >
                  <source src={lesson.FileURL} type="audio/mpeg" />
                  Trình duyệt của bạn không hỗ trợ audio.
                </audio>
              </Box>
            </Box>
          )}

          {isPDF && lesson.FileURL && (
            <Box sx={{ height: fullscreen ? '80vh' : '600px', bgcolor: 'white' }}>
              <iframe
                src={`${lesson.FileURL}#toolbar=1&navpanes=1&scrollbar=1`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title={lesson.Title}
              />
            </Box>
          )}

          {!lesson.FileURL && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                bgcolor: 'grey.100',
              }}
            >
              <Alert severity="warning">
                Nội dung không khả dụng
              </Alert>
            </Box>
          )}
        </Box>

        {/* Lesson Details */}
        <Box sx={{ p: 3 }}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Thông tin bài học
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {lesson.Description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Mô tả:
                  </Typography>
                  <Typography variant="body1">
                    {lesson.Description}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {lesson.Time && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Thời lượng:</strong> {formatLessonTime(lesson.Time)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getFileIcon(lesson.Type)}
                  <Typography variant="body2">
                    <strong>Loại:</strong> {typeInfo.label}
                  </Typography>
                </Box>
              </Box>

              {lesson.Objectives && lesson.Objectives.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Mục tiêu bài học:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 3 }}>
                    {lesson.Objectives.map((obj, idx) => (
                      <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                        {obj}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
        <Button
          onClick={handleDownload}
          startIcon={<Download />}
          variant="outlined"
          disabled={!lesson.FileURL}
        >
          Tải xuống
        </Button>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LessonPreviewDialog;