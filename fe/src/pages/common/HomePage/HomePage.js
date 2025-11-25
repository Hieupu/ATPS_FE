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

// Import các component mới
import PopularCoursesSection from '../../../components/HomePageSections/PopularCoursesSection';
import PopularClassesSection from '../../../components/HomePageSections/PopularClassesSection';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [popularCourses, setPopularCourses] = useState([]);
  const [popularClasses, setPopularClasses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
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

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const handleViewCourseDetails = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const features = [
    {
      icon: <MenuBook sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Tài liệu học tập",
      description:
        "Sách, ghi chú, video, đề luyện tập – tất cả trong một chỗ.",
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Lớp học trực tuyến",
      description:
        "Tham gia lớp học trực tuyến hoặc học với các bài giảng đã ghi lại.",
    },
    {
      icon: <Assignment sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Bài tập thông minh",
      description:
        "Hoàn thành bài tập với kết quả tức thì và phân tích chi tiết.",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Theo dõi tiến độ",
      description:
        "Báo cáo chi tiết giúp bạn nắm rõ mọi bước tiến trong học tập.",
    },
  ];

  const benefits = [
    "Tự học hoặc có hướng dẫn từ giảng viên",
    "Giảm thiểu xao nhãng từ nhiều công cụ khác nhau",
    "Nâng cao hiệu quả học tập đáng kể",
    "Lịch học linh hoạt, phù hợp với bạn",
    "Phân tích tiến độ học tập toàn diện",
  ];

  const stats = [
    { icon: <People />, number: "10,000+", label: "Học viên năng động" },
    { icon: <WorkspacePremium />, number: "500+", label: "Giảng viên giàu kinh nghiệm" },
    { icon: <MenuBook />, number: "1,000+", label: "Khóa học đa dạng" },
    { icon: <Star />, number: "95%", label: "Tỷ lệ đạt mục tiêu" },
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            py: { xs: 8, md: 12 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 650,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                  }}
                >
                  All-in-One Test Preparation System
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
                  Hệ thống học tập và ôn luyện thi trên một nền tảng duy nhất
                  Giúp bạn học hiệu quả và theo dõi tiến trình dễ dàng
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/courses')}
                    sx={{
                      backgroundColor: "white",
                      color: "primary.main",
                      "&:hover": { backgroundColor: "grey.100" },
                    }}
                  >
                    Bắt đầu học
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {[Speed, School, EmojiEvents].map((Icon, idx) => (
                    <Paper
                      key={idx}
                      elevation={4}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        transform: `rotate(${idx * 5 - 5}deg)`,
                      }}
                    >
                      <Icon sx={{ fontSize: 48, color: "primary.main" }} />
                    </Paper>
                  ))}
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

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ my: 10 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 650 }}
            >
              Mọi thứ bạn cần để thành công
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Nền tảng toàn diện cho học tập trong thời đại số
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

        {/* Benefits Section */}
        <Box sx={{ backgroundColor: "grey.50", py: 10 }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 650 }}>
                  Tại sao nên chọn ATPS?
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Nền tảng của chúng tôi được thiết kế để mang đến trải nghiệm học tập liền mạch, phù hợp với mong muốn của bạn.
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
                      Học tập không giới hạn
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
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