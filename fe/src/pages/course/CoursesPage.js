import React, { useState, useEffect, memo } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Button,
  Avatar,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  Search,
  People,
  Schedule,
  Star,
  ArrowForward,
} from "@mui/icons-material";
import { searchCoursesApi } from "../../apiServices/courseService";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/Header/AppHeader";

// Array ảnh để random
const courseImages = [
  "https://wp-s3-edilume-test-bucket.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2022/12/31183122/IELTS_new_thumbnail.png",
  "https://top-courses.org/wp-content/uploads/2022/07/IELTS-TEST_Speaking-and-Writing.jpg",
  "https://www.focusedu.org/wp-content/uploads/2021/03/Top-Reasons-Why-IELTS-Coaching-Is-Important.jpg",
];

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/courses/${course.CourseID}`);
  };

  const formatPrice = (price) => {
    // Handle null/undefined/NaN values
    if (price == null || isNaN(price)) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Random ảnh dựa trên CourseID
  const imageUrl = courseImages[course.CourseID % courseImages.length];

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 20px 60px rgba(102, 126, 234, 0.25)",
          "& .course-image": {
            transform: "scale(1.1)",
          },
          "& .view-button": {
            transform: "translateX(8px)",
          },
        },
      }}
    >
      {/* Course Image */}
      <Box sx={{ position: "relative", overflow: "hidden", height: 200 }}>
        <CardMedia
          component="img"
          className="course-image"
          height="200"
          image={imageUrl}
          alt={course.Title}
          sx={{
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <Chip
            label={course.Category || "Programming"}
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.95)",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
            }}
          />
        </Box>
      </Box>

      <CardContent
        sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}
      >
        {/* Course Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            height: "56px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.4,
            color: "text.primary",
          }}
        >
          {course.Title}
        </Typography>

        {/* Course Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={course.InstructorAvatar}
            sx={{
              width: 36,
              height: 36,
              mr: 1.5,
              border: "2px solid",
              borderColor: "primary.light",
            }}
          >
            {course.InstructorName?.charAt(0)}
          </Avatar>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {course.InstructorName}
          </Typography>
        </Box>

        {/* Course Stats */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <People sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {course.EnrollmentCount || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Schedule sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {course.Duration}h
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Star sx={{ fontSize: 18, color: "warning.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {course.AverageRating ? course.AverageRating.toFixed(1) : "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Price and Action */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {formatPrice(course.TuitionFee)}
          </Typography>
          <Button
            className="view-button"
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleViewDetails}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              transition: "transform 0.3s ease",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
            }}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const coursesPerPage = 9;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { items, total: t } = await searchCoursesApi({
          search: debouncedSearch,
          sort: sortBy,
          page,
          pageSize: coursesPerPage,
        });
        setCourses(items || []);
        setTotal(t || 0);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedSearch, sortBy, page]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / coursesPerPage));
  const paginatedCourses = courses;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: 400, borderRadius: 3 }}>
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Loading...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 10,
          mb: 6,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              textAlign: "center",
              mb: 2,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Explore Our Courses
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              opacity: 0.95,
              maxWidth: 700,
              mx: "auto",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Discover the perfect course to advance your career and skills with
            expert instructors
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 8 }}>
        {/* Filters and Search */}
        <Paper
          elevation={0}
          sx={{
            mb: 5,
            p: 4,
            borderRadius: 4,
            background: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "primary.main" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Chip
                label={`${total} Courses`}
                sx={{
                  width: "100%",
                  height: 48,
                  fontSize: "1rem",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Courses Grid */}
        <Grid container spacing={4}>
          {paginatedCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.CourseID}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {paginatedCourses.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              No courses found matching your criteria
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or search terms
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              size="large"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 600,
                  fontSize: "1rem",
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default memo(CoursesPage);
