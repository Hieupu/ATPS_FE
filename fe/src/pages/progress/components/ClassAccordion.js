import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore,
  Class as ClassIcon,
  Star,
  CheckCircle,
  Cancel,
  CalendarToday,
  Assignment,
  EventAvailable,
} from '@mui/icons-material';

const ClassAccordion = ({ classItem, courseId, index }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 8) return "success.main";
    if (score >= 6.5) return "warning.main";
    return "error.main";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    return "error";
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "info";
    return "warning";
  };

  return (
    <Accordion
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        border: "1px solid rgba(99,102,241,0.1)",
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMore
            sx={{
              bgcolor: "rgba(102,126,234,0.1)",
              borderRadius: "50%",
              p: 0.5,
            }}
          />
        }
        sx={{
          bgcolor: "#f8f9fe",
          "&:hover": {
            bgcolor: "#eef0ff",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, flexWrap: "wrap" }}>
          <ClassIcon sx={{ color: "primary.main" }} />
          <Typography sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
            {classItem.name}
          </Typography>
          <Chip
            label={classItem.status}
            size="small"
            color={classItem.status.toLowerCase() === 'enrolled' ? 'success' : 'default'}
            sx={{ fontWeight: 600 }}
          />
          <Box sx={{ ml: "auto", display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Chip
              icon={<Star sx={{ fontSize: 16 }} />}
              label={`Điểm: ${classItem.stats.avgScore}`}
              size="small"
              sx={{
                bgcolor: "rgba(254,202,87,0.2)",
                color: "warning.dark",
                fontWeight: 700,
              }}
            />
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label={`${classItem.stats.attendedSessions}/${classItem.stats.totalSessions}`}
              size="small"
              color={getAttendanceColor(classItem.attendanceRate)}
              sx={{ fontWeight: 700 }}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3, bgcolor: "white" }}>
        {/* Progress Overview for Class */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            📊 Tiến Độ Lớp Học
          </Typography>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            {classItem.stats.totalSessions > 0 ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ✅ Tỷ lệ điểm danh ({classItem.stats.attendedSessions}/{classItem.stats.totalSessions})
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "success.main" }}>
                    {classItem.attendanceRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(classItem.attendanceRate)}
                  color={getProgressColor(parseFloat(classItem.attendanceRate))}
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                    },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, pt: 2, borderTop: "1px solid rgba(99,102,241,0.1)" }}>
                  <Typography variant="caption" color="text.secondary">
                    📅 Số buổi học đã tham gia
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                    {classItem.stats.attendedSessions}/{classItem.stats.totalSessions}
                  </Typography>
                </Box>
              </>
            ) : (
              <Alert
                severity="info"
                icon={<EventAvailable />}
                sx={{ borderRadius: 2 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Chưa có buổi học nào được ghi nhận
                </Typography>
              </Alert>
            )}
          </Box>

          <Alert
            severity="info"
            icon={<Assignment />}
            sx={{ mt: 2, borderRadius: 2, bgcolor: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              📝 Bài tập thuộc khóa học
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tiến độ bài tập được hiển thị ở cấp độ khóa học (xem phần trên), không phải từng lớp học
            </Typography>
          </Alert>
        </Box>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onChange={(e, v) => setSelectedTab(v)}
          sx={{
            mb: 3,
            borderBottom: "2px solid",
            borderColor: "divider",
            "& .MuiTab-root": {
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.95rem",
            },
            "& .Mui-selected": {
              color: "primary.main",
            },
          }}
        >
          <Tab label="📝 Bài Tập" />
          <Tab label="📋 Kiểm Tra" />
          <Tab label="✅ Điểm Danh" />
        </Tabs>

        {/* Tab Content */}
        {selectedTab === 0 && (
          <AssignmentsTab classItem={classItem} getScoreColor={getScoreColor} />
        )}
        {selectedTab === 1 && (
          <ExamsTab classItem={classItem} getScoreColor={getScoreColor} />
        )}
        {selectedTab === 2 && (
          <AttendanceTab classItem={classItem} />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

// Sub-components for tabs
const AssignmentsTab = ({ classItem, getScoreColor }) => (
  <Box>
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(99,102,241,0.1)",
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "#f8f9fe" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Số lượng</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Điểm TB</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>Đã hoàn thành</Typography>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Chip
                label={classItem.stats.completedAssignments}
                size="small"
                color="success"
                sx={{ fontWeight: 700 }}
              />
            </TableCell>
            <TableCell align="right">
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: getScoreColor(classItem.stats.avgScore)
                }}
              >
                {classItem.stats.avgScore}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Cancel color="warning" fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>Chưa hoàn thành</Typography>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Chip
                label={classItem.stats.remainingAssignments}
                size="small"
                color="warning"
                sx={{ fontWeight: 700 }}
              />
            </TableCell>
            <TableCell align="right">-</TableCell>
          </TableRow>
          <TableRow sx={{ bgcolor: "#f8f9fe" }}>
            <TableCell sx={{ fontWeight: 800 }}>Tổng cộng</TableCell>
            <TableCell align="center">
              <Chip
                label={classItem.stats.totalAssignments}
                size="small"
                sx={{ fontWeight: 700, bgcolor: "primary.light", color: "primary.dark" }}
              />
            </TableCell>
            <TableCell align="right">
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                {classItem.stats.avgScore}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const ExamsTab = ({ classItem, getScoreColor }) => (
  <Box>
    <Alert
      severity="info"
      sx={{
        mb: 3,
        borderRadius: 3,
        border: "1px solid rgba(33,150,243,0.2)",
      }}
    >
      Điểm kiểm tra được tính trong điểm trung bình chung của khóa học
    </Alert>
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(99,102,241,0.1)",
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "#f8f9fe" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Loại</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Số lượng</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Điểm TB</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
            <TableCell>
              <Typography sx={{ fontWeight: 600 }}>Bài kiểm tra đã làm</Typography>
            </TableCell>
            <TableCell align="center">
              <Chip
                label={classItem.stats.completedExams || 0}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            </TableCell>
            <TableCell align="right">
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: getScoreColor(classItem.stats.avgExamScore || 0)
                }}
              >
                {classItem.stats.avgExamScore || 0}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
            <TableCell>
              <Typography sx={{ fontWeight: 600 }}>Chưa làm</Typography>
            </TableCell>
            <TableCell align="center">
              <Chip
                label={classItem.stats.remainingExams || 0}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </TableCell>
            <TableCell align="right">-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

const AttendanceTab = ({ classItem }) => (
  <Box>
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        border: "1px solid rgba(99,102,241,0.1)",
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "#f8f9fe" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Số buổi</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Thời gian</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>Có mặt</Typography>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Chip
                label={classItem.stats.attendedSessions}
                size="small"
                color="success"
                sx={{ fontWeight: 700 }}
              />
            </TableCell>
            <TableCell align="right">
              <Typography sx={{ fontWeight: 700 }}>
                {classItem.stats.totalStudyHours}h
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow sx={{ "&:hover": { bgcolor: "#f8f9fe" } }}>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Cancel color="error" fontSize="small" />
                <Typography sx={{ fontWeight: 600 }}>Vắng mặt</Typography>
              </Box>
            </TableCell>
            <TableCell align="center">
              <Chip
                label={classItem.stats.absentSessions}
                size="small"
                color="error"
                sx={{ fontWeight: 700 }}
              />
            </TableCell>
            <TableCell align="right">-</TableCell>
          </TableRow>
          <TableRow sx={{ bgcolor: "#f8f9fe" }}>
            <TableCell sx={{ fontWeight: 800 }}>Tổng cộng</TableCell>
            <TableCell align="center">
              <Chip
                label={classItem.stats.totalSessions}
                size="small"
                sx={{ fontWeight: 700, bgcolor: "primary.light", color: "primary.dark" }}
              />
            </TableCell>
            <TableCell align="right">
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                {classItem.attendanceRate}%
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: "#f8f9fe",
        borderRadius: 3,
        border: "1px solid rgba(99,102,241,0.1)",
      }}
    >
      <Typography variant="body2" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <CalendarToday fontSize="small" sx={{ color: "primary.main" }} />
        <strong>Ngày đăng ký:</strong> {new Date(classItem.dates.enrollmentDate).toLocaleDateString("vi-VN")}
      </Typography>
      {classItem.dates.classStart && (
        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarToday fontSize="small" sx={{ color: "primary.main" }} />
          <strong>Thời gian lớp học:</strong> {new Date(classItem.dates.classStart).toLocaleDateString("vi-VN")} - {new Date(classItem.dates.classEnd).toLocaleDateString("vi-VN")}
        </Typography>
      )}
    </Paper>
  </Box>
);

export default ClassAccordion;