import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Search,
  FilterList,
  Sort,
} from "@mui/icons-material";
import { getCoursesApi, getPopularCoursesApi } from "../../apiServices/courseService";
import CourseCard from "./CourseCard";
import PopularCourses from "./PopularCourses";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const coursesPerPage = 9;

  useEffect(() => {
    fetchCourses();
    fetchPopularCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCoursesApi();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularCourses = async () => {
    try {
      const data = await getPopularCoursesApi();
      setPopularCourses(data);
    } catch (error) {
      console.error("Error fetching popular courses:", error);
    }
  };

  // Filter and sort courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.Description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || course.Category === category;
    return matchesSearch && matchesCategory;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.TuitionFee - b.TuitionFee;
      case "price-high":
        return b.TuitionFee - a.TuitionFee;
      case "popular":
        return (b.EnrollmentCount || 0) - (a.EnrollmentCount || 0);
      case "rating":
        return (b.AverageRating || 0) - (a.AverageRating || 0);
      default: // newest
        return b.CourseID - a.CourseID;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);
  const paginatedCourses = sortedCourses.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  );

  const categories = ["all", "Programming", "Design", "Business", "Marketing", "Data Science"];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Typography>Loading...</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 2,
            }}
          >
            Explore Our Courses
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              opacity: 0.9,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Discover the perfect course to advance your career and skills
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 8 }}>
        {/* Popular Courses Section */}
        <PopularCourses courses={popularCourses} />

        {/* Filters and Search */}
        <Card sx={{ mb: 4, p: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                    startAdornment={<FilterList sx={{ color: "text.secondary", mr: 1 }} />}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={<Sort sx={{ color: "text.secondary", mr: 1 }} />}
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
                  label={`${filteredCourses.length} Courses`}
                  color="primary"
                  variant="outlined"
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <Grid container spacing={3}>
          {paginatedCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.CourseID}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {paginatedCourses.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No courses found matching your criteria
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CoursesPage;