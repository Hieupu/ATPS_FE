import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import AppHeader from "../../components/Header/AppHeader";
import CourseMaterials from "./components/CourseMaterials";
import CourseCurriculum from "./components/CourseCurriculum";
import MyClassList from "./components/MyClassList";

import {
  getCourseByIdApi,
  getMyEnrolledCourses,
} from "../../apiServices/courseService";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel" style={{ width: "100%" }}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const MyCourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courseData = await getCourseByIdApi(id);
      setCourse(courseData);

      const enrolledCourses = await getMyEnrolledCourses();
      const list = enrolledCourses?.data || enrolledCourses?.items || [];
      const enrolled = Array.isArray(list)
        ? list.some((c) => c.CourseID === parseInt(id))
        : false;
      setIsEnrolled(enrolled);

      if (!enrolled) {
        setError("Bạn chưa đăng ký khóa học này");
      }
    } catch (err) {
      setError(err.message || "Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !isEnrolled) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchCourseData}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!course) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <AppHeader />

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={0}>
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              borderRight: { md: "1px solid #e0e0e0" },
              minHeight: { md: "80vh" },
              pr: { md: 2 },
            }}
          >
            <Box sx={{ mb: 4, px: 2 }}>
              <Typography
                variant="overline"
                display="block"
                gutterBottom
                sx={{ color: "#0056d2", fontWeight: "bold", letterSpacing: 1 }}
              >
                TỔ CHỨC / TRƯỜNG HỌC
              </Typography>
              <Typography
                variant="h6"
                component="h1"
                sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}
              >
                {course.Title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.85rem" }}
              >
                {course.Description}
              </Typography>
            </Box>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              orientation="vertical"
              TabIndicatorProps={{ sx: { display: "none" } }}
              sx={{
                "& .MuiTab-root": {
                  alignItems: "flex-start",
                  textTransform: "none",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#444",
                  minHeight: "48px",
                  padding: "12px 20px",
                  borderLeft: "4px solid transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "#f5f7f8",
                  },
                  "&.Mui-selected": {
                    color: "#0056d2",
                    fontWeight: 700,
                    borderLeftColor: "#0056d2",
                    bgcolor: "#f5f7f8",
                  },
                },
              }}
            >
              <Tab label="Tài liệu khóa học" />
              <Tab label="Lớp học của tôi" />
              <Tab label="Lộ trình" />
              <Tab label="Điểm số" />
            </Tabs>
          </Grid>

          <Grid item xs={12} md={9} sx={{ pl: { md: 4 } }}>
            <Box sx={{ mb: 2, py: 1, borderBottom: "1px solid #eee" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {tabValue === 0
                  ? "Tài liệu"
                  : tabValue === 1
                  ? "Danh sách lớp"
                  : tabValue === 2
                  ? "Lộ trình học tập"
                  : "Bảng điểm"}
              </Typography>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <CourseMaterials
                courseId={course.CourseID}
                isEnrolled={isEnrolled}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <MyClassList courseId={course.CourseID} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <CourseCurriculum
                courseId={course.CourseID}
                isEnrolled={isEnrolled}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="body1">
                Nội dung bảng điểm sẽ hiển thị tại đây.
              </Typography>
            </TabPanel>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MyCourseDetailPage;
