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
import { Schedule, People, Assignment } from '@mui/icons-material';
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          👥 Lớp học của bạn
        </Typography>
        <Chip
          label={`${classes.length} lớp`}
          size="small"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: 600,
          }}
        />
      </Box>
      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} key={classItem.ClassID}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 4,
                border: "1px solid rgba(99,102,241,0.15)",
                boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 15px 35px rgba(99,102,241,0.2)',
                  transform: 'translateY(-3px)',
                  borderColor: 'rgba(99,102,241,0.3)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "'Poppins', sans-serif",
                        mb: 1,
                      }}
                    >
                      {classItem.ClassName || `Lớp ${classItem.ClassID}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                      👨‍🏫 Giảng viên: <strong>{classItem.InstructorName}</strong>
                    </Typography>
                  </Box>
                  <Chip 
                    label={classItem.Status === 'active' || classItem.Status === 'Ongoing' ? 'Đang hoạt động' : classItem.Status} 
                    sx={{
                      bgcolor: classItem.Status === 'active' || classItem.Status === 'Ongoing' ? 'success.light' : 'grey.200',
                      color: classItem.Status === 'active' || classItem.Status === 'Ongoing' ? 'success.dark' : 'text.secondary',
                      fontWeight: 600,
                    }}
                    size="small"
                  />
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 3,
                    p: 2,
                    bgcolor: "#f8f9fe",
                    borderRadius: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {classItem.StudentCount || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      học viên
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Schedule sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {classItem.TotalSessions || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      buổi học
                    </Typography>
                  </Box>
                  {classItem.Opendate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Assignment sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        Khai giảng: <strong>{new Date(classItem.Opendate).toLocaleDateString('vi-VN')}</strong>
                      </Typography>
                    </Box>
                  )}
                </Box>

                {classItem.weeklySchedule && classItem.weeklySchedule.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        mb: 1.5,
                      }}
                    >
                      📅 Lịch học hàng tuần:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {classItem.weeklySchedule.map((schedule, index) => (
                        <Chip
                          key={index}
                          label={`${getDayVietnamese(schedule.Day)} ${formatTime(schedule.StartTime)}-${formatTime(schedule.EndTime)}`}
                          sx={{
                            bgcolor: "rgba(102,126,234,0.1)",
                            color: "primary.main",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                          size="small"
                        />
                      ))}
                    </Box>
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