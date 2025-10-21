import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Chip,
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
  Schedule,
  Security,
  CheckCircle,
  Star,
  ArrowForward,
  School,
  Speed,
  WorkspacePremium,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/Header/AppHeader";

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const navItems = ["Home", "Features", "Courses", "About", "Contact"];

  const features = [
    {
      icon: <MenuBook sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Unified Learning Materials",
      description:
        "Access all your study materials in one place - textbooks, notes, videos, and practice tests.",
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Online Classes",
      description:
        "Join live instructor-guided sessions or learn at your own pace with recorded lectures.",
    },
    {
      icon: <Assignment sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Smart Assignments",
      description:
        "Complete assignments with instant feedback and detailed performance analytics.",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: "primary.main" }} />,
      title: "Progress Tracking",
      description:
        "Monitor your learning journey with comprehensive progress reports and insights.",
    },
  ];

  const benefits = [
    "Self-paced and instructor-guided learning modes",
    "Minimize distractions from multiple tools",
    "Improve study efficiency significantly",
    "Flexible learning schedule",
    "Comprehensive progress analytics",
    "Support during disruptions and epidemics",
  ];

  const stats = [
    { icon: <People />, number: "10,000+", label: "Active Learners" },
    { icon: <WorkspacePremium />, number: "500+", label: "Expert Instructors" },
    { icon: <MenuBook />, number: "1,000+", label: "Courses Available" },
    { icon: <Star />, number: "95%", label: "Success Rate" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
                    fontWeight: 700,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                  }}
                >
                  All-in-One Test Preparation System
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
                  Unify your learning materials, online classes, assignments,
                  and progress tracking into a single powerful platform.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      backgroundColor: "white",
                      color: "primary.main",
                      "&:hover": { backgroundColor: "grey.100" },
                    }}
                  >
                    Start Learning
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "white",
                      color: "white",
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Watch Demo
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
                      sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
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

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ my: 10 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Chip label="FEATURES" color="primary" sx={{ mb: 2 }} />
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Everything You Need to Succeed
            </Typography>
            <Typography variant="h6" color="text.secondary">
              A comprehensive platform designed for modern learners
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
              <Grid item xs={12} md={6}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  Why Choose ATPS?
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Our platform is designed to provide a seamless learning
                  experience that adapts to your needs while supporting
                  institutions in scaling their services effectively.
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
              <Grid item xs={12} md={6}>
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
                    <Security sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      Trusted & Secure
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.95 }}>
                      Your data is protected with enterprise-grade security.
                      Focus on learning while we handle the rest.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

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
              Ready to Transform Your Learning?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
              Join thousands of students already achieving their goals with ATPS
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                backgroundColor: "white",
                color: "primary.main",
                "&:hover": { backgroundColor: "grey.100" },
              }}
            >
              Get Started for Free
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
                All-in-One Test Preparation System - Your complete solution for
                effective learning and exam preparation.
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