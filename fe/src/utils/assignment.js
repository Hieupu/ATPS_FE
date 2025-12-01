// utils.js - Helper functions for curriculum components

import {
  VideoLibrary,
  Description,
  AudioFile,
  Assignment,
  Image,
  InsertDriveFile,
} from '@mui/icons-material';

/**
 * Get file icon based on type
 */
export const getFileIcon = (type, size = 'medium') => {
  const iconProps = { 
    sx: { 
      fontSize: size === 'large' ? 40 : size === 'small' ? 20 : 24,
      color: getTypeColor(type).icon 
    } 
  };

  const icons = {
    video: <VideoLibrary {...iconProps} />,
    document: <Description {...iconProps} />,
    audio: <AudioFile {...iconProps} />,
    assignment: <Assignment {...iconProps} />,
    image: <Image {...iconProps} />,
    default: <InsertDriveFile {...iconProps} />,
  };

  return icons[type] || icons.default;
};

/**
 * Get color scheme for different types
 */
export const getTypeColor = (type) => {
  const colors = {
    video: {
      label: 'Video',
      bg: 'rgba(244, 67, 54, 0.1)',
      text: '#d32f2f',
      icon: '#f44336',
    },
    document: {
      label: 'Tài liệu',
      bg: 'rgba(33, 150, 243, 0.1)',
      text: '#1976d2',
      icon: '#2196f3',
    },
    audio: {
      label: 'Audio',
      bg: 'rgba(156, 39, 176, 0.1)',
      text: '#7b1fa2',
      icon: '#9c27b0',
    },
    assignment: {
      label: 'Bài tập',
      bg: 'rgba(255, 152, 0, 0.1)',
      text: '#f57c00',
      icon: '#ff9800',
    },
    quiz: {
      label: 'Trắc nghiệm',
      bg: 'rgba(76, 175, 80, 0.1)',
      text: '#388e3c',
      icon: '#4caf50',
    },
  };

  return colors[type] || {
    label: 'Khác',
    bg: 'rgba(158, 158, 158, 0.1)',
    text: '#616161',
    icon: '#9e9e9e',
  };
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if today
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `Hôm nay, ${date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    return `Hôm qua, ${date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  // Check if tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  if (isTomorrow) {
    return `Ngày mai, ${date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  // Otherwise show full date
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format duration in seconds to readable format
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0 phút';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0) parts.push(`${minutes} phút`);
  if (secs > 0 && hours === 0) parts.push(`${secs} giây`);
  
  return parts.join(' ') || '0 phút';
};

/**
 * Check if assignment is overdue
 */
export const isAssignmentOverdue = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

/**
 * Get assignment status color
 */
export const getAssignmentStatusColor = (status) => {
  const colors = {
    submitted: 'success',
    late: 'warning',
    not_submitted: 'error',
  };
  return colors[status] || 'default';
};

/**
 * Get assignment status text
 */
export const getAssignmentStatusText = (status) => {
  const texts = {
    submitted: 'Đã nộp',
    late: 'Nộp muộn',
    not_submitted: 'Chưa nộp',
  };
  return texts[status] || status;
};

/**
 * Calculate total course duration
 */
export const calculateTotalDuration = (curriculum) => {
  if (!curriculum || !Array.isArray(curriculum)) return 0;
  
  return curriculum.reduce((total, unit) => {
    const unitDuration = unit.Lessons?.reduce((sum, lesson) => {
      return sum + (lesson.Time || lesson.Duration || 0);
    }, 0) || 0;
    return total + unitDuration;
  }, 0);
};

/**
 * Calculate course progress
 */
export const calculateProgress = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSizeMB) => {
  if (!file) return { valid: true };
  
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      message: `File không được vượt quá ${maxSizeMB}MB`,
    };
  }
  
  return { valid: true };
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) return { valid: true };
  
  const fileType = file.type;
  const fileName = file.name;
  const fileExt = fileName.split('.').pop().toLowerCase();
  
  // Check MIME type
  const mimeTypeValid = allowedTypes.some(type => {
    if (type.includes('*')) {
      const prefix = type.split('/')[0];
      return fileType.startsWith(prefix);
    }
    return fileType === type;
  });
  
  // Check extension
  const extValid = allowedTypes.some(type => {
    return type.includes(fileExt);
  });
  
  if (!mimeTypeValid && !extValid) {
    return {
      valid: false,
      message: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`,
    };
  }
  
  return { valid: true };
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get time remaining until deadline
 */
export const getTimeRemaining = (deadline) => {
  if (!deadline) return null;
  
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;
  
  if (diff <= 0) {
    return { overdue: true, text: 'Đã quá hạn' };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return { 
      overdue: false, 
      text: `Còn ${days} ngày ${hours} giờ`,
      urgent: days <= 1,
    };
  }
  
  if (hours > 0) {
    return { 
      overdue: false, 
      text: `Còn ${hours} giờ ${minutes} phút`,
      urgent: true,
    };
  }
  
  return { 
    overdue: false, 
    text: `Còn ${minutes} phút`,
    urgent: true,
  };
};

/**
 * Group assignments by status
 */
export const groupAssignmentsByStatus = (assignments) => {
  return {
    notStarted: assignments.filter(a => !a.Submission),
    submitted: assignments.filter(a => a.Submission?.Status === 'submitted'),
    late: assignments.filter(a => a.Submission?.Status === 'late'),
    overdue: assignments.filter(a => !a.Submission && isAssignmentOverdue(a.Deadline)),
  };
};

/**
 * Calculate assignment statistics
 */
export const calculateAssignmentStats = (assignments) => {
  const total = assignments.length;
  const completed = assignments.filter(a => a.Submission).length;
  const pending = total - completed;
  const overdue = assignments.filter(a => !a.Submission && isAssignmentOverdue(a.Deadline)).length;
  
  return {
    total,
    completed,
    pending,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

/**
 * Sort assignments by deadline
 */
export const sortAssignmentsByDeadline = (assignments, ascending = true) => {
  return [...assignments].sort((a, b) => {
    const dateA = new Date(a.Deadline);
    const dateB = new Date(b.Deadline);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Filter assignments by type
 */
export const filterAssignmentsByType = (assignments, type) => {
  if (!type || type === 'all') return assignments;
  return assignments.filter(a => a.Type === type);
};

export default {
  getFileIcon,
  getTypeColor,
  formatDate,
  formatDuration,
  isAssignmentOverdue,
  getAssignmentStatusColor,
  getAssignmentStatusText,
  calculateTotalDuration,
  calculateProgress,
  validateFileSize,
  validateFileType,
  formatFileSize,
  getTimeRemaining,
  groupAssignmentsByStatus,
  calculateAssignmentStats,
  sortAssignmentsByDeadline,
  filterAssignmentsByType,
};