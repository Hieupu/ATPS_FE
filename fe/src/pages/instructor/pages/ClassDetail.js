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
  TextField,
  Stack,
  Divider,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Fab,
  CircularProgress,
} from "@mui/material";
import {
  People,
  Schedule,
  CheckCircle,
  HourglassEmpty,
  Assignment,
  Assessment,
  CloudUpload,
  NoteAlt,
  Poll,
  EditCalendar,
  Download,
  Add,
  Search,
  FilterList,
  MoreVert,
  VideoCall,
  Description,
  InsertDriveFile,
  PictureAsPdf,
  VolumeUp,
} from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "./style.css";

export default function ClassDetail() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [searchStudent, setSearchStudent] = useState("");

  // Dữ liệu lớp học (giả lập)
  const classInfo = {
    id: 3,
    courseName: "Mobile App Development",
    classCode: "MOB-2025-C",
    students: 25,
    totalStudents: 30,
    status: "upcoming",
    nextSession: "Dec 2, 3:00 PM",
    schedule: "Mon, Wed",
    attendanceRate: 0,
    completionRate: 45,
    pendingAssignments: 0,
  };

  const students = [
    { id: 1, name: "Nguyen Van A", avatar: "NA", progress: 78, attendance: 14, totalSessions: 16, status: "active" },
    { id: 2, name: "Tran Thi B", avatar: "TB", progress: 92, attendance: 16, totalSessions: 16, status: "active" },
    { id: 3, name: "Le Van C", avatar: "LC", progress: 45, attendance: 10, totalSessions: 16, status: "warning" },
    { id: 4, name: "Pham Thi D", avatar: "PD", progress: 100, attendance: 16, totalSessions: 16, status: "completed" },
    { id: 5, name: "Hoang Van E", avatar: "HE", progress: 65, attendance: 12, totalSessions: 16, status: "active" },
  ];

  const assignments = [
    { id: 1, title: "UI Mockup Design", type: "assignment", submitted: 18, total: 25, deadline: "Dec 1" },
    { id: 2, title: "Midterm Exam", type: "exam", submitted: 0, total: 25, deadline: "Dec 15" },
  ];

  const materials = [
    { id: 1, name: "Week 1 - Intro to React Native.pdf", type: "pdf", size: "2.4 MB" },
    { id: 2, name: "Lecture 2 - Navigation.mp4", type: "video", size: "145 MB" },
    { id: 3, name: "Assignment Guide.docx", type: "doc", size: "120 KB" },
  ];

  const notes = [
    { id: 1, date: "2025-11-20", content: "Học viên cần hoàn thành API integration trước buổi sau." },
    { id: 2, date: "2025-11-18", content: "Ôn lại State Management với Redux." },
  ];

  // Biểu đồ
  const attendanceData = [
    { name: "Present", value: 85, color: "#16a34a" },
    { name: "Absent", value: 15, color: "#dc2626" },
  ];

  const progressData = [
    { name: "Week 1", completed: 25 },
    { name: "Week 2", completed: 22 },
    { name: "Week 3", completed: 20 },
    { name: "Week 4", completed: 18 },
  ];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSaveNote = () => {
    // Save to cloud (mock)
    console.log("Note saved:", noteContent);
    setOpenNoteDialog(false);
    setNoteContent("");
  };

  return (
    <div className="instructor-page">
      <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {classInfo.courseName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {classInfo.classCode} • {classInfo.students}/{classInfo.totalStudents} students
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<EditCalendar />}
                sx={{ textTransform: "none" }}
              >
                Request Schedule Change
              </Button>
              {classInfo.status === "ongoing" && (
                <Button
                  variant="contained"
                  startIcon={<VideoCall />}
                  sx={{
                    backgroundColor: "#16a34a",
                    "&:hover": { backgroundColor: "#15803d" },
                    textTransform: "none",
                  }}
                >
                  Join Class
                </Button>
              )}
            </Stack>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Next Session</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{classInfo.nextSession}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Attendance Rate</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#16a34a" }}>
                    {classInfo.attendanceRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Completion</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#667eea" }}>
                    {classInfo.completionRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Pending Reviews</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#d97706" }}>
                    {classInfo.pendingAssignments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
              "& .Mui-selected": { color: "#667eea" },
              "& .MuiTabs-indicator": { backgroundColor: "#667eea" },
            }}
          >
            <Tab label="Students" />
            <Tab label="Assignments & Exams" />
            <Tab label="Materials" />
            <Tab label="Notes" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                size="small"
                placeholder="Search students..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: <Search sx={{ color: "#94a3b8", mr: 1 }} />,
                }}
              />
              <Button variant="outlined" startIcon={<FilterList />}>Filter</Button>
            </Box>

            <Grid container spacing={2}>
              {filteredStudents.map((student) => (
                <Grid item xs={12} key={student.id}>
                  <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: "#fff" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#667eea", fontWeight: 600 }}>{student.avatar}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            Attendance: {student.attendance}/{student.totalSessions}
                          </Typography>
                          <Chip
                            label={student.status}
                            size="small"
                            color={student.status === "active" ? "success" : student.status === "warning" ? "warning" : "primary"}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ width: 150 }}>
                        <LinearProgress variant="determinate" value={student.progress} sx={{ height: 6, borderRadius: 3 }} />
                        <Typography variant="caption" sx={{ mt: 0.5, display: "block", textAlign: "right" }}>
                          {student.progress}%
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            {assignments.map((item) => (
              <Grid item xs={12} sm={6} key={item.id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Chip
                        icon={item.type === "exam" ? <Assessment /> : <Assignment />}
                        label={item.type === "exam" ? "Exam" : "Assignment"}
                        size="small"
                        color={item.type === "exam" ? "primary" : "secondary"}
                      />
                      <Typography variant="caption" color="error">{item.deadline}</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.submitted}/{item.total} submitted
                    </Typography>
                    <Button variant="outlined" size="small" fullWidth>
                      View Submissions
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tabValue === 2 && (
          <Box>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              sx={{ mb: 3, backgroundColor: "#667eea" }}
            >
              Upload Material
            </Button>
            <List>
              {materials.map((file) => (
                <ListItem key={file.id} secondaryAction={<IconButton><Download /></IconButton>}>
                  <ListItemAvatar>
                    {file.type === "pdf" ? <PictureAsPdf color="error" /> :
                     file.type === "video" ? <VideoCall color="primary" /> :
                     file.type === "doc" ? <Description color="info" /> :
                     <InsertDriveFile />}
                  </ListItemAvatar>
                  <ListItemText
                    primary={file.name}
                    secondary={file.size}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Class Notes</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenNoteDialog(true)}
                sx={{ backgroundColor: "#667eea" }}
              >
                New Note
              </Button>
            </Box>
            {notes.map((note) => (
              <Paper key={note.id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">{note.date}</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>{note.content}</Typography>
              </Paper>
            ))}
          </Box>
        )}

        {tabValue === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Attendance Overview</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%" cy="50%" outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Weekly Progress</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="completed" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Class Note</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="Write your teaching notes here... (saved to cloud)"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNote} sx={{ backgroundColor: "#667eea" }}>
            Save to Cloud
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24, backgroundColor: "#667eea" }}
        onClick={() => setOpenNoteDialog(true)}
      >
        <NoteAlt />
      </Fab>
    </div>
  );
}