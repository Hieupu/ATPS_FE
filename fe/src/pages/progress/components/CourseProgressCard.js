import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Grid,
  Fade,
  Divider,
  alpha,
} from '@mui/material';
import {
  PersonOutline,
  Assignment,
  EventAvailable,
  Assessment,
  CheckCircle,
} from '@mui/icons-material';
import ProgressBarCard from './ProgressBarCard';
import ClassAccordion from './ClassAccordion';

const CourseProgressCard = ({ item, index }) => {
  // Tính toán phần trăm hoàn thành
  const assignmentProgress = item.stats.totalAssignments > 0
    ? (item.stats.completedAssignments / item.stats.totalAssignments) * 100
    : 0;
  
  const attendanceProgress = item.stats.totalSessions > 0
    ? (item.stats.attendedSessions / item.stats.totalSessions) * 100
    : 0;

  const examProgress = item.stats.totalExams > 0
    ? (item.stats.completedExams / item.stats.totalExams) * 100
    : 0;

  // Kiểm tra xem khóa học đã hoàn thành chưa
  const isCourseCompleted = item.classesDetail?.some(classItem =>
    classItem.stats.attendedSessions + classItem.stats.absentSessions >= classItem.stats.totalSessions
  );

  // Màu sắc chủ đạo dựa trên completion status
  const primaryColor = isCourseCompleted ? '#10B981' : '#6366F1';
  const lightBgColor = alpha(primaryColor, 0.04);

  return (
    <Fade in={true} timeout={200 + index * 50}>
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha('#E5E7EB', 0.8),
          backgroundColor: 'white',
          overflow: 'visible',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: alpha(primaryColor, 0.3),
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          },
          position: 'relative',
          ...(isCourseCompleted && {
            borderLeft: `4px solid ${primaryColor}`,
          }),
        }}
      >
        {/* Completion Badge */}
        {isCourseCompleted && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
            }}
          >
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label="Đã hoàn thành"
              size="small"
              sx={{
                bgcolor: alpha('#10B981', 0.1),
                color: '#047857',
                fontWeight: 600,
                fontSize: '0.75rem',
                border: `1px solid ${alpha('#10B981', 0.2)}`,
              }}
            />
          </Box>
        )}

        <CardContent sx={{ p: 0 }}>
          {/* Course Header - Minimalist */}
          <Box
            sx={{
              p: 3,
              background: lightBgColor,
              borderBottom: `1px solid ${alpha('#E5E7EB', 0.5)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#111827',
                    fontSize: '1.25rem',
                    lineHeight: 1.3,
                  }}
                >
                  {item.course.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
         <Chip
  label={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
        Giảng viên:
      </Typography>
      <Typography variant="caption" sx={{ color: '#111827', fontWeight: 500 }}>
        {item.instructor.name}
      </Typography>
    </Box>
  }
  size="small"
  sx={{
    bgcolor: 'white',
    color: '#6B7280',
    fontWeight: 500,
    fontSize: '0.75rem',
    border: `1px solid ${alpha('#E5E7EB', 0.8)}`,
    height: 28,
    paddingLeft: 1,
    paddingRight: 1,
  }}
/>
                </Box>
              </Box>
              
              <Chip
                label={item.course.level}
                size="small"
                sx={{
                  bgcolor: alpha(primaryColor, 0.1),
                  color: primaryColor,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 28,
                  ml: 2,
                }}
              />
            </Box>
          </Box>

          {/* Stats Summary - Clean Grid */}
          <Box sx={{ p: 3, pt: 2.5 }}>
            <Grid container spacing={2.5}>
              {/* Bài tập */}
              <Grid item xs={12} md={4}>
                <ProgressBarCard
                  icon={Assignment}
                  title="Bài Tập"
                  completed={item.stats.completedAssignments}
                  total={item.stats.totalAssignments}
                  percentage={assignmentProgress}
                  averageScore={item.stats.avgAssignmentScore}
                  emptyMessage="Khóa học này chưa có bài tập nào"
                  color="primary"
                  showAverage
                  variant="minimal"
                />
              </Grid>
              
              {/* Bài kiểm tra */}
              <Grid item xs={12} md={4}>
                <ProgressBarCard
                  icon={Assessment}
                  title="Bài Kiểm Tra"
                  completed={item.stats.completedExams}
                  total={item.stats.totalExams}
                  percentage={examProgress}
                  averageScore={item.stats.avgExamScore}
                  emptyMessage="Khóa học này chưa có bài kiểm tra nào"
                  color="warning"
                  showAverage
                  variant="minimal"
                  additionalInfo={{
                    avgExamScore: item.stats.avgExamScore || 0,
                    remainingExams: item.stats.remainingExams || 0
                  }}
                />
              </Grid>

              {/* Điểm danh */}
              <Grid item xs={12} md={4}>
                <ProgressBarCard
                  icon={EventAvailable}
                  title="Điểm Danh"
                  completed={item.stats.attendedSessions}
                  total={item.stats.totalSessions}
                  percentage={attendanceProgress}
                  totalHours={item.stats.totalStudyHours}
                  emptyMessage="Chưa có buổi học nào được ghi nhận"
                  color="success"
                  showHours
                  variant="minimal"
                  additionalInfo={{
                    absent: item.stats.absentSessions || 0,
                    totalLessons: item.stats.totalLessons || 0
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Divider */}
          {item.classesDetail?.length > 0 && (
            <Divider sx={{ borderColor: alpha('#E5E7EB', 0.5), mx: 3 }} />
          )}

          {/* Classes List */}
          {item.classesDetail?.length > 0 && (
            <Box sx={{ p: 3, pt: 2.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Danh sách lớp học
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {item.classesDetail.map((classItem, idx) => (
                  <ClassAccordion
                    key={idx}
                    classItem={classItem}
                    courseId={item.courseId}
                    stats={item.stats}
                    index={idx}
                    variant="minimal"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Completion Message - Subtle */}
          {isCourseCompleted && (
            <Box
              sx={{
                p: 2.5,
                mt: 1,
                mx: 3,
                borderRadius: 2,
                backgroundColor: alpha('#10B981', 0.05),
                border: `1px solid ${alpha('#10B981', 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircle
                  sx={{
                    color: '#10B981',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: '#065F46',
                    }}
                  >
                    Khóa học đã hoàn thành
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#047857',
                      lineHeight: 1.4,
                    }}
                  >
                    Bạn đã hoàn thành tất cả các buổi học của khóa học này
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default CourseProgressCard;