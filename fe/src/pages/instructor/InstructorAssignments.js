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
  Avatar,
} from "@mui/material";
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Assignment,
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

} from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import "./style.css";

export default function InstructorAssignments() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dữ liệu mẫu
  const assignments = [
    {
      id: 1,
      title: "React Hooks Challenge",
      type: "assignment",
      class: "WD-2025-A",
      session: "Session 5",
      submitted: 38,
      total: 42,
      deadline: "Nov 30, 2025",
      status: "open",
      autoGraded: false,
      avgScore: 82,
    },
    {
      id: 2,
      title: "Midterm Exam - DSA",
      type: "exam",
      class: "DSA-2025-B",
      session: "Midterm",
      submitted: 35,
      total: 38,
      deadline: "Dec 10, 2025",
      status: "scheduled",
      autoGraded: true,
      avgScore: 88,
    },
    {
      id: 3,
      title: "UI Mockup Submission",
      type: "assignment",
      class: "UX-2025-D",
      session: "Week 3",
      submitted: 28,
      total: 30,
      deadline: "Dec 5, 2025",
      status: "closed",
      autoGraded: false,
      avgScore: 75,
    },
  ];

  const filteredAssignments = assignments
    .filter(item => tabValue === 0 || (tabValue === 1 && item.type === "assignment") || (tabValue === 2 && item.type === "exam"))
    .filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.class.includes(searchQuery)
    );

  const stats = {
    total: assignments.length,
    open: assignments.filter(a => a.status === "open").length,
    grading: assignments.filter(a => a.submitted > 0 && a.status !== "closed").length,
    completed: assignments.filter(a => a.status === "closed").length,
  };

  const chartData = [
    { name: "Submitted", value: assignments.reduce((a, b) => a + b.submitted, 0), color: "#16a34a" },
    { name: "Pending", value: assignments.reduce((a, b) => a + (b.total - b.submitted), 0), color: "#dc2626" },
  ];

  const scoreData = assignments.map(a => ({
    name: a.title.substring(0, 15) + "...",
    score: a.avgScore || 0,
  }));

  const handleMenuOpen = (e, item) => {
    setAnchorEl(e.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  return (
    <div className="instructor-page">
      <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Assignments & Exams</Typography>
              <Typography variant="body2" color="text.secondary">
                Create, manage, and grade student submissions
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
              Create New
            </Button>
          </Box>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Total", value: stats.total, color: "#64748b" },
              { label: "Open", value: stats.open, color: "#16a34a" },
              { label: "Grading", value: stats.grading, color: "#d97706" },
              { label: "Completed", value: stats.completed, color: "#2563eb" },
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
              placeholder="Search by title or class..."
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
            <Tab label={`All (${assignments.length})`} />
            <Tab label={`Assignments (${assignments.filter(a => a.type === "assignment").length})`} />
            <Tab label={`Exams (${assignments.filter(a => a.type === "exam").length})`} />
          </Tabs>
        </Box>

        {/* List */}
        <Grid container spacing={3}>
          {filteredAssignments.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
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
                      icon={item.type === "exam" ? <Assessment /> : <Assignment />}
                      label={item.type === "exam" ? "Exam" : "Assignment"}
                      size="small"
                      color={item.type === "exam" ? "primary" : "secondary"}
                    />
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                    <Tooltip title="Class">
                      <Chip label={item.class} size="small" variant="outlined" />
                    </Tooltip>
                    <Tooltip title="Session">
                      <Chip label={item.session} size="small" variant="outlined" />
                    </Tooltip>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Submissions</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {item.submitted}/{item.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.submitted / item.total) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#e2e8f0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: item.submitted === item.total ? "#16a34a" : "#667eea",
                        },
                      }}
                    />
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={item.status}
                      size="small"
                      color={
                        item.status === "open" ? "success" :
                        item.status === "scheduled" ? "warning" : "default"
                      }
                    />
                    {item.autoGraded && <Chip label="Auto-graded" size="small" color="info" />}
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
                      <Typography variant="caption" color="text.secondary">Deadline</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "13px" }}>
                        {item.deadline}
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

                  {item.avgScore !== undefined && (
                    <Box sx={{ mt: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">Avg Score</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#16a34a" }}>
                        {item.avgScore}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Analytics */}
        {filteredAssignments.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Analytics Overview</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Submission Rate</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label>
                        {chartData.map((entry, i) => (
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
          <MenuItem onClick={handleMenuClose}><Edit sx={{ fontSize: 18, mr: 1.5 }} /> Edit</MenuItem>
          <MenuItem onClick={handleMenuClose}><Grade sx={{ fontSize: 18, mr: 1.5 }} /> Grade Submissions</MenuItem>
          <MenuItem onClick={handleMenuClose}><Feedback sx={{ fontSize: 18, mr: 1.5 }} /> Send Feedback</MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
            <Delete sx={{ fontSize: 18, mr: 1.5 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Create Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Create New Assignment / Exam</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Title" fullWidth placeholder="e.g., React Hooks Challenge" />
              <TextField select label="Type" fullWidth defaultValue="assignment">
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="exam">Exam</MenuItem>
              </TextField>
              <TextField select label="Class" fullWidth>
                <MenuItem value="WD-2025-A">WD-2025-A</MenuItem>
                <MenuItem value="DSA-2025-B">DSA-2025-B</MenuItem>
              </TextField>
              <TextField label="Session" fullWidth placeholder="e.g., Session 5" />
              <TextField label="Deadline" fullWidth type="date" InputLabelProps={{ shrink: true }} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button variant="contained" sx={{ backgroundColor: "#667eea" }}>Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}