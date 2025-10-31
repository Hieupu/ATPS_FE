import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import {
  Search,
  FilterList,
  MoreVert,
  People,
  Schedule,
  PlayCircle,
  CheckCircle,
  HourglassEmpty,
  VideoCall,
  Assignment,
  Assessment,
  EditCalendar,
  CloudUpload,
  NoteAlt,
  Poll,
  Visibility,
} from "@mui/icons-material";
import "./style.css";

export default function InstructorClasses() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dữ liệu lớp học mẫu (được Admin phân công)
  const classes = {
    all: [
      {
        id: 1,
        courseName: "Advanced Web Development",
        classCode: "WD-2025-A",
        students: 42,
        totalStudents: 50,
        progress: 78,
        status: "ongoing",
        nextSession: "Today, 2:00 PM",
        startDate: "2025-10-01",
        endDate: "2025-12-20",
        schedule: "Mon, Wed, Fri",
        thumbnail: "#667eea",
        pendingAssignments: 12,
        attendanceRate: 92,
      },
      {
        id: 2,
        courseName: "Data Structures & Algorithms",
        classCode: "DSA-2025-B",
        students: 38,
        totalStudents: 40,
        progress: 92,
        status: "ongoing",
        nextSession: "Tomorrow, 10:00 AM",
        startDate: "2025-09-15",
        endDate: "2026-01-10",
        schedule: "Tue, Thu",
        thumbnail: "#10b981",
        pendingAssignments: 8,
        attendanceRate: 88,
      },
      {
        id: 3,
        courseName: "Mobile App Development",
        classCode: "MOB-2025-C",
        students: 25,
        totalStudents: 30,
        progress: 45,
        status: "upcoming",
        nextSession: "Dec 2, 3:00 PM",
        startDate: "2025-12-02",
        endDate: "2026-02-28",
        schedule: "Mon, Wed",
        thumbnail: "#f59e0b",
        pendingAssignments: 0,
        attendanceRate: 0,
      },
      {
        id: 4,
        courseName: "Machine Learning Basics",
        classCode: "ML-2024-A",
        students: 55,
        totalStudents: 60,
        progress: 100,
        status: "completed",
        nextSession: "Completed",
        startDate: "2024-08-01",
        endDate: "2024-11-15",
        schedule: "Tue, Thu, Sat",
        thumbnail: "#8b5cf6",
        pendingAssignments: 0,
        attendanceRate: 94,
      },
      {
        id: 5,
        courseName: "UI/UX Design Fundamentals",
        classCode: "UX-2025-D",
        students: 30,
        totalStudents: 35,
        progress: 65,
        status: "ongoing",
        nextSession: "Dec 5, 1:00 PM",
        startDate: "2025-11-01",
        endDate: "2026-01-20",
        schedule: "Fri, Sat",
        thumbnail: "#ec4899",
        pendingAssignments: 15,
        attendanceRate: 85,
      },
    ],
  };

  const getFilteredClasses = () => {
    let filtered = classes.all;

    switch (tabValue) {
      case 1:
        filtered = filtered.filter((c) => c.status === "ongoing");
        break;
      case 2:
        filtered = filtered.filter((c) => c.status === "upcoming");
        break;
      case 3:
        filtered = filtered.filter((c) => c.status === "completed");
        break;
      default:
        break;
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.classCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleMenuOpen = (event, cls) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(cls);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "ongoing":
        return { label: "Ongoing", color: "#16a34a", bg: "#dcfce7", icon: <CheckCircle /> };
      case "upcoming":
        return { label: "Upcoming", color: "#d97706", bg: "#fef3c7", icon: <HourglassEmpty /> };
      case "completed":
        return { label: "Completed", color: "#2563eb", bg: "#dbeafe", icon: <CheckCircle /> };
      default:
        return { label: "Unknown", color: "#64748b", bg: "#f1f5f9", icon: null };
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
                My Classes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage classes assigned to you by Admin
              </Typography>
            </Box>

            {/* LOẠI BỎ NÚT TẠO LỚP */}
            {/* <Button>...</Button> */}
          </Box>

          {/* Search & Filter */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search by class name or code..."
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
              "& .Mui-selected": { color: "#667eea" },
              "& .MuiTabs-indicator": { backgroundColor: "#667eea" },
            }}
          >
            <Tab label={`All (${classes.all.length})`} />
            <Tab label={`Ongoing (${classes.all.filter((c) => c.status === "ongoing").length})`} />
            <Tab label={`Upcoming (${classes.all.filter((c) => c.status === "upcoming").length})`} />
            <Tab label={`Completed (${classes.all.filter((c) => c.status === "completed").length})`} />
          </Tabs>
        </Box>

        {/* Class Grid */}
        <Grid container spacing={3}>
          {getFilteredClasses().map((cls) => {
            const status = getStatusConfig(cls.status);
            return (
              <Grid item xs={12} sm={6} md={3} lg={3} key={cls.id}>
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
                      height: 140,
                      background: `linear-gradient(135deg, ${cls.thumbnail} 0%, ${cls.thumbnail}dd 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      borderRadius: "12px 12px 0 0",
                    }}
                  >
                    {cls.status === "ongoing" && (
                      <PlayCircle sx={{ fontSize: 56, color: "white", opacity: 0.9 }} />
                    )}
                    {cls.status === "upcoming" && (
                      <Schedule sx={{ fontSize: 56, color: "white", opacity: 0.9 }} />
                    )}
                    {cls.status === "completed" && (
                      <CheckCircle sx={{ fontSize: 56, color: "white", opacity: 0.9 }} />
                    )}
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        "&:hover": { backgroundColor: "white" },
                      }}
                      size="small"
                      onClick={(e) => handleMenuOpen(e, cls)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <CardContent sx={{ pt: 2 }}>
                    {/* Status & Code */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Chip
                        label={status.label}
                        size="small"
                        icon={status.icon}
                        sx={{
                          backgroundColor: status.bg,
                          color: status.color,
                          fontWeight: 600,
                          height: 26,
                          fontSize: "11px",
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>
                        {cls.classCode}
                      </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: "16px" }}>
                      {cls.courseName}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Tooltip title="Enrolled Students">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <People sx={{ fontSize: 16, color: "#64748b" }} />
                          <Typography variant="caption" color="text.secondary">
                            {cls.students}/{cls.totalStudents}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Attendance Rate">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CheckCircle sx={{ fontSize: 16, color: "#16a34a" }} />
                          <Typography variant="caption" color="text.secondary">
                            {cls.attendanceRate}%
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Stack>

                    {cls.status !== "upcoming" && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {cls.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={cls.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#e2e8f0",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: cls.thumbnail,
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pt: 1.5,
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Next session
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
                          {cls.nextSession}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        {cls.status === "ongoing" && (
                          <>
                            <Tooltip title="Take Attendance">
                              <IconButton size="small" color="primary">
                                <EditCalendar />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Join Online Class">
                              <IconButton size="small" color="success">
                                <VideoCall />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontSize: "12px",
                            borderColor: cls.thumbnail,
                            color: cls.thumbnail,
                            "&:hover": {
                              borderColor: cls.thumbnail,
                              backgroundColor: `${cls.thumbnail}15`,
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Stack>
                    </Box>

                    {cls.pendingAssignments > 0 && (
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Chip
                          icon={<Assignment sx={{ fontSize: 16 }} />}
                          label={`${cls.pendingAssignments} pending`}
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", minWidth: 200 },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Visibility sx={{ fontSize: 18, mr: 1.5 }} /> View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <People sx={{ fontSize: 18, mr: 1.5 }} /> Student List
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Assignment sx={{ fontSize: 18, mr: 1.5 }} /> Assignments
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Assessment sx={{ fontSize: 18, mr: 1.5 }} /> Exams
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <EditCalendar sx={{ fontSize: 18, mr: 1.5 }} /> Request Schedule Change
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <CloudUpload sx={{ fontSize: 18, mr: 1.5 }} /> Upload Materials
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <NoteAlt sx={{ fontSize: 18, mr: 1.5 }} /> Class Notes
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Poll sx={{ fontSize: 18, mr: 1.5 }} /> Create Survey
          </MenuItem>
        </Menu>
      </Box>
    </div>
  );
}