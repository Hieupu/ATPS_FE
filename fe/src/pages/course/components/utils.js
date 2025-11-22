import {
  VideoLibrary,
  Headphones,
  MenuBook,
  Edit,
  Assignment,
  InsertDriveFile,
} from '@mui/icons-material';

export const getFileIcon = (type) => {
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
    case "assignment":
      return <Assignment sx={{ color: '#9B59B6' }} />;
    default:
      return <InsertDriveFile sx={{ color: '#95A5A6' }} />;
  }
};

export const getTypeColor = (type) => {
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
    case "assignment":
      return { bg: '#E8DAEF', text: '#9B59B6', label: 'Bài tập' };
    default:
      return { bg: '#ECF0F1', text: '#95A5A6', label: type };
  }
};

export const formatLessonTime = (minutes) => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isAssignmentOverdue = (deadline) => {
  return new Date(deadline) < new Date();
};

export const getAssignmentStatusColor = (status) => {
  switch (status) {
    case 'submitted': return 'success';
    case 'late': return 'error';
    case 'not_submitted': return 'warning';
    default: return 'default';
  }
};

export const getAssignmentStatusText = (status) => {
  switch (status) {
    case 'submitted': return 'Đã nộp';
    case 'late': return 'Nộp trễ';
    case 'not_submitted': return 'Chưa nộp';
    default: return status;
  }
};