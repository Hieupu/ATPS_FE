import React, {
  useState,
  useEffect,
  memo,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  Chip,
  Fade,
} from "@mui/material";
import {
  Search,
  School,
  Business,
  ArrowForward,
  TuneRounded,
  RocketLaunchRounded,
} from "@mui/icons-material";
import { searchInstructorsApi } from "../../apiServices/instructorService";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/Header/AppHeader";

const TYPE_LABELS = {
  fulltime: "Giảng viên làm việc toàn thời gian",
  parttime: "Giảng viên làm việc bán thời gian",
  fulltime_tutor: "Gia sư toàn thời gian",
  parttime_tutor: "Gia sư bán thời gian",
};

const InstructorCard = ({ instructor }) => {
  console.log("[InstructorCard] Instructor data:", {
    InstructorID: instructor?.InstructorID,
    FullName: instructor?.FullName,
    TotalCourses: instructor?.TotalCourses,
    TotalStudents: instructor?.TotalStudents,
    InstructorFee: instructor?.InstructorFee,
    Certificates: instructor?.Certificates,
    allKeys: instructor ? Object.keys(instructor) : [],
  });

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
        borderRadius: 5,
        overflow: "hidden",
        position: "relative",
        border: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,249,255,0.9) 100%)",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 25px 60px rgba(99,102,241,0.3)",
          borderColor: "rgba(99,102,241,0.4)",
          "& .view-button": {
            background: "linear-gradient(135deg, #4c51bf 0%, #6d28d9 100%)",
            boxShadow: "0 10px 25px rgba(109,40,217,0.35)",
          },
        },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Avatar
            src={instructor.ProfilePicture}
            sx={{
              width: 110,
              height: 110,
              border: "4px solid",
              borderColor: "primary.light",
              boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
            }}
          >
            {instructor.FullName?.charAt(0)}
          </Avatar>
        </Box>

        {/* Full Name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: "text.primary",
            fontFamily: "'Poppins', 'Segoe UI', sans-serif",
          }}
        >
          {instructor.FullName}
        </Typography>

        {/* Major and Job */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            p: 2,
            bgcolor: "#f4f6ff",
            borderRadius: 3,
            border: "1px solid rgba(99,102,241,0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <School sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {instructor.Major || "Chuyên ngành"}
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", fontSize: "0.85rem" }}
            >
              {instructor.Job || "Giảng viên"}
            </Typography>
          </Box>
          {/* Certificates */}
          {instructor.Certificates && instructor.Certificates.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                mt: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  textAlign: "center",
                }}
              >
                Chứng chỉ:
              </Typography>
              {instructor.Certificates.slice(0, 2).map((cert, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    lineHeight: 1.2,
                  }}
                >
                  • {cert}
                </Typography>
              ))}
              {instructor.Certificates.length > 2 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  +{instructor.Certificates.length - 2} chứng chỉ khác
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            gap: 2,
            py: 2,
            borderTop: "2px solid",
            borderBottom: "2px solid",
            borderColor: "divider",
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              Học sinh
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            py: 1,
            bgcolor: "rgba(99,102,241,0.08)",
            borderRadius: 2,
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              fontSize: "0.9rem",
            }}
          >
            Phí: {(instructor.InstructorFee || 0).toLocaleString("vi-VN")}{" "}
            VND/buổi
          </Typography>
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
          Xem hồ sơ
        </Button>
      </CardContent>
    </Card>
  );
};

const InstructorCardSkeleton = () => (
  <Card sx={{ height: 500, borderRadius: 5 }}>
    <CardContent
      sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Skeleton variant="circular" width={110} height={110} />
      </Box>
      <Skeleton variant="text" width="80%" height={32} sx={{ mx: "auto" }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mx: "auto" }} />
      <Skeleton variant="text" width="50%" height={24} sx={{ mx: "auto" }} />
      <Box sx={{ display: "flex", gap: 2, my: 3 }}>
        <Skeleton variant="rectangular" width="45%" height={60} />
        <Skeleton variant="rectangular" width="45%" height={60} />
      </Box>
      <Skeleton variant="rectangular" width="100%" height={48} />
    </CardContent>
  </Card>
);

const InstructorsPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedTimeslots, setSelectedTimeslots] = useState([]);
  const [page, setPage] = useState(1);
  const [filterByMajor, setFilterByMajor] = useState("");
  const [filterByType, setFilterByType] = useState("");
  const instructorsPerPage = 9;
  const [total, setTotal] = useState(0);
  const [feeRange, setFeeRange] = useState([0, 1000000]);

  // Ref to scroll to instructors container
  const instructorContainerRef = useRef(null);

  const timeslotOptions = [
    { value: "1", label: "Thứ 2 - 8h-10h" },
    { value: "2", label: "Thứ 2 - 10h20-12h20" },
    { value: "3", label: "Thứ 2 - 13h-15h" },
    { value: "4", label: "Thứ 2 - 15h20-17h20" },
    { value: "5", label: "Thứ 2 - 17h40-19h40" },
    { value: "6", label: "Thứ 2 - 20h-22h" },
    { value: "7", label: "Thứ 3 - 8h-10h" },
    { value: "8", label: "Thứ 3 - 10h20-12h20" },
    { value: "9", label: "Thứ 3 - 13h-15h" },
    { value: "10", label: "Thứ 3 - 15h20-17h20" },
    { value: "11", label: "Thứ 3 - 17h40-19h40" },
    { value: "12", label: "Thứ 3 - 20h-22h" },
    { value: "13", label: "Thứ 4 - 8h-10h" },
    { value: "14", label: "Thứ 4 - 10h20-12h20" },
    { value: "15", label: "Thứ 4 - 13h-15h" },
    { value: "16", label: "Thứ 4 - 15h20-17h20" },
    { value: "17", label: "Thứ 4 - 17h40-19h40" },
    { value: "18", label: "Thứ 4 - 20h-22h" },
    { value: "19", label: "Thứ 5 - 8h-10h" },
    { value: "20", label: "Thứ 5 - 10h20-12h20" },
    { value: "21", label: "Thứ 5 - 13h-15h" },
    { value: "22", label: "Thứ 5 - 15h20-17h20" },
    { value: "23", label: "Thứ 5 - 17h40-19h40" },
    { value: "24", label: "Thứ 5 - 20h-22h" },
    { value: "25", label: "Thứ 6 - 8h-10h" },
    { value: "26", label: "Thứ 6 - 10h20-12h20" },
    { value: "27", label: "Thứ 6 - 13h-15h" },
    { value: "28", label: "Thứ 6 - 15h20-17h20" },
    { value: "29", label: "Thứ 6 - 17h40-19h40" },
    { value: "30", label: "Thứ 6 - 20h-22h" },
    { value: "31", label: "Thứ 7 - 8h-10h" },
    { value: "32", label: "Thứ 7 - 10h20-12h20" },
    { value: "33", label: "Thứ 7 - 13h-15h" },
    { value: "34", label: "Thứ 7 - 15h20-17h20" },
    { value: "35", label: "Thứ 7 - 17h40-19h40" },
    { value: "36", label: "Thứ 7 - 20h-22h" },
    { value: "37", label: "Chủ nhật - 8h-10h" },
    { value: "38", label: "Chủ nhật - 10h20-12h20" },
    { value: "39", label: "Chủ nhật - 13h-15h" },
    { value: "40", label: "Chủ nhật - 15h20-17h20" },
    { value: "41", label: "Chủ nhật - 17h40-19h40" },
    { value: "42", label: "Chủ nhật - 20h-22h" },
  ];

  // Trong useEffect fetch instructors, thêm log để debug
  useEffect(() => {
    const fetch = async () => {
      try {
        console.log("Filter params:", {
          search: debouncedSearchTerm,
          major: filterByMajor,
          type: filterByType,
          timeslots: selectedTimeslots,
          minFee: feeRange[0],
          maxFee: feeRange[1],
          page,
          pageSize: instructorsPerPage,
        });

        const { items, total: t } = await searchInstructorsApi({
          search: debouncedSearchTerm,
          major: filterByMajor,
          type: filterByType,
          timeslots: selectedTimeslots,
          minFee: feeRange[0],
          maxFee: feeRange[1],
          page,
          pageSize: instructorsPerPage,
        });

        console.log("API response:", items);
        setInstructors(items || []);
        setTotal(t || 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching instructors:", error);
        setInstructors([]);
        setTotal(0);
        setLoading(false);
      }
    };
    fetch();
  }, [
    debouncedSearchTerm,
    filterByMajor,
    filterByType,
    selectedTimeslots,
    feeRange,
    page,
  ]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / instructorsPerPage));

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setFilterByMajor("");
    setFilterByType("");
    setSelectedTimeslots([]); // Reset to empty array
    setPage(1);
  }, []);

  // Memoized active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filterByMajor) count++;
    if (filterByType) count++;
    if (selectedTimeslots.length > 0) count++; // Check array length
    return count;
  }, [searchTerm, filterByMajor, filterByType, selectedTimeslots]);

  // Get unique majors for filter
  const majors = useMemo(() => {
    return ["", ...new Set(instructors.map((i) => i.Major).filter(Boolean))];
  }, [instructors]);

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

      {/* Hero Section - Enhanced Premium Design */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
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
          {/* Icon Teacher */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "4rem",
              top: "15%",
              left: "8%",
              transform: "rotate(-15deg)",
            }}
          >
            👨‍🏫
          </Box>
          {/* Icon Book */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "3.5rem",
              top: "65%",
              left: "12%",
              transform: "rotate(25deg)",
            }}
          >
            📚
          </Box>
          {/* Icon Certificate */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "3rem",
              top: "25%",
              right: "10%",
              transform: "rotate(15deg)",
            }}
          >
            📜
          </Box>
          {/* Icon Star */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "3.5rem",
              top: "70%",
              right: "15%",
              transform: "rotate(-20deg)",
            }}
          >
            ⭐
          </Box>
          {/* Icon Lightbulb */}
          <Box
            sx={{
              position: "absolute",
              fontSize: "4rem",
              top: "45%",
              left: "5%",
              transform: "rotate(10deg)",
            }}
          >
            💡
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
          {/* Hero Icon */}
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
              boxShadow:
                "0 35px 90px rgba(0,0,0,0.35), 0 0 80px rgba(255,255,255,0.35), inset 0 1px 1px rgba(255,255,255,0.5)",
              backdropFilter: "blur(25px)",
              fontSize: "2.5rem",
              border: "3px solid rgba(255,255,255,0.35)",
            }}
          >
            👨‍🏫
          </Box>

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
            Đội Ngũ Giảng Viên
          </Typography>

          {/* Subtitle */}
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
            Khám phá những giảng viên giàu kinh nghiệm và chuyên môn sâu
          </Typography> */}

          {/* CTA Button */}
          {/* <Button
            variant="contained"
            size="medium"
            endIcon={<RocketLaunchRounded />}
            onClick={() => {
              instructorContainerRef.current?.scrollIntoView({
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

      <Container maxWidth="xl" sx={{ pb: 8 }} ref={instructorContainerRef}>
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
                placeholder="Tìm kiếm giảng viên..."
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

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Chuyên ngành</InputLabel>
                <Select
                  value={filterByMajor}
                  label="Chuyên ngành"
                  onChange={(e) => {
                    setFilterByMajor(e.target.value);
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
                  <MenuItem value="">Tất cả chuyên ngành</MenuItem>
                  {majors
                    .filter((m) => m)
                    .map((major) => (
                      <MenuItem key={major} value={major}>
                        {major}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Loại giảng viên</InputLabel>
                <Select
                  value={filterByType}
                  label="Loại giảng viên"
                  onChange={(e) => {
                    setFilterByType(e.target.value);
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
                  <MenuItem value="">Tất cả loại</MenuItem>
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {label}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel>Khung giờ trống</InputLabel>
                <Select
                  multiple
                  value={selectedTimeslots}
                  label="Khung giờ trống"
                  onChange={(e) => {
                    setSelectedTimeslots(e.target.value);
                    setPage(1);
                  }}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return "Tất cả khung giờ";
                    }
                    if (selected.length === 1) {
                      const option = timeslotOptions.find(
                        (opt) => opt.value === selected[0]
                      );
                      return option?.shortLabel || option?.label || selected[0]; // Sử dụng shortLabel
                    }
                    return `${selected.length} khung giờ`;
                  }}
                  sx={{
                    borderRadius: 8, // Border tròn hơn
                    bgcolor: "#f5f6ff",
                    "&:hover": {
                      bgcolor: "#eef0ff",
                    },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      boxShadow: "0 0 0 4px rgba(124,58,237,0.12)",
                    },
                  }}
                >
                  {timeslotOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            border: "2px solid",
                            borderColor: selectedTimeslots.includes(
                              option.value
                            )
                              ? "primary.main"
                              : "grey.400",
                            borderRadius: 2, // Border tròn hơn
                            mr: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: selectedTimeslots.includes(
                              option.value
                            )
                              ? "primary.main"
                              : "transparent",
                          }}
                        >
                          {selectedTimeslots.includes(option.value) && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                backgroundColor: "white",
                                borderRadius: 1, // Border tròn hơn
                              }}
                            />
                          )}
                        </Box>
                        {option.shortLabel || option.label}{" "}
                        {/* Hiển thị shortLabel */}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedTimeslots.length > 0 && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setSelectedTimeslots([])}
                  sx={{
                    textTransform: "none",
                    color: "error.main",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    mt: 0.5,
                  }}
                >
                  Xóa khung giờ
                </Button>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Mức phí (VND/buổi)</InputLabel>
                <Select
                  value={feeRange.join(",")}
                  label="Mức phí (VND/buổi)"
                  onChange={(e) => {
                    const range = e.target.value.split(",").map(Number);
                    setFeeRange(range);
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
                  <MenuItem value="0,1000000">Tất cả mức phí</MenuItem>
                  <MenuItem value="0,200000">Dưới 200k</MenuItem>
                  <MenuItem value="200000,400000">200k - 400k</MenuItem>
                  <MenuItem value="400000,600000">400k - 600k</MenuItem>
                  <MenuItem value="600000,800000">600k - 800k</MenuItem>
                  <MenuItem value="800000,1000000">800k - 1tr</MenuItem>
                  <MenuItem value="1000000,5000000">Trên 1tr</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1}>
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
                    fontSize: "0.95rem",
                    boxShadow: "0 10px 30px rgba(99,102,241,0.35)",
                  }}
                >
                  {total} GV
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
                      fontSize: "0.75rem",
                    }}
                  >
                    Xóa
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Instructors Grid with Fade transition */}
        <Fade in={!loading} timeout={500}>
          <Grid container spacing={4}>
            {instructors.map((instructor, index) => (
              <Grid item xs={12} sm={6} md={4} key={instructor.InstructorID}>
                <Fade in={true} timeout={300 + index * 50}>
                  <Box>
                    <InstructorCard instructor={instructor} />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Fade>

        {/* No Results */}
        {!loading && instructors.length === 0 && (
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
                👨‍🏫
              </Box>
              <Typography
                variant="h5"
                color="text.primary"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Không tìm thấy giảng viên phù hợp
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    // Scroll to instructor container instead of top
                    if (instructorContainerRef.current) {
                      instructorContainerRef.current.scrollIntoView({
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
                      background:
                        "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)",
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

export default memo(InstructorsPage);
