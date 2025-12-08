import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Paper,
  Button,
} from "@mui/material";
import {
  School,
  Assignment,
  People,
  CheckCircle,
  Schedule,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Add,
  Upload,
  PersonAdd,
  Description,
  VideoCall,
  Assessment,
} from "@mui/icons-material";

export default function InstructorDashboard() {
  // Quick Actions
  const quickActions = [
    {
      title: "Create Course",
      description: "Start a new course",
      icon: <Add />,
      color: "#667eea",
      bgColor: "#f0f4ff",
    },
    {
      title: "New Assignment",
      description: "Add assignment",
      icon: <Description />,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      title: "Schedule Class",
      description: "Plan a session",
      icon: <VideoCall />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "Upload Material",
      description: "Share resources",
      icon: <Upload />,
      color: "#8b5cf6",
      bgColor: "#faf5ff",
    },
    {
      title: "Add Student",
      description: "Enroll new student",
      icon: <PersonAdd />,
      color: "#ec4899",
      bgColor: "#fdf2f8",
    },
    {
      title: "View Reports",
      description: "Check analytics",
      icon: <Assessment />,
      color: "#06b6d4",
      bgColor: "#f0fdfa",
    },
  ];

  // Dữ liệu thống kê
  const stats = [
    {
      title: "Total Students",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: <People sx={{ fontSize: 32 }} />,
      color: "#667eea",
      bgColor: "#f0f4ff",
    },
    {
      title: "Active Courses",
      value: "24",
      change: "+3.2%",
      trend: "up",
      icon: <School sx={{ fontSize: 32 }} />,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      title: "Assignments",
      value: "156",
      change: "-2.4%",
      trend: "down",
      icon: <Assignment sx={{ fontSize: 32 }} />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "Completion Rate",
      value: "87.3%",
      change: "+5.1%",
      trend: "up",
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: "#06b6d4",
      bgColor: "#f0fdfa",
    },
  ];

  // Khóa học gần đây
  const recentCourses = [
    {
      name: "Advanced Web Development",
      students: 145,
      progress: 78,
      status: "active",
      lessons: 24,
    },
    {
      name: "Data Structures & Algorithms",
      students: 198,
      progress: 92,
      status: "active",
      lessons: 32,
    },
    {
      name: "Mobile App Development",
      students: 87,
      progress: 45,
      status: "active",
      lessons: 18,
    },
    {
      name: "Machine Learning Basics",
      students: 234,
      progress: 65,
      status: "active",
      lessons: 28,
    },
  ];

  // Bài tập cần chấm
  const pendingAssignments = [
    {
      course: "Web Development",
      title: "Final Project Submission",
      submissions: 45,
      deadline: "2 days left",
      priority: "high",
    },
    {
      course: "Data Structures",
      title: "Binary Tree Implementation",
      submissions: 32,
      deadline: "5 days left",
      priority: "medium",
    },
    {
      course: "Mobile Development",
      title: "UI/UX Design Assignment",
      submissions: 18,
      deadline: "1 week left",
      priority: "low",
    },
  ];

  // Sinh viên xuất sắc
  const topStudents = [
    { name: "Emma Johnson", course: "Web Dev", score: 98, avatar: "EJ" },
    {
      name: "Michael Chen",
      course: "Data Structures",
      score: 96,
      avatar: "MC",
    },
    { name: "Sarah Williams", course: "Mobile Dev", score: 95, avatar: "SW" },
    { name: "David Kim", course: "ML Basics", score: 94, avatar: "DK" },
  ];

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Quick Actions */}
      <Card
        sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", mb: 3 }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textAlign: "center",
                    "&:hover": {
                      borderColor: action.color,
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 16px ${action.color}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: action.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: action.color,
                      mx: "auto",
                      mb: 1.5,
                    }}
                  >
                    {React.cloneElement(action.icon, { sx: { fontSize: 24 } })}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5, fontSize: "13px" }}
                  >
                    {action.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "11px" }}
                  >
                    {action.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: stat.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Chip
                    label={stat.change}
                    size="small"
                    icon={
                      stat.trend === "up" ? (
                        <ArrowUpward sx={{ fontSize: 14 }} />
                      ) : (
                        <ArrowDownward sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{
                      backgroundColor:
                        stat.trend === "up" ? "#dcfce7" : "#fee2e2",
                      color: stat.trend === "up" ? "#16a34a" : "#dc2626",
                      fontWeight: 600,
                      height: 28,
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Active Courses */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Active Courses
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentCourses.map((course, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#fff",
                        borderColor: "#667eea",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {course.name}
                        </Typography>
                        <Box
                          sx={{ display: "flex", gap: 2, alignItems: "center" }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            <People
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                verticalAlign: "middle",
                              }}
                            />
                            {course.students} students
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <Schedule
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                verticalAlign: "middle",
                              }}
                            />
                            {course.lessons} lessons
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={course.status}
                        size="small"
                        sx={{
                          backgroundColor: "#dcfce7",
                          color: "#16a34a",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </Box>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {course.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#667eea",
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Top Students */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Top Students
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {topStudents.map((student, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#fff",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontWeight: 600,
                      }}
                    >
                      {student.avatar}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {student.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.course}
                      </Typography>
                    </Box>
                    <Chip
                      label={student.score}
                      size="small"
                      sx={{
                        backgroundColor: "#fef3c7",
                        color: "#d97706",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Pending Assignments */}
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Pending Reviews
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {pendingAssignments.map((assignment, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#fff",
                        borderColor: "#667eea",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {assignment.course}
                      </Typography>
                      <Chip
                        label={assignment.priority}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 600,
                          backgroundColor:
                            assignment.priority === "high"
                              ? "#fee2e2"
                              : assignment.priority === "medium"
                              ? "#fef3c7"
                              : "#dbeafe",
                          color:
                            assignment.priority === "high"
                              ? "#dc2626"
                              : assignment.priority === "medium"
                              ? "#d97706"
                              : "#2563eb",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {assignment.title}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {assignment.submissions} submissions
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#f59e0b", fontWeight: 600 }}
                      >
                        {assignment.deadline}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
