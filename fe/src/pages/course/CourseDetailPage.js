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
  Tabs,
  Tab,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { TextField, Paper } from "@mui/material";
import {
  People,
  Schedule,
  Star,
  PlayCircle,
  AccessTime,
  School,
  WorkspacePremium,
  Language,
  ErrorOutline,
  Payment,
  VideoCall,
  RadioButtonChecked,
  RadioButtonUnchecked,
  ExpandMore,
  InsertDriveFile,
  PictureAsPdf,
  VideoLibrary,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCourseByIdApi,
  getClassesByCourseApi,
  getCourseCurriculumApi,
  getMyEnrolledCourses,
} from "../../apiServices/courseService";
import { createPaymentLinkApi } from "../../apiServices/paymentService";
import {
  getExamsByCourseApi,
  getExamQuestionsApi,
  submitExamApi,
} from "../../apiServices/examService";
import { getMyLatestExamResultApi } from "../../apiServices/examService";
 
import AppHeader from "../../components/Header/AppHeader";
import { getCourseMaterialsApi } from "../../apiServices/materialService";
import ReactPlayer from "react-player";

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
            <Skeleton
              variant="rectangular"
              width={100}
              height={32}
              sx={{ mb: 2 }}
            />
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
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Curriculum Units/Lessons (Unit-only UI)
  const [curriculum, setCurriculum] = useState([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [loadingCurriculumData, setLoadingCurriculumData] = useState(false);
  // Materials (only when enrolled)
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState(null);
  const [hasLoadedMaterials, setHasLoadedMaterials] = useState(false);

  // Material preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Enrollment check
  const [isEnrolledInCourse, setIsEnrolledInCourse] = useState(false);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    []
  );

  const formatPrice = useCallback(
    (price) => {
      if (price == null || isNaN(price)) {
        return "0 ₫";
      }
      return priceFormatter.format(price);
    },
    [priceFormatter]
  );

  const formatDuration = useCallback((duration) => `${duration} hours`, []);
  const getFileIcon = useCallback((type) => {
    switch ((type || "").toLowerCase()) {
      case "pdf":
        return <PictureAsPdf color="error" />;
      case "video":
      case "mp4":
        return <VideoLibrary color="primary" />;
      default:
        return <InsertDriveFile />;
    }
  }, []);

  const handleDownloadMaterial = useCallback((material) => {
    if (!material?.FileURL) return;
    window.open(material.FileURL, "_blank", "noopener,noreferrer");
  }, []);

  const handleViewMaterial = useCallback((material) => {
    if (!material) return;
    setPreviewItem(material);
    setPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewItem(null);
  }, []);

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

  // Check enrollment to hide enroll button
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!course?.CourseID) return;
      try {
        const res = await getMyEnrolledCourses();
        const list = res?.data || res?.items || res || [];
        const enrolled = (Array.isArray(list) ? list : []).some(
          (c) => c.CourseID === course.CourseID
        );
        setIsEnrolledInCourse(enrolled);
      } catch (e) {
        setIsEnrolledInCourse(false);
      }
    };
    checkEnrollment();
  }, [course?.CourseID]);

  // Load curriculum structure (Units only UI in accordion)
  useEffect(() => {
    const loadCurriculum = async () => {
      if (tabValue !== 0 || !course?.CourseID) return;
      try {
        setLoadingCurriculum(true);
        setLoadingCurriculumData(true);
        const cur = await getCourseCurriculumApi(course.CourseID);
        setCurriculum(cur.curriculum || []);
      } catch (e) {
        setCurriculum([]);
      } finally {
        setLoadingCurriculum(false);
        setLoadingCurriculumData(false);
      }
    };
    loadCurriculum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, course?.CourseID]);

  // Load materials khi mở tab Materials (index 3) nếu đã enroll
  useEffect(() => {
    const materialsTabIndex = 3;
    if (!isEnrolledInCourse || !course?.CourseID) return;
    // Prefetch một lần khi vừa xác định đã enroll hoặc khi user mở tab Materials
    if (tabValue !== materialsTabIndex && hasLoadedMaterials) return;
    const loadMaterials = async () => {
      try {
        setLoadingMaterials(true);
        setMaterialsError(null);
        console.log("Loading materials for course:", course.CourseID);
        const data = await getCourseMaterialsApi(course.CourseID);
        const list = (data.materials || []).map((m) => ({
          MaterialID: m.MaterialID,
          Title: m.Title,
          FileURL: m.FileURL,
          Status: m.Status,
          FileType: (m.fileType || "").toLowerCase(),
        }));
        setCourseMaterials(list);
        setHasLoadedMaterials(true);
      } catch (e) {
        setMaterialsError(e.message || "Không thể tải tài liệu khóa học");
        setCourseMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    };
    loadMaterials();
  }, [tabValue, isEnrolledInCourse, course?.CourseID, hasLoadedMaterials]);

  // Exam state
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [latestExamResults, setLatestExamResults] = useState({}); // frontend-only cache: examId -> result
  const [examDialogOpen, setExamDialogOpen] = useState(false);

  // Load exams when switch to Exam tab (index 4 when enrolled)
  useEffect(() => {
    if (!isEnrolledInCourse || !course?.CourseID) return;
    const examTabIndex = 4;
    if (tabValue !== examTabIndex) return;
    const load = async () => {
      try {
        setLoadingExams(true);
        const data = await getExamsByCourseApi(course.CourseID);
        const list = data.exams || [];
        setExams(list);
        // Fetch latest scores from DB for each exam
        const pairs = await Promise.all(
          list.map(async (ex) => {
            try {
              const r = await getMyLatestExamResultApi(ex.ExamID);
              return [ex.ExamID, r.result || null];
            } catch (_) {
              return [ex.ExamID, null];
            }
          })
        );
        const map = Object.fromEntries(pairs);
        setLatestExamResults(map);
      } finally {
        setLoadingExams(false);
      }
    };
    load();
  }, [tabValue, isEnrolledInCourse, course?.CourseID]);

  const handleStartExam = async (exam) => {
    setActiveExam(exam);
    setExamResult(null);
    setAnswers({});
    try {
      const data = await getExamQuestionsApi(exam.ExamID);
      setExamQuestions(data.questions || []);
      setExamDialogOpen(true);
    } catch (_) {
      setExamQuestions([]);
      setExamDialogOpen(true);
    }
  };

  const handleChangeAnswer = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    try {
      setSubmittingExam(true);
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answer,
      }));
      const data = await submitExamApi(activeExam.ExamID, payload);
      setExamResult(data.result || null);
      // remember latest result for this exam in this session
      if (data.result) {
        setLatestExamResults((prev) => ({ ...prev, [activeExam.ExamID]: data.result }));
      }
    } finally {
      setSubmittingExam(false);
    }
  };

  const handleCloseExamDialog = () => {
    setExamDialogOpen(false);
    setActiveExam(null);
    setExamQuestions([]);
    setAnswers({});
    setExamResult(null);
  };
  console.log(courseMaterials);

  // Enrollment dialog handlers
  const handleOpenEnrollDialog = async () => {
    try {
      if (isEnrolledInCourse) {
        setEnrollError("Bạn đã đăng ký khóa học này.");
        return;
      }
      setLoadingClasses(true);
      const data = await getClassesByCourseApi(course.CourseID);
      setClasses(data.classes || []);
      setEnrollDialog(true);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setEnrollError("Không thể tải danh sách lớp học");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedClass) {
      setEnrollError("Vui lòng chọn một lớp học");
      return;
    }
    if (isEnrolledInCourse) {
      setEnrollError("Bạn đã đăng ký khóa học này.");
      return;
    }

    try {
      setEnrolling(true);
      setEnrollError(null);

      const { paymentUrl } = await createPaymentLinkApi(selectedClass.ClassID);
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
        <Alert severity="warning">Course not found. Please try again.</Alert>
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
      <AppHeader />
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
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", mb: 2 }}
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
                sx={{ opacity: 0.9, mb: 3, maxWidth: 600 }}
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

                  {!isEnrolledInCourse && (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleOpenEnrollDialog}
                      startIcon={<Payment />}
                      sx={{ mb: 2, py: 1.5, fontWeight: 600 }}
                    >
                      Enroll Now
                    </Button>
                  )}

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
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PlayCircle color="primary" sx={{ mr: 1 }} />
                        <Typography>
                          {course.UnitCount || 0} learning units
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTime color="primary" sx={{ mr: 1 }} />
                        <Typography>Lifetime access</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <WorkspacePremium color="primary" sx={{ mr: 1 }} />
                        <Typography>Certificate of completion</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Language color="primary" sx={{ mr: 1 }} />
                        <Typography>English subtitles</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Course Content - Tabs */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="course information tabs"
        >
          <Tab label="Curriculum" />
          <Tab label="Instructor" />
          <Tab label="Reviews" />
          {isEnrolledInCourse && <Tab label="Materials" />}
          {isEnrolledInCourse && <Tab label="Exam" />}
        </Tabs>

        <Divider />

        {/* Curriculum Tab (Course → Unit only) */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Lộ trình học
          </Typography>

          {loadingCurriculum || loadingCurriculumData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {curriculum.length === 0 ? (
                <Alert severity="info">
                  Chưa có chương trình học cho khóa này.
                </Alert>
              ) : (
                <Card>
                  <CardContent>
                    {curriculum.map((unit) => (
                      <Accordion key={unit.UnitID} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              width: "100%",
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {unit.Title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {unit.Description}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {!unit.Lessons || unit.Lessons.length === 0 ? (
                            <Alert severity="info">
                              Chưa có bài học trong unit này.
                            </Alert>
                          ) : (
                            <List dense>
                              {unit.Lessons.map((lesson, index) => (
                                <ListItem
                                  key={lesson.LessonID}
                                  sx={{ py: 0.5 }}
                                  secondaryAction={
                                    isEnrolledInCourse && lesson.FileURL ? (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() =>
                                          handleViewMaterial(lesson)
                                        }
                                      >
                                        Xem
                                      </Button>
                                    ) : null
                                  }
                                >
                                  <ListItemIcon>
                                    {getFileIcon(lesson.Type)}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={`${index + 1}. ${lesson.Title}`}
                                    secondary={[
                                      lesson.Type
                                        ? `Loại: ${lesson.Type}`
                                        : null,
                                      Number.isFinite(lesson.Time)
                                        ? `Thời lượng: ${lesson.Time} phút`
                                        : null,
                                    ]
                                      .filter(Boolean)
                                      .join(" • ")}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabPanel>

        {/* Materials Tab (chỉ hiển thị khi đã enroll) */}
        {isEnrolledInCourse && (
          <TabPanel value={tabValue} index={3}>
            {materialsError && <Alert severity="error">{materialsError}</Alert>}
            {loadingMaterials ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : courseMaterials.length === 0 ? (
              <Alert severity="info">Chưa có tài liệu cho khóa học này.</Alert>
            ) : (
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <List>
                    {courseMaterials.map((m) => (
                      <ListItem
                        key={m.MaterialID}
                        sx={{
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:last-child": { borderBottom: "none" },
                          py: 1.5,
                        }}
                        secondaryAction={
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => handleDownloadMaterial(m)}
                          >
                            Tải xuống
                          </Button>
                        }
                      >
                        <ListItemIcon>{getFileIcon(m.FileType)}</ListItemIcon>
                        <ListItemText
                          primary={m.Title}
                          secondary={
                            m.FileType ? m.FileType.toUpperCase() : "File"
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </TabPanel>
        )}

        {/* Exam Tab (chỉ hiển thị khi đã enroll) */}
        {isEnrolledInCourse && (
          <TabPanel value={tabValue} index={4}>
            {loadingExams ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : exams.length === 0 ? (
              <Alert severity="info">
                Chưa có bài kiểm tra cho khóa học này.
              </Alert>
            ) : (
              <Card>
                <CardContent>
                  <List>
                    {exams.map((ex) => (
                      <ListItem
                        key={ex.ExamID}
                        secondaryAction={
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            {latestExamResults[ex.ExamID] && (
                              <Chip
                                color="success"
                                size="small"
                                label={`Điểm: ${latestExamResults[ex.ExamID].Score ?? latestExamResults[ex.ExamID].score}%`}
                              />
                            )}
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleStartExam(ex)}
                            >
                              {latestExamResults[ex.ExamID] ? "Làm lại" : "Bắt đầu"}
                            </Button>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={ex.Title}
                          secondary={`${ex.Description || ""}`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Exam content moved to modal */}
                </CardContent>
              </Card>
            )}
          </TabPanel>
        )}
      </Container>

      {/* Enrollment Dialog */}
      <Dialog
        open={enrollDialog}
        onClose={() => !enrolling && setEnrollDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <School color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chọn lớp học
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {enrollError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {enrollError}
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>
            Chọn lớp học bạn muốn tham gia:
          </Typography>

          {loadingClasses ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : classes.length === 0 ? (
            <Alert severity="info">
              Không có lớp học nào cho khóa học này.
            </Alert>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: "auto", mb: 2 }}>
              {classes.map((classItem) => (
                <Card
                  key={classItem.ClassID}
                  sx={{
                    mb: 2,
                    cursor: "pointer",
                    border: 2,
                    borderColor:
                      selectedClass?.ClassID === classItem.ClassID
                        ? "primary.main"
                        : "grey.300",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                  onClick={() => setSelectedClass(classItem)}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                      <Box>
                        {selectedClass?.ClassID === classItem.ClassID ? (
                          <RadioButtonChecked color="primary" />
                        ) : (
                          <RadioButtonUnchecked />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          {classItem.ClassName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Giảng viên: {classItem.InstructorName}
                        </Typography>

                        {classItem.ScheduleDates && (
                          <Box sx={{ mb: 1 }}>
                            <Chip
                              icon={<Schedule />}
                              label={`Lịch: ${classItem.ScheduleDates}`}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({classItem.TotalSessions} buổi học)
                            </Typography>
                          </Box>
                        )}

                        {classItem.ZoomURL && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              icon={<VideoCall />}
                              label="Có Zoom"
                              size="small"
                              color="primary"
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEnrollDialog(false);
              setSelectedClass(null);
            }}
            disabled={enrolling}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleEnroll}
            disabled={enrolling || !selectedClass || loadingClasses}
            sx={{ minWidth: 140 }}
            startIcon={enrolling ? <CircularProgress size={16} /> : <Payment />}
          >
            {enrolling ? "Đang chuyển hướng..." : "Tiến hành thanh toán"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Material Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InsertDriveFile color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {previewItem?.Title || "Xem tài liệu"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {!previewItem ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ width: "100%" }}>
              {(() => {
                const type = (
                  previewItem.FileType ||
                  previewItem.Type ||
                  ""
                ).toLowerCase();
                const url = previewItem.FileURL;
                if (type === "video" || type === "mp4") {
                  return (
                    <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                      >
                        <ReactPlayer
                          url={url}
                          width="100%"
                          height="100%"
                          controls
                          playing={false}
                        />
                      </Box>
                    </Box>
                  );
                }
                return (
                  <Alert severity="info">
                    Không hỗ trợ xem trực tiếp loại tài liệu này. Vui lòng tải
                    xuống để xem.
                  </Alert>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {previewItem?.FileURL && (
            <Button onClick={() => handleDownloadMaterial(previewItem)}>
              Tải xuống
            </Button>
          )}
          <Button variant="contained" onClick={handleClosePreview}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exam Dialog */}
      <Dialog
        open={examDialogOpen}
        onClose={handleCloseExamDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {activeExam ? activeExam.Title : "Bài kiểm tra"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {!activeExam ? (
            <Alert severity="info">Chưa chọn bài kiểm tra.</Alert>
          ) : examQuestions.length === 0 ? (
            <Alert severity="info">Chưa có câu hỏi.</Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {examQuestions.map((q, idx) => {
                const current = answers[q.QuestionID] || "";
                return (
                  <Paper key={q.QuestionID} elevation={0} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>
                      {idx + 1}. {q.Content}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      variant="outlined"
                      placeholder="Nhập câu trả lời của bạn..."
                      value={current}
                      onChange={(e) => handleChangeAnswer(q.QuestionID, e.target.value)}
                      helperText={`${current.length} ký tự`}
                    />
                  </Paper>
                );
              })}
              {examResult && (
                <Alert severity="success">
                  Điểm: {examResult.Score ?? examResult.score}% • {examResult.Feedback ?? examResult.feedback}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExamDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmitExam}
            disabled={submittingExam || !activeExam || examQuestions.length === 0}
          >
            {submittingExam ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default CourseDetailPage;
