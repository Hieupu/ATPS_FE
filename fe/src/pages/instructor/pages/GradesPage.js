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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  LinearProgress,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search,
  FilterList,
  MoreVert,
  Download,
  Edit,
  Send,
  Grade,
  Assessment,
  Assignment,
  TrendingUp,
  People,
  CheckCircle,     
  Visibility,
} from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "./style.css";

export default function InstructorGrades() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Dữ liệu mẫu
  const classes = [
    { id: "all", name: "All Classes" },
    { id: "WD-2025-A", name: "WD-2025-A - Web Dev" },
    { id: "DSA-2025-B", name: "DSA-2025-B - DSA" },
    { id: "MOB-2025-C", name: "MOB-2025-C - Mobile" },
  ];

  const students = [
    {
      id: 1,
      name: "Nguyen Van A",
      avatar: "NA",
      class: "WD-2025-A",
      assignments: { total: 5, submitted: 5, avg: 88 },
      exams: { total: 2, submitted: 2, avg: 85 },
      finalGrade: 87,
      status: "active",
    },
    {
      id: 2,
      name: "Tran Thi B",
      avatar: "TB",
      class: "WD-2025-A",
      assignments: { total: 5, submitted: 5, avg: 92 },
      exams: { total: 2, submitted: 2, avg: 90 },
      finalGrade: 91,
      status: "active",
    },
    {
      id: 3,
      name: "Le Van C",
      avatar: "LC",
      class: "DSA-2025-B",
      assignments: { total: 4, submitted: 3, avg: 75 },
      exams: { total: 1, submitted: 1, avg: 70 },
      finalGrade: 73,
      status: "warning",
    },
    {
      id: 4,
      name: "Pham Thi D",
      avatar: "PD",
      class: "MOB-2025-C",
      assignments: { total: 3, submitted: 3, avg: 95 },
      exams: { total: 1, submitted: 1, avg: 98 },
      finalGrade: 96,
      status: "excellent",
    },
  ];

  const gradeDistribution = [
    { range: "90-100", count: 1, color: "#16a34a" },
    { range: "80-89", count: 1, color: "#22c55e" },
    { range: "70-79", count: 1, color: "#f59e0b" },
    { range: "<70", count: 1, color: "#dc2626" },
  ];

  const filteredStudents = students
    .filter(s => selectedClass === "all" || s.class === selectedClass)
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    totalStudents: filteredStudents.length,
    avgGrade: Math.round(filteredStudents.reduce((a, b) => a + b.finalGrade, 0) / filteredStudents.length) || 0,
    passed: filteredStudents.filter(s => s.finalGrade >= 50).length,
    atRisk: filteredStudents.filter(s => s.finalGrade < 70).length,
  };

  const handleEdit = (studentId, type) => {
    setEditingCell({ studentId, type });
    const student = students.find(s => s.id === studentId);
    setEditValue(type === "assignment" ? student.assignments.avg : student.exams.avg);
  };

  const handleSave = () => {
    // Save logic here
    setEditingCell(null);
    setEditValue("");
  };

  return (
    <div className="instructor-page">
      <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Grades</Typography>
              <Typography variant="body2" color="text.secondary">
                View, edit, and export student grades
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{ textTransform: "none" }}
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{ textTransform: "none" }}
              >
                Export PDF
              </Button>
            </Stack>
          </Box>

          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Total Students", value: stats.totalStudents, icon: <People />, color: "#64748b" },
              { label: "Avg Grade", value: `${stats.avgGrade}%`, icon: <Grade />, color: "#667eea" },
              { label: "Passed", value: stats.passed, icon: <CheckCircle color="success" />, color: "#16a34a" },
              { label: "At Risk", value: stats.atRisk, icon: <TrendingUp color="error" />, color: "#dc2626" },
            ].map((stat, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    {stat.icon}
                    <Box>
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} label="Class">
                {classes.map(cls => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search students..."
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
            <Tab label="Gradebook" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      <Assignment fontSize="small" /> Assignments
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      <Assessment fontSize="small" /> Exams
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Final Grade</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar sx={{ bgcolor: "#667eea", fontSize: 14, width: 36, height: 36 }}>
                            {student.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.class}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {editingCell?.studentId === student.id && editingCell?.type === "assignment" ? (
                          <TextField
                            size="small"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyPress={(e) => e.key === "Enter" && handleSave()}
                            sx={{ width: 60 }}
                            inputProps={{ style: { textAlign: "center" } }}
                          />
                        ) : (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {student.assignments.avg}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.assignments.submitted}/{student.assignments.total}
                            </Typography>
                            <IconButton size="small" onClick={() => handleEdit(student.id, "assignment")}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {editingCell?.studentId === student.id && editingCell?.type === "exam" ? (
                          <TextField
                            size="small"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyPress={(e) => e.key === "Enter" && handleSave()}
                            sx={{ width: 60 }}
                            inputProps={{ style: { textAlign: "center" } }}
                          />
                        ) : (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {student.exams.avg}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.exams.submitted}/{student.exams.total}
                            </Typography>
                            <IconButton size="small" onClick={() => handleEdit(student.id, "exam")}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${student.finalGrade}%`}
                          size="small"
                          color={
                            student.finalGrade >= 90 ? "success" :
                            student.finalGrade >= 70 ? "primary" :
                            student.finalGrade >= 50 ? "warning" : "error"
                          }
                          sx={{ fontWeight: 600, minWidth: 60 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Feedback">
                            <IconButton size="small" color="primary">
                              <Send fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More">
                            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Grade Distribution</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#667eea">
                      {gradeDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Pass/Fail Rate</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Passed", value: stats.passed, color: "#16a34a" },
                        { name: "Failed", value: stats.totalStudents - stats.passed, color: "#dc2626" },
                      ]}
                      cx="50%" cy="50%" outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[{}, {}].map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#16a34a" : "#dc2626"} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
        >
          <MenuItem><Visibility sx={{ fontSize: 18, mr: 1.5 }} /> View Progress</MenuItem>
          <MenuItem><Grade sx={{ fontSize: 18, mr: 1.5 }} /> Edit All Grades</MenuItem>
          <MenuItem><Send sx={{ fontSize: 18, mr: 1.5 }} /> Send Report</MenuItem>
        </Menu>
      </Box>
    </div>
  );
}