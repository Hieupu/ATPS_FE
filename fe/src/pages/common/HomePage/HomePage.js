import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  MenuBook,
  VideoLibrary,
  Assignment,
  TrendingUp,
  People,
  EmojiEvents,
  CheckCircle,
  Star,
  ArrowForward,
  School,
  Speed,
  WorkspacePremium,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/Header/AppHeader";
import { useAuth } from '../../../contexts/AuthContext';
import { getPopularCoursesApi } from '../../../apiServices/courseService';
import { getPopularClassesApi } from '../../../apiServices/courseService';
import { getFeaturedInstructorsApi } from '../../../apiServices/instructorService';

// Import các component mới
import PopularCoursesSection from '../../../components/HomePageSections/PopularCoursesSection';
import PopularClassesSection from '../../../components/HomePageSections/PopularClassesSection';
import TestimonialsSection from '../../../components/HomePageSections/TestimonialsSection';
import FAQSection from '../../../components/HomePageSections/FAQSection';
import FeaturedInstructorsSection from '../../../components/HomePageSections/FeaturedInstructorsSection';
import PartnersSection from '../../../components/HomePageSections/PartnersSection';
import AchievementsSection from '../../../components/HomePageSections/AchievementsSection';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [popularCourses, setPopularCourses] = useState([]);
  const [popularClasses, setPopularClasses] = useState([]);
  const [featuredInstructors, setFeaturedInstructors] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const navItems = ["Home", "Features", "Courses", "openingCeremony", "About", "Contact"];
  const { user, isAuthenticated, isInstructor, isLearner, isParent } = useAuth();

  // Fetch popular courses
  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoadingCourses(true);
        const courses = await getPopularCoursesApi();
        setPopularCourses(courses || []);
      } catch (error) {
        console.error("Error fetching popular courses:", error);
        setPopularCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchPopularCourses();
  }, []);

 useEffect(() => {
    const fetchPopularClasses = async () => {
      try {
        setLoadingClasses(true);
        const classes = await getPopularClassesApi();
        setPopularClasses(classes || []);
      } catch (error) {
        console.error("Error fetching popular classes:", error);
        setPopularClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchPopularClasses();
  }, []);

  // Fetch featured instructors
  useEffect(() => {
    const fetchFeaturedInstructors = async () => {
      try {
        setLoadingInstructors(true);
        const response = await getFeaturedInstructorsApi(4);
        // API returns { instructors: [...] }
        const instructors = response.instructors || response || [];
        setFeaturedInstructors(Array.isArray(instructors) ? instructors : []);
      } catch (error) {
        console.error("Error fetching featured instructors:", error);
        setFeaturedInstructors([]);
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchFeaturedInstructors();
  }, []);

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const handleViewCourseDetails = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const features = [
    {
      icon: <MenuBook sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Tài Liệu Học Tập Thống Nhất",
      description:
        "Truy cập tất cả tài liệu học tập ở một nơi - sách giáo khoa, ghi chú, video và bài kiểm tra thực hành.",
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Lớp Học Trực Tuyến",
      description:
        "Tham gia các buổi học trực tiếp với giảng viên hoặc học theo tốc độ riêng với các bài giảng được ghi hình.",
    },
    {
      icon: <Assignment sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Bài Tập Thông Minh",
      description:
        "Hoàn thành bài tập với phản hồi tức thì và phân tích hiệu suất chi tiết.",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Theo Dõi Tiến Độ",
      description:
        "Giám sát hành trình học tập của bạn với các báo cáo tiến độ toàn diện và thông tin chi tiết.",
    },
  ];

  const benefits = [
    "Chế độ học tự lập tiến độ và có giảng viên hướng dẫn",
    "Giảm thiểu phân tâm từ nhiều công cụ khác nhau",
    "Cải thiện hiệu quả học tập đáng kể",
    "Lịch trình học tập linh hoạt",
    "Phân tích tiến độ toàn diện",
    "Hỗ trợ trong thời gian gián đoạn và dịch bệnh",
  ];

  const stats = [
    { icon: <People />, number: "10,000+", label: "Học viên tích cực" },
    { icon: <WorkspacePremium />, number: "500+", label: "Giảng viên chuyên gia" },
    { icon: <MenuBook />, number: "1,000+", label: "Khóa học có sẵn" },
    { icon: <Star />, number: "95%", label: "Tỷ lệ thành công" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('=== USER ROLE INFORMATION ===');
      console.log('User:', user);
      console.log('Role:', user.role);
      console.log('Username:', user.Username);
      console.log('Email:', user.Email);
      
      // Log theo từng role cụ thể
      if (isInstructor) {
        console.log('🎯 This user is an INSTRUCTOR');
      } else if (isLearner) {
        console.log('📚 This user is a LEARNER');
      } else if (isParent) {
        console.log('👨‍👩‍👧‍👦 This user is a PARENT');
      } else {
        console.log('❓ Unknown role');
      }
    }
  }, [isAuthenticated, user, isInstructor, isLearner, isParent]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <AppHeader />

      {/* Body */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #E8F3FF 0%, #F3E7FF 25%, #FFE8F0 50%, #FFF4E8 75%, #E8F3FF 100%)",
            position: "relative",
            overflow: "hidden",
            py: { xs: 4, md: 6 },
            minHeight: { xs: "auto", md: "75vh" },
            maxHeight: { md: "700px" },
          }}
        >
          {/* Decorative floating shapes with blur effect - positioned away from text */}
          <Box
            sx={{
              position: "absolute",
              top: "8%",
              left: "2%",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.15))",
              filter: "blur(20px)",
              animation: "float 6s ease-in-out infinite",
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-20px)" },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "8%",
              left: "4%",
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(156, 39, 176, 0.25), rgba(156, 39, 176, 0.08))",
              filter: "blur(15px)",
              animation: "float 8s ease-in-out infinite 1s",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "12%",
              right: "6%",
              width: "75px",
              height: "75px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255, 152, 0, 0.25), rgba(255, 152, 0, 0.08))",
              filter: "blur(25px)",
              animation: "float 7s ease-in-out infinite 0.5s",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "8%",
              right: "12%",
              fontSize: "40px",
              opacity: 0.5,
              animation: "float 5s ease-in-out infinite 2s",
            }}
          >
            ✨
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: "10%",
              right: "20%",
              fontSize: "35px",
              opacity: 0.5,
              animation: "float 9s ease-in-out infinite 1.5s",
            }}
          >
            ✨
          </Box>
          
          {/* Floating UI elements - positioned away from text */}
          <Box
            sx={{
              position: "absolute",
              top: "15%",
              left: "3%",
              fontSize: "28px",
              opacity: 0.5,
              animation: "float 7s ease-in-out infinite 0.8s",
            }}
          >
          
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: "10%",
              right: "5%",
              fontSize: "26px",
              opacity: 0.5,
              animation: "float 6s ease-in-out infinite 1.2s",
            }}
          >
            💬
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: "55%",
              left: "2%",
              fontSize: "24px",
              opacity: 0.5,
              animation: "float 8s ease-in-out infinite 2.5s",
            }}
          >
            
          </Box>
          
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ pr: { xs: 0, md: 4 } }}>
                  {/* ATPS Title */}
                  <Box
                    sx={{
                      background: "linear-gradient(90deg, #5E72E4, #825EE4)",
                      display: "inline-block",
                      px: 3,
                      py: 1.5,
                      borderRadius: "8px",
                      mb: 2.5,
                      boxShadow: "0 4px 12px rgba(94, 114, 228, 0.3)",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.1rem", md: "1.3rem" },
                        color: "#ffffff",
                        lineHeight: 1.4,
                        mb: 0,
                      }}
                    >
                      All-in-One Test Preparation System
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "2rem", md: "3.5rem" },
                      color: "#1a1a1a",
                      lineHeight: 1.25,
                      letterSpacing: "-0.5px",
                      mb: 2.5,
                    }}
                  >
                    Học Kỹ Năng Mới <br />
                    <Box
                      component="span"
                      sx={{
                        position: "relative",
                        display: "inline-block",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: "-2px",
                          left: "-4px",
                          right: "-4px",
                          height: "14px",
                          background: "#FFD54F",
                          zIndex: -1,
                          borderRadius: "4px",
                        },
                      }}
                    >
                      Mọi Lúc, Mọi Nơi
                    </Box>
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3.5, 
                      color: "text.secondary",
                      fontWeight: 400,
                      lineHeight: 1.8,
                      fontSize: { xs: "0.95rem", md: "1.05rem" },
                    }}
                  >
                    Hợp nhất tài liệu học tập, lớp học trực tuyến, bài tập và theo dõi tiến độ vào một nền tảng mạnh mẽ duy nhất.
                  </Typography>
                  
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/courses')}
                      sx={{
                        backgroundColor: "#2196F3",
                        color: "white",
                        px: 4,
                        py: 1.5,
                        borderRadius: "50px",
                        fontSize: "1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: "0 4px 14px rgba(33, 150, 243, 0.4)",
                        "&:hover": { 
                          backgroundColor: "#1976D2",
                          boxShadow: "0 6px 20px rgba(33, 150, 243, 0.5)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Bắt Đầu Học
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<span style={{ fontSize: '1.2rem' }}>▶️</span>}
                      sx={{
                        borderColor: "#2196F3",
                        color: "#2196F3",
                        px: 4,
                        py: 1.5,
                        borderRadius: "50px",
                        fontSize: "1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        borderWidth: "2px",
                        "&:hover": {
                          borderColor: "#1976D2",
                          backgroundColor: "rgba(33, 150, 243, 0.04)",
                          borderWidth: "2px",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Xem Video
                    </Button>
                  </Box>

                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: "350px", md: "450px" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* Large orange circle background with reduced opacity */}
                  <Box
                    sx={{
                      position: "absolute",
                      width: "340px",
                      height: "340px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(255, 107, 107, 0.7), rgba(255, 142, 83, 0.7))",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 1,
                      filter: "blur(2px)",
                    }}
                  />
                  
                  {/* Main image with circular frame and shadow */}
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 2,
                      width: "380px",
                      height: "380px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25), 0 10px 30px rgba(255, 107, 107, 0.3)",
                    }}
                  >
                    <Box
                      component="img"
                      src="https://t4.ftcdn.net/jpg/03/61/68/09/360_F_361680901_QR21rRHstZjs98m2fmEwAEk9WiWAui2B.jpg"
                      alt="Student learning"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </Box>
                  
                  {/* Rocket icon - pastel tone */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "10%",
                      left: "15%",
                      fontSize: "60px",
                      zIndex: 3,
                      animation: "float 4s ease-in-out infinite",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                      opacity: 0.9,
                    }}
                  >
                    🚀
                  </Box>
                  
                  {/* Trophy icon - pastel tone */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "8%",
                      right: "12%",
                      fontSize: "75px",
                      zIndex: 3,
                      animation: "float 5s ease-in-out infinite 1s",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                      opacity: 0.9,
                    }}
                  >
                    🏆
                  </Box>
                  
                  {/* Blue circle - reduced size */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "25%",
                      left: "5%",
                      width: "68px",
                      height: "68px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2196F3, #1976D2)",
                      opacity: 0.85,
                      zIndex: 1,
                      animation: "float 6s ease-in-out infinite 0.5s",
                      boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                    }}
                  />
                  
                  {/* Purple circle - reduced size */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "15%",
                      right: "8%",
                      width: "83px",
                      height: "83px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #9C27B0, #7B1FA2)",
                      opacity: 0.8,
                      zIndex: 1,
                      animation: "float 7s ease-in-out infinite 1.5s",
                      boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                    }}
                  />
                  
                  {/* Small red circle - reduced size */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "25%",
                      right: "5%",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #F44336, #E53935)",
                      opacity: 0.85,
                      zIndex: 1,
                      animation: "float 5s ease-in-out infinite 2s",
                      boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
                    }}
                  />
                  
                  {/* Yellow circle - reduced size */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "18%",
                      left: "10%",
                      width: "53px",
                      height: "53px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #FFB300, #FFA000)",
                      opacity: 0.85,
                      zIndex: 1,
                      animation: "float 8s ease-in-out infinite 0.8s",
                      boxShadow: "0 4px 12px rgba(255, 179, 0, 0.3)",
                    }}
                  />
                  
                  {/* Sparkle icons - reduced size */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "8%",
                      right: "30%",
                      fontSize: "32px",
                      zIndex: 4,
                      animation: "sparkle 2s ease-in-out infinite",
                      "@keyframes sparkle": {
                        "0%, 100%": { opacity: 1, transform: "scale(1)" },
                        "50%": { opacity: 0.5, transform: "scale(1.2)" },
                      },
                    }}
                  >
                    ✨
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "32%",
                      right: "5%",
                      fontSize: "28px",
                      zIndex: 4,
                      animation: "sparkle 2s ease-in-out infinite 1s",
                    }}
                  >
                    ✨
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Stats Section */}
        <Container
          maxWidth="lg"
          sx={{ mt: -6, position: "relative", zIndex: 1 }}
        >
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  elevation={3}
                  sx={{ textAlign: "center", py: 3, borderRadius: 2 }}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 56,
                        height: 56,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 650, color: "primary.main", mb: 1 }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Popular Courses Section */}
        <PopularCoursesSection
          popularCourses={popularCourses}
          loadingCourses={loadingCourses}
          onViewAllCourses={handleViewAllCourses}
          onViewCourseDetails={handleViewCourseDetails}
        />

          <PopularClassesSection 
        popularClasses={popularClasses}
        loadingClasses={loadingClasses}
        onViewCourseDetails={handleViewCourseDetails} 
      />

        {/* Featured Instructors Section */}
        <FeaturedInstructorsSection 
          instructors={featuredInstructors}
          loading={loadingInstructors}
        />

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ my: 10 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Chip label="TÍNH NĂNG" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 650 }}
            >
              Mọi Thứ Bạn Cần Để Thành Công
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Nền tảng toàn diện được thiết kế cho người học hiện đại
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 3,
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-8px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Benefits Section */}
        <Box sx={{ backgroundColor: "grey.50", py: 10 }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  Tại Sao Chọn ATPS?
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Nền tảng của chúng tôi được thiết kế để cung cấp trải nghiệm học tập liền mạch, thích ứng với nhu cầu của bạn, đồng thời hỗ trợ các tổ chức mở rộng dịch vụ hiệu quả.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  {benefits.map((benefit, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <CheckCircle
                        sx={{ color: "success.main", mr: 2, mt: 0.5 }}
                      />
                      <Typography variant="body1">{benefit}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <School sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      Đáng Tin Cậy & Bảo Mật
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.95 }}>
                      Dữ liệu của bạn được bảo vệ với bảo mật cấp doanh nghiệp. Tập trung vào việc học, để chúng tôi xử lý phần còn lại.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Achievements Section */}
        <AchievementsSection />

        {/* Partners Section */}
        <PartnersSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <Container maxWidth="md" sx={{ my: 10, textAlign: "center" }}>
          <Paper
            elevation={4}
            sx={{
              p: 6,
              borderRadius: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Sẵn Sàng Thay Đổi Cách Học Của Bạn?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
              Tham gia cùng hàng nghìn học viên đang đạt được mục tiêu với ATPS
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/courses')}
              sx={{
                backgroundColor: "white",
                color: "primary.main",
                fontWeight: 600,
                "&:hover": { backgroundColor: "grey.100" },
              }}
            >
              Bắt Đầu Miễn Phí
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{ backgroundColor: "grey.900", color: "white", py: 6 }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <School sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ATPS
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                All-in-One Test Preparation System - Giải pháp toàn diện cho học tập và ôn luyện thi hiệu quả
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Product
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {["Features", "Pricing", "Courses", "Resources"].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      opacity: 0.8,
                      cursor: "pointer",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Company
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      opacity: 0.8,
                      cursor: "pointer",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Stay Updated
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Subscribe to our newsletter for the latest updates and learning
                tips.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <input
                  type="email"
                  placeholder="Your email"
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "4px",
                    border: "none",
                    outline: "none",
                  }}
                />
                <Button variant="contained" color="primary">
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              mt: 4,
              pt: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2025 ATPS. All rights reserved. Built with passion for
              education.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;