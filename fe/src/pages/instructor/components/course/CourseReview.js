import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  IconButton,
  Dialog,
  AppBar,
  Toolbar,
  Container,
  Grid,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import CheckIcon from "@mui/icons-material/Check";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";

const getLessonDuration = (lesson) => {
  if (!lesson) return 0;
  const val = lesson.Duration ?? lesson.Time ?? 0;
  return Number(val) || 0;
};

export default function CourseReview({ course, onClose }) {
  const [expandedUnits, setExpandedUnits] = useState([]);

  if (!course) return null;

  const {
    Title,
    Description,
    Image,
    Duration,
    Level,
    Status,
    Ojectives,
    Requirements,
    Category,
    Rating,
    RatingCount,
    StudentCount,
    InstructorName,
  } = course;

  // units/lessons
  const rawUnits = course.units || course.Units || [];
  const units = Array.isArray(rawUnits) ? rawUnits : [];

  const totalLessons = units.reduce(
    (sum, u) => sum + ((u.lessons || u.Lessons || []).length || 0),
    0
  );

  const totalMinutes = units.reduce((sum, u) => {
    const lessons = u.lessons || u.Lessons || [];
    return sum + lessons.reduce((s, l) => s + getLessonDuration(l), 0);
  }, 0);

  const totalHours =
    totalMinutes && totalMinutes > 0
      ? { h: Math.floor(totalMinutes / 60), m: totalMinutes % 60 }
      : null;

  const objectiveItems =
    typeof Ojectives === "string" && Ojectives.trim()
      ? Ojectives.split(/\r?\n|\. |- /).filter((s) => s.trim().length > 3)
      : [];

  const instructorDisplayName = InstructorName || "Giảng viên chưa đặt tên";

  return (
    <Dialog
      fullScreen
      open={Boolean(course)}
      onClose={onClose}
      sx={{ "& .MuiDialog-paper": { bgcolor: "#f8f9fa" } }}
    >
      {/* Header */}
      <AppBar
        elevation={0}
        sx={{
          position: "sticky",
          bgcolor: "#1c1d1f",
          borderBottom: "1px solid #3e4143",
        }}
      >
        <Toolbar>
          <Typography variant="body2" sx={{ flexGrow: 1, color: "#ccc" }}>
            {Category || "Khóa học"} {Level ? `• Level: ${Level}` : ""}{" "}
            {Status ? `• Status: ${Status}` : ""}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={8}>
            {/* Title Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, mb: 1, color: "#1c1d1f" }}
              >
                {Title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: "#2d2f31" }}>
                {Description}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                {Level && (
                  <Chip
                    label={`Trình độ: ${Level}`}
                    size="small"
                    sx={{
                      bgcolor: "#eceb98",
                      color: "#3d3c0a",
                      fontWeight: 600,
                    }}
                  />
                )}
                {Status && (
                  <Chip
                    label={`Trạng thái: ${Status}`}
                    size="small"
                    sx={{
                      bgcolor: "#d1fae5",
                      color: "#065f46",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ fontWeight: 700, color: "#b4690e" }}>
                    {Rating ? Rating.toFixed(1) : "5.0"}
                  </Typography>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} sx={{ fontSize: 16, color: "#b4690e" }} />
                  ))}
                  <Typography
                    variant="body2"
                    sx={{ color: "#6a6f73", ml: 0.5 }}
                  >
                    ({(RatingCount || 0).toLocaleString()} đánh giá)
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#6a6f73" }}>
                  {(StudentCount || 0).toLocaleString()} học viên
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ mt: 1, color: "#6a6f73" }}>
                Được tạo bởi <strong>{instructorDisplayName}</strong>
              </Typography>
              {Duration && (
                <Typography variant="body2" sx={{ color: "#6a6f73" }}>
                  Tổng thời lượng: {Duration} giờ
                </Typography>
              )}
            </Box>

            {/* Course Content Summary / Objectives */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid #d1d7dc",
                borderRadius: 0,
                p: 3,
                mb: 3,
                bgcolor: "#fff",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Bạn sẽ học được gì?
              </Typography>

              {objectiveItems.length > 0 ? (
                <Grid container spacing={1}>
                  {objectiveItems.map((text, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                      >
                        <CheckIcon
                          sx={{ fontSize: 18, color: "#1c1d1f", mt: 0.2 }}
                        />
                        <Typography variant="body2" sx={{ color: "#2d2f31" }}>
                          {text}
                        </Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" sx={{ color: "#6a6f73" }}>
                  Chưa có mục tiêu cụ thể (Objectives).
                </Typography>
              )}

              {Requirements && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Yêu cầu đầu vào
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "#2d2f31", whiteSpace: "pre-line" }}
                  >
                    {Requirements}
                  </Typography>
                </>
              )}
            </Paper>

            {/* Course Sections */}
            <Paper
              elevation={0}
              sx={{ border: "1px solid #d1d7dc", borderRadius: 0 }}
            >
              <Box sx={{ p: 2, bgcolor: "#f7f9fa" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Nội dung khóa học
                </Typography>
                <Typography variant="body2" sx={{ color: "#6a6f73", mt: 0.5 }}>
                  {units.length} phần • {totalLessons} bài giảng
                  {totalHours && (
                    <>
                      {" "}
                      • {totalHours.h}g {totalHours.m}p tổng thời lượng
                    </>
                  )}
                </Typography>
              </Box>

              {units.slice(0, 10).map((unit, idx) => {
                const lessons = unit.lessons || unit.Lessons || [];
                const unitMinutes = lessons.reduce(
                  (s, l) => s + getLessonDuration(l),
                  0
                );
                const unitKey = unit.UnitID || idx;

                return (
                  <Accordion
                    key={unitKey}
                    expanded={expandedUnits.includes(unitKey)}
                    onChange={() =>
                      setExpandedUnits((prev) =>
                        prev.includes(unitKey)
                          ? prev.filter((id) => id !== unitKey)
                          : [...prev, unitKey]
                      )
                    }
                    disableGutters
                    sx={{
                      "&:before": { display: "none" },
                      borderTop: "1px solid #d1d7dc",
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ width: "100%" }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>
                          {unit.Title || `Section ${idx + 1}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#6a6f73", mr: 2 }}
                        >
                          {lessons.length} bài giảng
                          {unitMinutes > 0 && ` • ${unitMinutes} phút`}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <List sx={{ py: 0 }}>
                        {lessons.map((lesson, i) => (
                          <ListItemButton
                            key={lesson.LessonID || i}
                            sx={{
                              py: 1.5,
                              px: 3,
                              borderTop: "1px solid #f7f9fa",
                            }}
                          >
                            <SmartDisplayIcon
                              sx={{ mr: 2, color: "#6a6f73" }}
                            />
                            <ListItemText
                              primary={lesson.Title}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                            {getLessonDuration(lesson) > 0 && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#6a6f73" }}
                              >
                                {getLessonDuration(lesson)}p
                              </Typography>
                            )}
                          </ListItemButton>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                );
              })}

              {units.length === 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có nội dung (unit/lesson) nào cho khóa học này.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* RIGHT SIDEBAR */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                position: "sticky",
                top: 80,
                boxShadow:
                  "0 2px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {/* Chỉ hiển thị ảnh, không icon play, không label video */}
              <CardMedia
                component="img"
                height="200"
                image={
                  Image ||
                  "https://via.placeholder.com/800x450?text=Course+Image"
                }
                alt="preview"
              />

              <CardContent sx={{ p: 3 }}>
                {/* Không còn hiển thị giá */}

                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: "#a435f0",
                      "&:hover": { bgcolor: "#8710d8" },
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.5,
                    }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "#1c1d1f",
                      color: "#1c1d1f",
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.5,
                    }}
                  >
                    Mua ngay
                  </Button>
                </Stack>

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    color: "#6a6f73",
                    mb: 2,
                  }}
                >
                  Đảm bảo hoàn tiền trong 30 ngày
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
                  Khóa học này bao gồm:
                </Typography>

                <Stack spacing={1.5}>
                  {Duration && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CheckIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2">
                        {Duration} giờ nội dung học
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CheckIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      Truy cập trên mọi thiết bị
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CheckIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      Quyền truy cập trọn đời
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CheckIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      Giấy chứng nhận hoàn thành
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Dialog>
  );
}
