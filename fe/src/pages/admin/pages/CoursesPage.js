import React, { useState, useEffect } from "react";
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
  LinearProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
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
  ContentCopy,
} from "@mui/icons-material";
import { getCoursesApi } from "../../../apiServices/courseService";
import "./style.css";

export default function CoursesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCoursesApi();
      setCourses(data?.courses || data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Sample courses if no data
  const sampleCourses = [
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
      category: "Database",
    },
  ];

  const displayCourses = courses.length > 0 ? courses : sampleCourses;

  // Filter courses by tab
  const getFilteredCourses = () => {
    let filtered = displayCourses;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query) ||
          c.category?.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    switch (tabValue) {
      case 0:
        return filtered;
      case 1:
        return filtered.filter(
          (c) =>
            c.status?.toUpperCase() === "ACTIVE" ||
            c.status?.toUpperCase() === "APPROVED" ||
            c.status?.toUpperCase() === "PUBLISHED"
        );
      case 2:
        return filtered.filter((c) => c.status?.toUpperCase() === "COMPLETED");
      case 3:
        return filtered.filter((c) => c.status?.toUpperCase() === "IN_REVIEW");
      case 4:
        return filtered.filter((c) => c.status?.toUpperCase() === "DRAFT");
      default:
        return filtered;
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
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "APPROVED":
      case "PUBLISHED":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "COMPLETED":
        return { bg: "#dbeafe", color: "#2563eb" };
      case "DRAFT":
        return { bg: "#fef3c7", color: "#d97706" };
      case "IN_REVIEW":
        return { bg: "#e0e7ff", color: "#6366f1" };
      default:
        return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "APPROVED":
      case "PUBLISHED":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "COMPLETED":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "DRAFT":
      case "IN_REVIEW":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const handlePreview = (course) => {
    // TODO: Implement preview functionality
    console.log("Preview course:", course);
    alert("Chức năng preview sẽ được triển khai sau");
  };

  const handleApprove = async (course, action) => {
    try {
      // TODO: Call API to approve/reject course
      console.log(`${action} course:`, course);
      alert(`Chức năng ${action === "APPROVE" ? "duyệt" : "từ chối"} sẽ được triển khai sau`);
    } catch (error) {
      console.error("Error approving course:", error);
    }
  };

  const activeCount = displayCourses.filter(
    (c) => c.status?.toUpperCase() === "ACTIVE" || c.status?.toUpperCase() === "APPROVED" || c.status?.toUpperCase() === "PUBLISHED"
  ).length;
  const completedCount = displayCourses.filter((c) => c.status?.toUpperCase() === "COMPLETED").length;
  const draftCount = displayCourses.filter((c) => c.status?.toUpperCase() === "DRAFT").length;
  const inReviewCount = displayCourses.filter((c) => c.status?.toUpperCase() === "IN_REVIEW").length;

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Course Management
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Manage and track all courses in the system
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <Tab label={`Tất cả (${displayCourses.length})`} />
          <Tab label={`Đã duyệt (${activeCount})`} />
          <Tab label={`Hoàn thành (${completedCount})`} />
          <Tab label={`Chờ duyệt (${inReviewCount})`} />
          <Tab label={`Nháp (${draftCount})`} />
        </Tabs>
      </Box>

      {/* Course Grid */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography sx={{ color: "#64748b" }}>Loading courses...</Typography>
        </Box>
      ) : getFilteredCourses().length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            No courses found
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            {searchQuery ? "Try adjusting your search" : "Create your first course to get started"}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                backgroundColor: "#667eea",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#5568d3",
                },
              }}
            >
              Create Course
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {getFilteredCourses().map((course) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={course.id || course.courseId}>
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
                    background: `linear-gradient(135deg, ${course.thumbnail || "#667eea"} 0%, ${course.thumbnail || "#667eea"}dd 100%)`,
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
                      label={
                        course.status?.toUpperCase() === "IN_REVIEW"
                          ? "Chờ duyệt"
                          : course.status?.toUpperCase() === "DRAFT"
                          ? "Nháp"
                          : course.status?.toUpperCase() === "APPROVED"
                          ? "Đã duyệt"
                          : course.status?.toUpperCase() === "PUBLISHED"
                          ? "Đã xuất bản"
                          : course.status || "active"
                      }
                      size="small"
                      icon={getStatusIcon(course.status)}
                      sx={{
                        backgroundColor: getStatusColor(course.status || "active").bg,
                        color: getStatusColor(course.status || "active").color,
                        fontWeight: 600,
                        textTransform: "capitalize",
                        height: 26,
                      }}
                    />
                    <Chip
                      label={course.category || "General"}
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
                    {course.title || course.name || "Untitled Course"}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      color: "#64748b",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.5,
                      minHeight: "42px",
                    }}
                  >
                    {course.description || "No description available"}
                  </Typography>

                  {/* Stats */}
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <People sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {course.students || 0} students
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 16, color: "#64748b" }} />
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {course.lessons || 0} lessons
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress */}
                  {course.progress !== undefined &&
                    course.status?.toUpperCase() !== "DRAFT" &&
                    course.status?.toUpperCase() !== "IN_REVIEW" && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Progress
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
                              backgroundColor: course.thumbnail || "#667eea",
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    )}

                  {/* Action Buttons for Pending Approval Courses */}
                  {(course.status?.toUpperCase() === "IN_REVIEW" ||
                    course.status?.toUpperCase() === "DRAFT") && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handlePreview(course)}
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          borderColor: "#667eea",
                          color: "#667eea",
                          "&:hover": {
                            borderColor: "#5568d3",
                            backgroundColor: "#f0f4ff",
                          },
                        }}
                      >
                        Preview
                      </Button>
                      {course.status?.toUpperCase() === "IN_REVIEW" && (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApprove(course, "APPROVE")}
                            sx={{
                              flex: 1,
                              textTransform: "none",
                              backgroundColor: "#10b981",
                              "&:hover": {
                                backgroundColor: "#059669",
                              },
                            }}
                          >
                            Duyệt
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => handleApprove(course, "REJECT")}
                            sx={{
                              textTransform: "none",
                              borderColor: "#ef4444",
                              color: "#ef4444",
                              "&:hover": {
                                borderColor: "#dc2626",
                                backgroundColor: "#fef2f2",
                              },
                            }}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
  );
}
