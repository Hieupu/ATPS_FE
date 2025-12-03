import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Grid,
  Fade,
} from '@mui/material';
import {
  PersonOutline,
  Assignment,
  EventAvailable,
  Assessment,
  RocketLaunchRounded,
} from '@mui/icons-material';
import ProgressBarCard from './ProgressBarCard';
import ClassAccordion from './ClassAccordion';

const CourseProgressCard = ({ item, index }) => {
  console.log("item", item)
  
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

  return (
    <Fade in={true} timeout={300 + index * 100}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(99,102,241,0.15)",
          boxShadow: "0 15px 40px rgba(15,23,42,0.08)",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 20px 50px rgba(99,102,241,0.15)",
            transform: "translateY(-4px)",
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Course Header */}
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Poppins', sans-serif",
                  flex: 1,
                }}
              >
                {item.course.title}
              </Typography>
              <Chip
                label={item.course.level}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontWeight: 700,
                  backdropFilter: "blur(10px)",
                }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              <Chip
                icon={<PersonOutline sx={{ color: "white !important" }} />}
                label={item.instructor.name}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  backdropFilter: "blur(5px)",
                }}
              />
              <Chip
                label={`${item.totalEnrolledClasses} lớp học`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  backdropFilter: "blur(5px)",
                }}
              />
              {/* Hiển thị tổng số units */}
              <Chip
                label={`${item.stats.totalUnits || 0} units`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  backdropFilter: "blur(5px)",
                }}
              />
            </Box>
          </Box>

          {/* Stats Summary - Grid 3 cột */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
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
                  additionalInfo={{
                    absent: item.stats.absentSessions || 0,
                    totalLessons: item.stats.totalLessons || 0
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Classes List */}
          <Box sx={{ px: 3, pb: 3 }}>
            {item.classesDetail?.map((classItem, idx) => (
              <ClassAccordion
                key={idx}
                classItem={classItem}
                courseId={item.courseId}
                  stats={item.stats}
                index={idx}
              />
            ))}
          </Box>

          {/* Completion Banner */}
          {isCourseCompleted && (
            <Box
              sx={{
                px: 3,
                pb: 3,
                borderTop: "2px solid",
                borderColor: "success.light",
                background: "linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(56,142,60,0.05) 100%)",
                mt: 2
              }}
            >
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "success.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1
                  }}
                >
                  <RocketLaunchRounded sx={{ fontSize: 28 }} />
                  🎉 Chúc mừng bạn đã hoàn thành khóa học!
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "success.dark",
                    mt: 1,
                    fontWeight: 600
                  }}
                >
                  Bạn đã hoàn thành tất cả các buổi học của khóa học này
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default CourseProgressCard;