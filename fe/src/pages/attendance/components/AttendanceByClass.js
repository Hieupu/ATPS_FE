import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { getAttendanceByClassApi } from "../../../apiServices/attendanceService";

const AttendanceByClass = ({ learnerId }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const data = await getAttendanceByClassApi(learnerId);
        setClasses(data.classes || []);
      } catch (error) {
        console.error("Error loading classes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (learnerId) {
      loadClasses();
    }
  }, [learnerId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Alert severity="info">Chưa có lớp học nào.</Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {classes.map((cls) => (
        <Grid item xs={12} md={6} key={cls.ClassID}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {cls.CourseImage && (
                  <Avatar
                    src={cls.CourseImage}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {cls.ClassName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cls.CourseTitle}
                  </Typography>
                </Box>
                <Chip
                  label={cls.grade}
                  color={
                    cls.grade === "A"
                      ? "success"
                      : cls.grade === "B"
                      ? "primary"
                      : cls.grade === "C"
                      ? "warning"
                      : "error"
                  }
                  sx={{ fontWeight: 700, fontSize: "1rem" }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ tham gia
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {cls.AttendanceRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={cls.AttendanceRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        cls.AttendanceRate >= 80
                          ? "success.main"
                          : cls.AttendanceRate >= 60
                          ? "warning.main"
                          : "error.main",
                    },
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="success.main">
                      {cls.PresentCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Có mặt
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="warning.main">
                      {cls.LateCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đi muộn
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="error.main">
                      {cls.AbsentCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Vắng mặt
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Tổng số buổi: {cls.TotalSessions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cls.FirstSession && new Date(cls.FirstSession).toLocaleDateString("vi-VN")} -{" "}
                  {cls.LastSession && new Date(cls.LastSession).toLocaleDateString("vi-VN")}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AttendanceByClass;