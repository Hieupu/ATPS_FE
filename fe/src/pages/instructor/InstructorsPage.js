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
  Card,
  CardContent,
  Avatar,
  Button,
  InputAdornment,
  Paper,
  Skeleton,
} from "@mui/material";
import { Search, School, Business, ArrowForward } from "@mui/icons-material";
import { searchInstructorsApi } from "../../apiServices/instructorService";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/Header/AppHeader";

const InstructorCard = ({ instructor }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/instructors/${instructor.InstructorID}`);
  };

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
          "& .view-button": {
            transform: "translateX(8px)",
          },
        },
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}
      >
        {/* Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Avatar
            src={instructor.ProfilePicture}
            sx={{
              width: 120,
              height: 120,
              border: "4px solid",
              borderColor: "primary.light",
            }}
          >
            {instructor.FullName?.charAt(0)}
          </Avatar>
        </Box>

        {/* Full Name */}
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            textAlign: "center",
            color: "text.primary",
          }}
        >
          {instructor.FullName}
        </Typography>

        {/* Major and Job */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <School sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {instructor.Major}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Business sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="body2" color="text.secondary">
              {instructor.Job}
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            pb: 3,
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {instructor.TotalCourses || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Khóa học
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {instructor.TotalStudents || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Học sinh
            </Typography>
          </Box>
        </Box>

        {/* View Profile Button */}
        <Button
          className="view-button"
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={handleViewProfile}
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            transition: "transform 0.3s ease",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
          }}
        >
          Xem hồ sơ
        </Button>
      </CardContent>
    </Card>
  );
};

const InstructorCardSkeleton = () => (
  <Card sx={{ height: 500, borderRadius: 3 }}>
    <CardContent
      sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Skeleton variant="circular" width={120} height={120} />
      </Box>
      <Skeleton variant="text" width="80%" height={32} sx={{ mx: "auto" }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mx: "auto" }} />
      <Skeleton variant="text" width="50%" height={24} sx={{ mx: "auto" }} />
      <Box sx={{ display: "flex", gap: 2, my: 3 }}>
        <Skeleton variant="rectangular" width="45%" height={60} />
        <Skeleton variant="rectangular" width="45%" height={60} />
      </Box>
      <Skeleton variant="rectangular" width="100%" height={40} />
    </CardContent>
  </Card>
);

const InstructorsPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [filterByMajor, setFilterByMajor] = useState("all");
  const instructorsPerPage = 9;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { items, total: t } = await searchInstructorsApi({
          search: debouncedSearchTerm,
          major: filterByMajor === "all" ? "" : filterByMajor,
          sort: sortBy,
          page,
          pageSize: instructorsPerPage,
        });
        setInstructors(items || []);
        setTotal(t || 0);
      } catch (error) {
        console.error("Error fetching instructors:", error);
        setInstructors([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedSearchTerm, filterByMajor, sortBy, page]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // legacy fetch removed (now using server-side search)

  // Filter and sort instructors
  const totalPages = Math.max(1, Math.ceil(total / instructorsPerPage));
  const paginatedInstructors = instructors;

  // Get unique majors for filter
  const majors = [
    "all",
    ...new Set(instructors.map((i) => i.Major).filter(Boolean)),
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <InstructorCardSkeleton />
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
            Đội ngũ Giảng viên
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
            Khám phá những giảng viên giàu kinh nghiệm và chuyên môn sâu
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
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm giảng viên..."
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
                <InputLabel>Chuyên ngành</InputLabel>
                <Select
                  value={filterByMajor}
                  label="Chuyên ngành"
                  onChange={(e) => {
                    setFilterByMajor(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  {majors.map((major) => (
                    <MenuItem key={major} value={major}>
                      {major === "all" ? "Tất cả chuyên ngành" : major}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortBy}
                  label="Sắp xếp"
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="newest">Mới nhất</MenuItem>
                  <MenuItem value="name">Tên A-Z</MenuItem>
                  <MenuItem value="courses-desc">Nhiều khóa học nhất</MenuItem>
                  <MenuItem value="courses-asc">Ít khóa học nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box
                sx={{
                  width: "100%",
                  py: 1.5,
                  textAlign: "center",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                {total} Giảng viên
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Instructors Grid */}
        <Grid container spacing={4}>
          {paginatedInstructors.map((instructor) => (
            <Grid item xs={12} sm={6} md={4} key={instructor.id}>
              <InstructorCard instructor={instructor} />
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {paginatedInstructors.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Không tìm thấy giảng viên nào phù hợp
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Vui lòng điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
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

export default InstructorsPage;