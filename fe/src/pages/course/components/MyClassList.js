import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Schedule, People, VideoCall, Assignment } from '@mui/icons-material';
import { getMyClassesInCourseApi } from '../../../apiServices/courseService';

const MyClassList = ({ courseId }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        setLoading(true);
        const response = await getMyClassesInCourseApi(courseId);
        setClasses(response.classes || []);
      } catch (error) {
        console.error("Error fetching my classes:", error);
        setError(error.message || "Failed to load your classes");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchMyClasses();
    }
  }, [courseId]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDayVietnamese = (day) => {
    const dayMap = {
      'Monday': 'Thứ 2',
      'Tuesday': 'Thứ 3', 
      'Wednesday': 'Thứ 4',
      'Thursday': 'Thứ 5',
      'Friday': 'Thứ 6',
      'Saturday': 'Thứ 7',
      'Sunday': 'Chủ nhật'
    };
    return dayMap[day] || day;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Alert severity="info">
        Bạn chưa đăng ký lớp học nào trong khóa học này.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Lớp học của bạn ({classes.length})
      </Typography>
      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} key={classItem.ClassID}>
            <Card 
              variant="outlined" 
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {classItem.ClassName || `Lớp ${classItem.ClassID}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Giảng viên: {classItem.InstructorName}
                    </Typography>
                  </Box>
                  <Chip 
                    label={classItem.Status === 'active' ? 'Đang hoạt động' : classItem.Status} 
                    color={classItem.Status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <People sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {classItem.StudentCount || 0} học viên
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {classItem.TotalSessions || 0} buổi học
                    </Typography>
                  </Box>
                  {classItem.startDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Assignment sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Khai giảng: {new Date(classItem.startDate).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {classItem.weeklySchedule && classItem.weeklySchedule.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Lịch học hàng tuần:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {classItem.weeklySchedule.map((schedule, index) => (
                        <Chip
                          key={index}
                          label={`${getDayVietnamese(schedule.Day)} ${formatTime(schedule.StartTime)}-${formatTime(schedule.EndTime)}`}
                          variant="outlined"
                          size="small"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {classItem.ZoomURL && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VideoCall sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Lớp học trực tuyến
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      size="small"
                      component="a"
                      href={classItem.ZoomURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tham gia ngay
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyClassList;