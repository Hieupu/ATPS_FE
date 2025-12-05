import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Pagination,
  Chip,
  Avatar,
  Fade,
} from "@mui/material";
import {
  AccessTime,
  Person,
  Search,
  ArrowForward,
  MenuBookRounded,
  RocketLaunchRounded,
  School,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getMyEnrolledCourses } from "../../apiServices/courseService";
import { useAuth } from "../../contexts/AuthContext";
import AppHeader from "../../components/Header/AppHeader";

const courseImages = [
  "https://wp-s3-edilume-test-bucket.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2022/12/31183122/IELTS_new_thumbnail.png",
  "https://top-courses.org/wp-content/uploads/2022/07/IELTS-TEST_Speaking-and-Writing.jpg",
  "https://www.focusedu.org/wp-content/uploads/2021/03/Top-Reasons-Why-IELTS-Coaching-Is-Important.jpg",
];

const MyCourseCard = ({ course }) => {
  const navigate = useNavigate();
  const imageUrl = course.Image || courseImages[course.CourseID % courseImages.length];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: 5,
        overflow: "hidden",
        position: "relative",
        border: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,249,255,0.9) 100%)",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 25px 60px rgba(99,102,241,0.3)",
          borderColor: "rgba(99,102,241,0.4)",
          "& .course-image": {
            transform: "scale(1.05)",
          },
          "& .view-button": {
            background: "linear-gradient(135deg, #4c51bf 0%, #6d28d9 100%)",
          },
        },
      }}
      onClick={() => navigate(`/my-courses/${course.CourseID}`)}
    >
      {/* Course Image */}
      <Box sx={{ position: "relative", overflow: "hidden", height: 210 }}>
        <CardMedia
          component="img"
          className="course-image"
          image={imageUrl}
          alt={course.Title}
          sx={{
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
        />
        <Chip
          label="Đã đăng ký"
          size="small"
          sx={{
            position: "absolute",
            top: 18,
            left: 18,
            bgcolor: "rgba(46, 125, 50, 0.9)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            borderRadius: 999,
            px: 2,
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
          }}
        />
        {course.LastEnrollmentDate && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              bgcolor: "rgba(0,0,0,0.7)",
              color: "white",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              📅 {formatDate(course.LastEnrollmentDate)}
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Course Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            height: "56px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.35,
            color: "text.primary",
            fontFamily: "'Poppins', 'Segoe UI', sans-serif",
          }}
        >
          {course.Title}
        </Typography>

        {/* Course Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            height: "42px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.5,
          }}
        >
          {course.Description}
        </Typography>

        {/* Instructor Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            bgcolor: "#f4f6ff",
            borderRadius: 3,
            border: "1px solid rgba(99,102,241,0.08)",
          }}
        >
          <Avatar
            src={course.InstructorAvatar}
            sx={{
              width: 40,
              height: 40,
              border: "2px solid",
              borderColor: "primary.light",
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.25)",
            }}
          >
            {course.InstructorName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 700, 
                color: "text.primary",
                mb: 0.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {course.InstructorName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ 
                color: "text.secondary",
                display: "block",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {course.InstructorMajor || "Giảng viên"}
            </Typography>
          </Box>
        </Box>

        {/* Course Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            gap: 1,
            pb: 2.5,
            borderBottom: "2px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <MenuBookRounded sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {course.UnitCount || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.65rem" }}
            >
              Chương
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <AccessTime sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {course.Duration || 0}h
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.65rem" }}
            >
              Thời lượng
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <School sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {course.TotalClasses || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.65rem" }}
            >
              Lớp học
            </Typography>
          </Box>
        </Box>

        {/* Action Button */}
        <Button
          className="view-button"
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/my-courses/${course.CourseID}`);
          }}
          fullWidth
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            transition: "all 0.3s ease",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
            },
          }}
        >
          Tiếp tục học
        </Button>
      </CardContent>
    </Card>
  );
};

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const coursesPerPage = 6;
  const navigate = useNavigate();
  const { isLearner } = useAuth();
  const courseContainerRef = useRef(null);

  useEffect(() => {
    if (!isLearner) {
      setError("Chỉ người học mới có thể truy cập trang này");
      setLoading(false);
      return;
    }

    fetchEnrolledCourses();
  }, [isLearner]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await getMyEnrolledCourses();
      setCourses(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    const term = searchTerm.toLowerCase();
    return courses.filter(
      (course) =>
        course.Title?.toLowerCase().includes(term) ||
        course.Description?.toLowerCase().includes(term) ||
        course.InstructorName?.toLowerCase().includes(term)
    );
  }, [courses, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / coursesPerPage));
  const paginatedCourses = useMemo(() => {
    const startIndex = (page - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredCourses, page, coursesPerPage]);

  const handleResetSearch = useCallback(() => {
    setSearchTerm("");
    setPage(1);
  }, []);

  if (!isLearner) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            Bạn không có quyền truy cập trang này. Chỉ người học mới có thể xem khóa học đã đăng ký.
          </Alert>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: "text.secondary" }}>
            Đang tải khóa học của bạn...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />

      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
          color: "white",
          py: { xs: 3, md: 4 },
          mb: 5,
          position: "relative",
          overflow: "hidden",
          borderBottomLeftRadius: { xs: 40, md: 60 },
          borderBottomRightRadius: { xs: 40, md: 60 },
          boxShadow: "0 50px 100px rgba(102, 126, 234, 0.4)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            background:
              "radial-gradient(circle at 15% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)",
            zIndex: 1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            right: 0,
            background:
              "radial-gradient(circle at 85% 70%, rgba(255,255,255,0.22) 0%, transparent 60%)",
            zIndex: 1,
          },
        }}
      >
        {/* Decorative Background Icons */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            opacity: 0.12,
            zIndex: 0,
          }}
        >
          <Box sx={{ position: "absolute", fontSize: "4rem", top: "15%", left: "8%", transform: "rotate(-15deg)" }}>
            📚
          </Box>
          <Box sx={{ position: "absolute", fontSize: "3.5rem", top: "65%", left: "12%", transform: "rotate(25deg)" }}>
            ✅
          </Box>
          <Box sx={{ position: "absolute", fontSize: "3rem", top: "25%", right: "10%", transform: "rotate(15deg)" }}>
            🎯
          </Box>
          <Box sx={{ position: "absolute", fontSize: "3.5rem", top: "70%", right: "15%", transform: "rotate(-20deg)" }}>
            📖
          </Box>
          <Box sx={{ position: "absolute", fontSize: "4rem", top: "45%", left: "5%", transform: "rotate(10deg)" }}>
            💼
          </Box>
          <Box sx={{ position: "absolute", fontSize: "3.5rem", top: "50%", right: "8%", transform: "rotate(-12deg)" }}>
            🏆
          </Box>
        </Box>

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.18))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 35px 90px rgba(0,0,0,0.35), 0 0 80px rgba(255,255,255,0.35), inset 0 1px 1px rgba(255,255,255,0.5)",
              backdropFilter: "blur(25px)",
              fontSize: "2.5rem",
              border: "3px solid rgba(255,255,255,0.35)",
            }}
          >
            📚
          </Box> */}

          {/* Title */}
          <Typography
            component="h1"
            sx={{
              fontFamily: "'Poppins', 'Inter', sans-serif",
              fontWeight: 900,
              textAlign: "center",
              mb: 0.5,
              letterSpacing: "-0.5px",
              fontSize: { xs: "1.6rem", sm: "2rem", md: "2.5rem" },
              textShadow: "0 20px 40px rgba(0,0,0,0.3)",
              lineHeight: 1.2,
            }}
          >
            Khóa Học Của Tôi
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 8 }} ref={courseContainerRef}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search Bar */}
        {courses.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 5,
            }}
          >
            <Box
              sx={{
                maxWidth: 900,
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                bgcolor: "white",
                borderRadius: 999,
                boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
                border: "2px solid rgba(124,58,237,0.15)",
              }}
            >
              <TextField
                fullWidth
                placeholder="Tìm kiếm khóa học của bạn..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                variant="standard"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "primary.main", fontSize: 28, ml: 2 }} />
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    py: 1.5,
                    pl: 1,
                  },
                }}
              />
              <Chip
                label={`${filteredCourses.length} khóa học`}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1rem",
                  height: 44,
                  px: 2,
                  borderRadius: 999,
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.35)",
                }}
              />
              {searchTerm && (
                <Button
                  variant="text"
                  onClick={handleResetSearch}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    color: "error.main",
                    minWidth: "auto",
                    px: 2,
                  }}
                >
                  Xóa
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {courses.length === 0 && !loading ? (
          <Fade in={true} timeout={500}>
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                px: 2,
              }}
            >
              <Box sx={{ fontSize: "6rem", mb: 2 }}>📚</Box>
              <Typography
                variant="h5"
                color="text.primary"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Bạn chưa đăng ký khóa học nào
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Hãy khám phá và đăng ký các khóa học phù hợp với bạn
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/courses")}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                }}
              >
                Khám phá khóa học
              </Button>
            </Box>
          </Fade>
        ) : null}

        {/* Filtered Empty State */}
        {courses.length > 0 && filteredCourses.length === 0 && (
          <Fade in={true} timeout={500}>
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                px: 2,
              }}
            >
              <Box sx={{ fontSize: "5rem", mb: 2 }}>🔍</Box>
              <Typography
                variant="h5"
                color="text.primary"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Không tìm thấy khóa học phù hợp
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Vui lòng thử từ khóa tìm kiếm khác
              </Typography>
              <Button
                variant="contained"
                onClick={handleResetSearch}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                }}
              >
                Xóa tìm kiếm
              </Button>
            </Box>
          </Fade>
        )}

        {/* Courses Grid */}
        {paginatedCourses.length > 0 && (
          <Fade in={!loading} timeout={500}>
            <Grid container spacing={4}>
              {paginatedCourses.map((course, index) => (
                <Grid item xs={12} sm={6} md={4} key={course.CourseID}>
                  <Fade in={true} timeout={300 + index * 50}>
                    <Box>
                      <MyCourseCard course={course} />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Fade>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Fade in={true} timeout={500}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 8,
                gap: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Trang {page} / {totalPages}
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  px: { xs: 1.5, md: 2.5 },
                  py: 1.5,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  boxShadow: "0 15px 35px rgba(15,23,42,0.12)",
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, value) => {
                    setPage(value);
                    if (courseContainerRef.current) {
                      courseContainerRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  shape="rounded"
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      borderRadius: 999,
                      border: "1px solid rgba(99,102,241,0.15)",
                      mx: 0.3,
                      minWidth: 42,
                      minHeight: 42,
                      boxShadow: "0 6px 12px rgba(15,23,42,0.08)",
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                      background: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)",
                      color: "white",
                      border: "none",
                      boxShadow: "0 12px 25px rgba(109,40,217,0.35)",
                    },
                    "& .MuiPaginationItem-root:not(.Mui-selected):hover": {
                      background: "rgba(99,102,241,0.12)",
                    },
                    "& .MuiPaginationItem-icon": {
                      fontSize: "1.4rem",
                    },
                    "& .MuiPaginationItem-ellipsis": {
                      color: "text.secondary",
                      fontWeight: 700,
                    },
                  }}
                />
              </Paper>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default MyCourses;
