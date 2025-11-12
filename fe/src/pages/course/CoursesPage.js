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
  Button,
  InputAdornment,
  Paper,
  Skeleton,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { searchCoursesApi } from "../../apiServices/courseService";
import AppHeader from "../../components/Header/AppHeader";
import CourseCard from "./CourseCard";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const coursesPerPage = 9;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { items, total: t } = await searchCoursesApi({
          search: debouncedSearch,
          category: category,
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
  }, [debouncedSearch, category, sortBy, page]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / coursesPerPage));

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategory("");
    setSortBy("newest");
    setPage(1);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
              <Box sx={{ pt: 2 }}>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={20} />
                <Skeleton variant="text" height={20} width="60%" />
              </Box>
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
            <Grid item xs={12} md={3}>
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
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={category}
                  label="Level"
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="BEGINNER">Beginner</MenuItem>
                  <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                  <MenuItem value="ADVANCED">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
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
            
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ borderRadius: 2, height: 48 }}
                fullWidth
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Courses Grid */}
        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.CourseID}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {courses.length === 0 && (
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
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={handleResetFilters}
            >
              Reset All Filters
            </Button>
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