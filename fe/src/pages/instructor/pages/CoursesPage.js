import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  People,
  Schedule,
  PlayCircle,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  ContentCopy,
} from "@mui/icons-material";
import "./style.css";

export default function InstructorCourses() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Dữ liệu khóa học mẫu
  const courses = {
    all: [
      {
        id: 1,
        title: "Advanced Web Development",
        description: "Master modern web technologies including React, Node.js, and more",
        thumbnail: "#667eea",
        students: 145,
        lessons: 24,
        duration: "12 weeks",
        progress: 78,
        status: "active",
        nextClass: "Today, 2:00 PM",
        category: "Programming",
      },
      {
        id: 2,
        title: "Data Structures & Algorithms",
        description: "Deep dive into computer science fundamentals",
        thumbnail: "#10b981",
        students: 198,
        lessons: 32,
        duration: "16 weeks",
        progress: 92,
        status: "active",
        nextClass: "Tomorrow, 10:00 AM",
        category: "Computer Science",
      },
      {
        id: 3,
        title: "Mobile App Development",
        description: "Build native and cross-platform mobile applications",
        thumbnail: "#f59e0b",
        students: 87,
        lessons: 18,
        duration: "10 weeks",
        progress: 45,
        status: "active",
        nextClass: "Dec 2, 3:00 PM",
        category: "Mobile",
      },
      {
        id: 4,
        title: "Machine Learning Basics",
        description: "Introduction to ML algorithms and practical applications",
        thumbnail: "#8b5cf6",
        students: 234,
        lessons: 28,
        duration: "14 weeks",
        progress: 65,
        status: "active",
        nextClass: "Dec 5, 1:00 PM",
        category: "AI & ML",
      },
      {
        id: 5,
        title: "UI/UX Design Fundamentals",
        description: "Learn design principles and create amazing user experiences",
        thumbnail: "#ec4899",
        students: 156,
        lessons: 20,
        duration: "8 weeks",
        progress: 100,
        status: "completed",
        nextClass: "Completed",
        category: "Design",
      },
      {
        id: 6,
        title: "Database Management Systems",
        description: "Master SQL, NoSQL, and database design patterns",
        thumbnail: "#06b6d4",
        students: 0,
        lessons: 25,
        duration: "12 weeks",
        progress: 35,
        status: "draft",
        nextClass: "Not scheduled",
        category: "Database",
      },
    ],
  };

  // Lọc khóa học theo tab
  const getFilteredCourses = () => {
    switch (tabValue) {
      case 0:
        return courses.all;
      case 1:
        return courses.all.filter((c) => c.status === "active");
      case 2:
        return courses.all.filter((c) => c.status === "completed");
      case 3:
        return courses.all.filter((c) => c.status === "draft");
      default:
        return courses.all;
    }
  };

  const handleMenuOpen = (event, course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "completed":
        return { bg: "#dbeafe", color: "#2563eb" };
      case "draft":
        return { bg: "#fef3c7", color: "#d97706" };
      default:
        return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "completed":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "draft":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  return (
    <div className="instructor-page">
      <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                My Courses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and track all your courses in one place
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                backgroundColor: "#667eea",
                textTransform: "none",
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#5568d3",
                },
              }}
            >
              Create New Course
            </Button>
          </Box>

          {/* Search & Filter */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search courses..."
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "#e2e8f0",
                color: "#64748b",
                "&:hover": {
                  borderColor: "#667eea",
                  backgroundColor: "#f0f4ff",
                },
              }}
            >
              Filter
            </Button>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                minHeight: "48px",
              },
              "& .Mui-selected": {
                color: "#667eea",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#667eea",
              },
            }}
          >
            <Tab label={`All Courses (${courses.all.length})`} />
            <Tab label={`Active (${courses.all.filter((c) => c.status === "active").length})`} />
            <Tab label={`Completed (${courses.all.filter((c) => c.status === "completed").length})`} />
            <Tab label={`Draft (${courses.all.filter((c) => c.status === "draft").length})`} />
          </Tabs>
        </Box>

        {/* Course Grid */}
        <Grid container spacing={3}>
          {getFilteredCourses().map((course) => (
            <Grid item xs={12} sm={6} md={3} lg={3} key={course.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {/* Thumbnail */}
                <Box
                  sx={{
                    height: 160,
                    background: `linear-gradient(135deg, ${course.thumbnail} 0%, ${course.thumbnail}dd 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <PlayCircle sx={{ fontSize: 64, color: "white", opacity: 0.9 }} />
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": { backgroundColor: "white" },
                    }}
                    size="small"
                    onClick={(e) => handleMenuOpen(e, course)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <CardContent>
                  {/* Status & Category */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Chip
                      label={course.status}
                      size="small"
                      icon={getStatusIcon(course.status)}
                      sx={{
                        backgroundColor: getStatusColor(course.status).bg,
                        color: getStatusColor(course.status).color,
                        fontWeight: 600,
                        textTransform: "capitalize",
                        height: 26,
                      }}
                    />
                    <Chip
                      label={course.category}
                      size="small"
                      sx={{
                        backgroundColor: "#f1f5f9",
                        color: "#64748b",
                        fontWeight: 500,
                        fontSize: "11px",
                        height: 24,
                      }}
                    />
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: "16px" }}>
                    {course.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.5,
                      minHeight: "42px",
                    }}
                  >
                    {course.description}
                  </Typography>

                  {/* Stats */}
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <People sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="caption" color="text.secondary">
                        {course.students} students
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="caption" color="text.secondary">
                        {course.lessons} lessons
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress */}
                  {course.status !== "draft" && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Course Progress
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {course.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: course.thumbnail,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Next Class */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      pt: 2,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Next class
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
                        {course.nextClass}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        textTransform: "none",
                        fontSize: "12px",
                        borderColor: course.thumbnail,
                        color: course.thumbnail,
                        "&:hover": {
                          borderColor: course.thumbnail,
                          backgroundColor: `${course.thumbnail}15`,
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Course Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              minWidth: 180,
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Visibility sx={{ fontSize: 18, mr: 1.5 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Edit sx={{ fontSize: 18, mr: 1.5 }} />
            Edit Course
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ContentCopy sx={{ fontSize: 18, mr: 1.5 }} />
            Duplicate
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
            <Delete sx={{ fontSize: 18, mr: 1.5 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Create Course Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Create New Course</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Course Title"
                fullWidth
                placeholder="Enter course title"
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                placeholder="Enter course description"
              />
              <TextField
                label="Category"
                fullWidth
                placeholder="e.g., Programming, Design"
              />
              <TextField
                label="Duration"
                fullWidth
                placeholder="e.g., 12 weeks"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              sx={{ textTransform: "none", color: "#64748b" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                textTransform: "none",
                backgroundColor: "#667eea",
                "&:hover": { backgroundColor: "#5568d3" },
              }}
            >
              Create Course
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}