import React, { useState, useEffect, memo, useMemo, useCallback, useRef } from "react";
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
  Fade,
} from "@mui/material";
import { Search, TuneRounded, RocketLaunchRounded } from "@mui/icons-material";
import { searchCoursesApi } from "../../apiServices/courseService";
import AppHeader from "../../components/Header/AppHeader";
import CourseCard from "./CourseCard";

// Level mapping từ tiếng Anh sang tiếng Việt
const LEVEL_LABELS = {
  BEGINNER: "Dành cho người mới",
  INTERMEDIATE: "Trình độ trung cấp",
  ADVANCED: "Trình độ nâng cao",
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const coursesPerPage = 9;
  
  // Ref to scroll to courses container
  const courseContainerRef = useRef(null);

  // Fetch courses with improved UX (avoid screen flickering)
  useEffect(() => {
    const fetch = async () => {
      try {
        const { items, total: t } = await searchCoursesApi({
          search: debouncedSearch,
          category: level,
          sort: sortBy,
          page,
          pageSize: coursesPerPage,
        });
        
        setCourses(items || []);
        setTotal(t || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setTotal(0);
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedSearch, level, sortBy, page]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / coursesPerPage));

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setLevel("");
    setSortBy("newest");
    setPage(1);
  }, []);
  
  // Memoized active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (level) count++;
    if (sortBy !== "newest") count++;
    return count;
  }, [searchTerm, level, sortBy]);

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
      
      {/* Hero Section - Enhanced Premium Design */}
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
          // Gradient overlay với light glow (tăng độ sáng)
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
          {/* Icon Search */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "4rem",
              top: "15%",
              left: "8%",
              transform: "rotate(-15deg)",
            }}
          >
            🔍
          </Box>
          {/* Icon Chat */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "3.5rem",
              top: "65%",
              left: "12%",
              transform: "rotate(25deg)",
            }}
          >
            💬
          </Box>
          {/* Icon Mail */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "3rem",
              top: "25%",
              right: "10%",
              transform: "rotate(15deg)",
            }}
          >
            ✉️
          </Box>
          {/* Icon Pen */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "3.5rem",
              top: "70%",
              right: "15%",
              transform: "rotate(-20deg)",
            }}
          >
            ✏️
          </Box>
          {/* Icon Book */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "4rem",
              top: "45%",
              left: "5%",
              transform: "rotate(10deg)",
            }}
          >
            📘
          </Box>
          {/* Icon Trophy */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "3.5rem",
              top: "50%",
              right: "8%",
              transform: "rotate(-12deg)",
            }}
          >
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
          {/* Hero Icon - Enlarged */}
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "22px",
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
            🎓
          </Box>

          {/* Title with better typography */}
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
            Khám Phá Khóa Học Đỉnh Cao
          </Typography>

          {/* Subtitle - lighter font weight */}
          {/* <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              opacity: 0.92,
              maxWidth: 700,
              mx: "auto",
              fontWeight: 300,
              lineHeight: 1.6,
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              letterSpacing: "0.2px",
              mb: 1,
            }}
          >
            Cập nhật lộ trình học tập mới nhất, học cùng giảng viên chất lượng và đạt mục tiêu IELTS nhanh hơn.
          </Typography> */}

          {/* CTA Button */}
          {/* <Button
            variant="contained"
            size="medium"
            endIcon={<RocketLaunchRounded />}
            onClick={() => {
              courseContainerRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            sx={{
              mt: 1.5,
              px: 4,
              py: 1.5,
              borderRadius: 999,
              fontSize: "1rem",
              fontWeight: 700,
              textTransform: "none",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              boxShadow: "0 20px 50px rgba(79, 172, 254, 0.4)",
              border: "2px solid rgba(255,255,255,0.3)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 30px 60px rgba(79, 172, 254, 0.5)",
                background: "linear-gradient(135deg, #3d8bd9 0%, #00d4e6 100%)",
              },
            }}
          >
            Khám Phá Ngay
          </Button> */}
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 8 }} ref={courseContainerRef}>
        {/* Filters and Search */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            background: "rgba(255,255,255,0.9)",
            boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
            border: "1px solid rgba(124,58,237,0.15)",
            backdropFilter: "blur(6px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TuneRounded sx={{ color: "primary.main", mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontFamily: "'Poppins', 'Segoe UI', sans-serif",
              }}
            >
              Bộ Lọc & Tìm Kiếm
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} bộ lọc`}
                size="small"
                color="primary"
                sx={{ ml: 2, fontWeight: 600, borderRadius: 1.5 }}
              />
            )}
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "primary.main" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    bgcolor: "#f5f6ff",
                    "&:hover": {
                      bgcolor: "#eef0ff",
                    },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      boxShadow: "0 0 0 4px rgba(124,58,237,0.12)",
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trình độ</InputLabel>
                <Select
                  value={level}
                  label="Trình độ"
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setPage(1);
                  }}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#f5f6ff",
                    "&:hover": {
                      bgcolor: "#eef0ff",
                    },
                    "& .MuiSelect-select": {
                      borderRadius: 999,
                      py: 1.2,
                    },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      boxShadow: "0 0 0 4px rgba(124,58,237,0.12)",
                    },
                  }}
                >
                  <MenuItem value="">Tất cả trình độ</MenuItem>
                  <MenuItem value="BEGINNER">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {LEVEL_LABELS.BEGINNER}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Beginner
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="INTERMEDIATE">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {LEVEL_LABELS.INTERMEDIATE}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Intermediate
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="ADVANCED">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {LEVEL_LABELS.ADVANCED}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Advanced
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortBy}
                  label="Sắp xếp"
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "#f5f6ff",
                    "&:hover": {
                      bgcolor: "#eef0ff",
                    },
                    "& .MuiSelect-select": {
                      borderRadius: 999,
                      py: 1.2,
                    },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      boxShadow: "0 0 0 4px rgba(124,58,237,0.12)",
                    },
                  }}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="popular">Phổ biến nhất</MenuItem>
                  <MenuItem value="rating">Đánh giá cao nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    textAlign: "center",
                    background: "linear-gradient(120deg, #6366f1, #8b5cf6)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "0 10px 30px rgba(99,102,241,0.35)",
                  }}
                >
                  {total} khóa học
                </Paper>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleResetFilters}
                    sx={{
                      textTransform: "none",
                      color: "error.main",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Courses Grid with Fade transition */}
        <Box ref={courseContainerRef}>
          <Fade in={!loading} timeout={500}>
            <Grid container spacing={4}>
              {courses.map((course, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={course.CourseID}
                >
                  <Fade in={true} timeout={300 + index * 50}>
                    <Box>
                      <CourseCard course={course} />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Fade>
        </Box>

        {/* No Results */}
        {!loading && courses.length === 0 && (
          <Fade in={true} timeout={500}>
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                px: 2,
              }}
            >
              <Box
                sx={{
                  fontSize: "5rem",
                  mb: 2,
                }}
              >
                📚
              </Box>
              <Typography
                variant="h5"
                color="text.primary"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Không tìm thấy khóa học phù hợp
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </Typography>
              <Button
                variant="contained"
                onClick={handleResetFilters}
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
                Đặt lại bộ lọc
              </Button>
            </Box>
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
                    // Scroll to course container instead of top
                    if (courseContainerRef.current) {
                      courseContainerRef.current.scrollIntoView({ 
                        behavior: "smooth", 
                        block: "start" 
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

export default memo(CoursesPage);