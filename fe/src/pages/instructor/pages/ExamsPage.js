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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  LinearProgress,
  Tooltip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Assessment,
  Schedule,
  People,
  CheckCircle,
  HourglassEmpty,
  Edit,
  Delete,
  Visibility,
  Grade,
  Feedback,
  Timer,
  AutoMode,
} from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import "./style.css";

export default function InstructorExams() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dữ liệu mẫu - chỉ Bài thi
  const exams = [
    {
      id: 1,
      title: "Midterm Exam - Web Development",
      class: "WD-2025-A",
      session: "Midterm",
      type: "multiple_choice",
      questions: 40,
      duration: "90 mins",
      submitted: 40,
      total: 42,
      startTime: "Dec 10, 2025 9:00 AM",
      endTime: "Dec 10, 2025 10:30 AM",
      status: "scheduled",
      autoGraded: true,
      avgScore: 85,
    },
    {
      id: 2,
      title: "Final Exam - DSA",
      class: "DSA-2025-B",
      session: "Final",
      type: "mixed",
      questions: 25,
      duration: "120 mins",
      submitted: 0,
      total: 38,
      startTime: "Jan 5, 2026 2:00 PM",
      endTime: "Jan 5, 2026 4:00 PM",
      status: "upcoming",
      autoGraded: false,
      avgScore: null,
    },
    {
      id: 3,
      title: "Quiz 2 - Mobile Dev",
      class: "MOB-2025-C",
      session: "Week 6",
      type: "multiple_choice",
      questions: 15,
      duration: "30 mins",
      submitted: 25,
      total: 25,
      startTime: "Nov 28, 2025 3:00 PM",
      endTime: "Nov 28, 2025 3:30 PM",
      status: "completed",
      autoGraded: true,
      avgScore: 92,
    },
  ];

  const filteredExams = exams
    .filter(exam => {
      if (tabValue === 1) return exam.status === "scheduled";
      if (tabValue === 2) return exam.status === "upcoming";
      if (tabValue === 3) return exam.status === "completed";
      return true;
    })
    .filter(exam =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.class.includes(searchQuery)
    );

  const stats = {
    total: exams.length,
    scheduled: exams.filter(e => e.status === "scheduled").length,
    upcoming: exams.filter(e => e.status === "upcoming").length,
    completed: exams.filter(e => e.status === "completed").length,
  };

  const submissionData = [
    { name: "Submitted", value: exams.reduce((a, b) => a + b.submitted, 0), color: "#16a34a" },
    { name: "Pending", value: exams.reduce((a, b) => a + (b.total - b.submitted), 0), color: "#dc2626" },
  ];

  const scoreData = exams
    .filter(e => e.avgScore !== null)
    .map(e => ({
      name: e.title.substring(0, 12) + "...",
      score: e.avgScore,
    }));

  const handleMenuOpen = (e, exam) => {
    setAnchorEl(e.currentTarget);
    setSelectedExam(exam);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExam(null);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "scheduled": return { label: "Scheduled", color: "#d97706", icon: <Schedule /> };
      case "upcoming": return { label: "Upcoming", color: "#2563eb", icon: <HourglassEmpty /> };
      case "completed": return { label: "Completed", color: "#16a34a", icon: <CheckCircle /> };
      default: return { label: status, color: "#64748b", icon: null };
    }
  };

  return (
    <div className="instructor-page">
      <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Exams</Typography>
              <Typography variant="body2" color="text.secondary">
                Create, schedule, and grade exams
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                backgroundColor: "#667eea",
                textTransform: "none",
                borderRadius: 2,
                "&:hover": { backgroundColor: "#5568d3" },
              }}
            >
              Create Exam
            </Button>
          </Box>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Total", value: stats.total, color: "#64748b" },
              { label: "Scheduled", value: stats.scheduled, color: "#d97706" },
              { label: "Upcoming", value: stats.upcoming, color: "#2563eb" },
              { label: "Completed", value: stats.completed, color: "#16a34a" },
            ].map((stat, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Search & Tabs */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <Search sx={{ color: "#94a3b8", mr: 1 }} />,
              }}
            />
            <Button variant="outlined" startIcon={<FilterList />}>Filter</Button>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
              "& .Mui-selected": { color: "#667eea" },
              "& .MuiTabs-indicator": { backgroundColor: "#667eea" },
            }}
          >
            <Tab label={`All (${exams.length})`} />
            <Tab label={`Scheduled (${stats.scheduled})`} />
            <Tab label={`Upcoming (${stats.upcoming})`} />
            <Tab label={`Completed (${stats.completed})`} />
          </Tabs>
        </Box>

        {/* Exam List */}
        <Grid container spacing={3}>
          {filteredExams.map((exam) => {
            const status = getStatusConfig(exam.status);
            return (
              <Grid item xs={12} sm={6} md={4} key={exam.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(0,0,0,0.1)" },
                  }}
                >
                  <CardContent sx={{ pt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Chip
                        icon={<Assessment />}
                        label="Exam"
                        size="small"
                        color="primary"
                      />
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, exam)}>
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {exam.title}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                      <Chip label={exam.class} size="small" variant="outlined" />
                      <Chip label={exam.session} size="small" variant="outlined" />
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Timer fontSize="small" />
                        <Typography variant="caption">{exam.duration}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <People fontSize="small" />
                        <Typography variant="caption">{exam.questions} questions</Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Submissions</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {exam.submitted}/{exam.total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(exam.submitted / exam.total) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: exam.submitted === exam.total ? "#16a34a" : "#667eea",
                          },
                        }}
                      />
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        icon={status.icon}
                        label={status.label}
                        size="small"
                        sx={{ backgroundColor: `${status.color}20`, color: status.color }}
                      />
                      {exam.autoGraded && (
                        <Chip
                          icon={<AutoMode />}
                          label="Auto-graded"
                          size="small"
                          color="info"
                        />
                      )}
                    </Stack>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pt: 1.5,
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {exam.status === "completed" ? "Completed" : "Start Time"}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
                          {exam.status === "completed" ? exam.endTime : exam.startTime}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Submissions">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Grade">
                          <IconButton size="small" color="secondary">
                            <Grade />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    {exam.avgScore !== null && (
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">Avg Score</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#16a34a" }}>
                          {exam.avgScore}%
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Analytics */}
        {filteredExams.length > 0 && scoreData.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Exam Analytics</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Submission Rate</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={submissionData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                        {submissionData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Average Scores</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 100]} />
                      <RechartsTooltip />
                      <Bar dataKey="score" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
        >
          <MenuItem onClick={handleMenuClose}><Visibility sx={{ fontSize: 18, mr: 1.5 }} /> View Details</MenuItem>
          <MenuItem onClick={handleMenuClose}><Edit sx={{ fontSize: 18, mr: 1.5 }} /> Edit Exam</MenuItem>
          <MenuItem onClick={handleMenuClose}><Grade sx={{ fontSize: 18, mr: 1.5 }} /> Grade Submissions</MenuItem>
          <MenuItem onClick={handleMenuClose}><Feedback sx={{ fontSize: 18, mr: 1.5 }} /> Send Feedback</MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
            <Delete sx={{ fontSize: 18, mr: 1.5 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Create Exam Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Create New Exam</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Exam Title" fullWidth placeholder="e.g., Midterm Exam - Web Dev" />
              <TextField select label="Class" fullWidth>
                <MenuItem value="WD-2025-A">WD-2025-A</MenuItem>
                <MenuItem value="DSA-2025-B">DSA-2025-B</MenuItem>
                <MenuItem value="MOB-2025-C">MOB-2025-C</MenuItem>
              </TextField>
              <TextField select label="Type" fullWidth>
                <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                <MenuItem value="essay">Essay</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </TextField>
              <TextField label="Number of Questions" fullWidth type="number" />
              <TextField label="Duration (minutes)" fullWidth type="number" />
              <TextField label="Start Date & Time" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button variant="contained" sx={{ backgroundColor: "#667eea" }}>Create Exam</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}