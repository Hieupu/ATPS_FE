import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Rating,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  People,
  Schedule,
  Star,
  PlayCircle,
  AccessTime,
  School,
  WorkspacePremium,
  Language,
  CheckCircle,
  ErrorOutline,
  Payment,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseByIdApi } from "../../apiServices/courseService";
import { createPaymentLinkApi } from "../../apiServices/paymentService";

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`course-tabpanel-${index}`}
    aria-labelledby={`course-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const CourseDetailSkeleton = () => (
  <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
    <Box sx={{ bgcolor: "grey.300", py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" width={100} height={32} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="80%" height={60} />
            <Skeleton variant="text" width="60%" height={40} />
            <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
              <Skeleton variant="text" width={150} />
              <Skeleton variant="text" width={150} />
              <Skeleton variant="text" width={150} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  </Box>
);

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [enrollDialog, setEnrollDialog] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    []
  );

  const formatPrice = useCallback(
    (price) => priceFormatter.format(price),
    [priceFormatter]
  );

  const formatDuration = useCallback((duration) => `${duration} hours`, []);

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourseByIdApi(id);
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError(error.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);


const handleEnroll = async () => {
  try {
    setEnrolling(true);
    setEnrollError(null);

    const { paymentUrl } = await createPaymentLinkApi(course.CourseID);

    // Chuyển hướng người dùng sang trang PayOS
    window.location.href = paymentUrl;
  } catch (error) {
    console.error("Payment error:", error);
    setEnrollError(error.message || "Failed to start payment.");
  } finally {
    setEnrolling(false);
  }
};

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRetry = () => {
    fetchCourse();
  };

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert
          severity="error"
          icon={<ErrorOutline />}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning">
          Course not found. Please check the course ID and try again.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/courses")}
          sx={{ mt: 2 }}
        >
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Course Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Chip
                label={course.Category || "Programming"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  mb: 2,
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                }}
              >
                {course.Title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  mb: 3,
                  maxWidth: 600,
                }}
              >
                {course.Description}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <People sx={{ mr: 1 }} />
                  <Typography>
                    {course.EnrollmentCount || 0} students enrolled
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Schedule sx={{ mr: 1 }} />
                  <Typography>{formatDuration(course.Duration)}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Star sx={{ mr: 1 }} />
                  <Typography>
                    {course.AverageRating
                      ? course.AverageRating.toFixed(1)
                      : "N/A"}{" "}
                    rating
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={course.InstructorAvatar}
                  sx={{ width: 56, height: 56, mr: 2 }}
                  alt={course.InstructorName}
                >
                  {course.InstructorName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {course.InstructorName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {course.InstructorJob} • {course.InstructorMajor}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ position: "relative", top: { md: 40 } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography
                      variant="h4"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {formatPrice(course.TuitionFee)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      One-time payment
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => setEnrollDialog(true)}
                    startIcon={<Payment />}
                    sx={{ mb: 2, py: 1.5, fontWeight: 600 }}
                  >
                    Enroll Now
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    sx={{ mb: 3, py: 1.5, fontWeight: 600 }}
                  >
                    Add to Wishlist
                  </Button>

                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      This course includes:
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PlayCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${course.UnitCount || 0} learning units`}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <AccessTime color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Lifetime access" />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <WorkspacePremium color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Certificate of completion" />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Language color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="English subtitles" />
                      </ListItem>
                    </List>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Course Content - Tabs remain the same */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="course information tabs"
        >
          <Tab label="Curriculum" />
          <Tab label="Instructor" />
          <Tab label="Reviews" />
          <Tab label="FAQ" />
        </Tabs>

        <Divider />

        {/* Curriculum Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Course Curriculum
          </Typography>

          {course.Units && course.Units.length > 0 ? (
            <Card>
              <CardContent sx={{ p: 0 }}>
                <List>
                  {course.Units.map((unit, index) => (
                    <ListItem
                      key={unit.UnitID}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:last-child": { borderBottom: "none" },
                        py: 2,
                      }}
                    >
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {unit.Title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {unit.Description}
                            </Typography>
                            {unit.Duration && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 1,
                                }}
                              >
                                <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {unit.Duration}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <Chip
                        icon={<PlayCircle />}
                        label="Preview"
                        variant="outlined"
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">
              No curriculum available for this course yet.
            </Alert>
          )}
        </TabPanel>

        {/* Other tabs remain the same... */}
      </Container>

      {/* Enrollment Dialog - Updated */}
      <Dialog
        open={enrollDialog}
        onClose={() => !enrolling && setEnrollDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Payment color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Proceed to Payment
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {enrollError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {enrollError}
            </Alert>
          )}
          
          <Alert severity="info" sx={{ mb: 2 }}>
            You will be redirected to PayOS to complete your payment securely.
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to enroll in:
          </Typography>
          <Typography
            variant="h6"
            color="primary.main"
            sx={{ fontWeight: 600, mb: 2 }}
          >
            {course.Title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Instructor:</strong> {course.InstructorName}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Duration:</strong> {formatDuration(course.Duration)}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Total: {formatPrice(course.TuitionFee)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollDialog(false)} disabled={enrolling}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEnroll}
            disabled={enrolling}
            sx={{ minWidth: 140 }}
            startIcon={enrolling ? <CircularProgress size={16} /> : <Payment />}
          >
            {enrolling ? "Redirecting..." : "Proceed to Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailPage;