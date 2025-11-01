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
  Avatar,
  Stack,
  Collapse,
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
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const fmtCurrency = (n) =>
  typeof n === "number" ? n.toLocaleString("vi-VN") + " ₫" : "0 ₫";

export default function CourseReview({ course, onClose }) {
  const [expandedUnits, setExpandedUnits] = useState([]);
  const safe = course ?? {};

  const {
    Title,
    Description,
    Fee,
    Category,
    Rating,
    RatingCount,
    StudentCount,
    InstructorName,
    InstructorAvatar,
    Image,
    Tags = [],
    units = [],
    materials = [],
  } = safe;

  const totalLessons = units.reduce(
    (sum, u) => sum + (u.lessons?.length || 0),
    0
  );
  const totalHours = units.reduce(
    (sum, u) =>
      sum + u.lessons?.reduce((s, l) => s + Number(l.Time || 0), 0) || 0,
    0
  );

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
            CNTT & Phần mềm › {Category || "Docker"}
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
                <Chip
                  label="Xếp hạng cao nhất"
                  size="small"
                  sx={{ bgcolor: "#eceb98", color: "#3d3c0a", fontWeight: 600 }}
                />
                <Chip
                  label="Thịnh hành & mới"
                  size="small"
                  sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600 }}
                />
              </Stack>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ fontWeight: 700, color: "#b4690e" }}>
                    {Rating?.toFixed(1) || "5.0"}
                  </Typography>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} sx={{ fontSize: 16, color: "#b4690e" }} />
                  ))}
                  <Typography
                    variant="body2"
                    sx={{ color: "#6a6f73", ml: 0.5 }}
                  >
                    ({RatingCount?.toLocaleString() || "120"} đánh giá)
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#6a6f73" }}>
                  {StudentCount?.toLocaleString() || "1,658"} học viên
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ mt: 1, color: "#6a6f73" }}>
                Được tạo bởi <strong>{InstructorName || "PhatMVP"}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#6a6f73" }}>
                Lần cập nhật gần đây nhất 10/2025 • Tiếng Việt
              </Typography>
            </Box>

            {/* Course Content Summary */}
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
                Nội dung bài học
              </Typography>

              <Grid container spacing={1}>
                {[
                  "Hiểu rõ khái niệm Docker và sự khác biệt giữa Container và Virtual Machine",
                  "Cài đặt Docker trên Windows (WSL, Docker Desktop) và Ubuntu",
                  "Nắm vững kiến thức Docker: Docker CLI, Docker Host, Docker Registry",
                  "Thành thạo thao tác với Container: tạo, chạy, dừng, xoá, logs",
                  "Quản lý Docker Image: pull từ Docker Hub, inspect, xây và build image",
                  "Hiểu layered architecture và multi-stage build để tối ưu image",
                  "Quản lý dữ liệu với Docker Storage: volumes, bind mounts",
                  "Làm chủ Docker Networking: bridge, host và none",
                ].map((text, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
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

              <Button
                size="small"
                sx={{ mt: 2, textTransform: "none", fontWeight: 600 }}
              >
                Hiển thêm ▼
              </Button>
            </Paper>

            {/* Explore Topics */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Khám phá các chủ đề liên quan
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {["Docker", "CNTT & Phần mềm khác", "CNTT & Phần mềm"].map(
                  (tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="outlined"
                      sx={{ borderColor: "#1c1d1f", color: "#1c1d1f" }}
                    />
                  )
                )}
              </Stack>
            </Box>

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
                  {units.length} phần • {totalLessons} bài giảng •{" "}
                  {Math.floor(totalHours)}g {Math.round((totalHours % 1) * 60)}p
                  phút tổng thời lượng
                </Typography>
              </Box>

              {units.slice(0, 3).map((unit, idx) => (
                <Accordion
                  key={unit.UnitID || idx}
                  expanded={expandedUnits.includes(unit.UnitID)}
                  onChange={() =>
                    setExpandedUnits((prev) =>
                      prev.includes(unit.UnitID)
                        ? prev.filter((id) => id !== unit.UnitID)
                        : [...prev, unit.UnitID]
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
                        {unit.lessons?.length || 0} bài giảng •{" "}
                        {unit.lessons
                          ?.reduce((s, l) => s + Number(l.Time || 0), 0)
                          .toFixed(0)}{" "}
                        phút
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <List sx={{ py: 0 }}>
                      {unit.lessons?.map((lesson, i) => (
                        <ListItemButton
                          key={lesson.LessonID || i}
                          sx={{
                            py: 1.5,
                            px: 3,
                            borderTop: "1px solid #f7f9fa",
                          }}
                        >
                          <SmartDisplayIcon sx={{ mr: 2, color: "#6a6f73" }} />
                          <ListItemText
                            primary={lesson.Title}
                            primaryTypographyProps={{ variant: "body2" }}
                          />
                          {lesson.Time && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#6a6f73" }}
                            >
                              {lesson.Time}:00
                            </Typography>
                          )}
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
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
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    Image ||
                    "https://service.keyframe.vn/uploads/filecloud/2018/April/25/72-559201524659628-1524659628.jpg"
                  }
                  alt="preview"
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "rgba(0,0,0,0.6)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <PlayCircleOutlineIcon sx={{ fontSize: 56, color: "#fff" }} />
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.8)",
                    color: "#fff",
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  Xem trước khóa học này
                </Typography>
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  {fmtCurrency(Number(Fee || 779000))}
                </Typography>

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
                  {[
                    "9.5 giờ video theo yêu cầu",
                    "1 bài viết",
                    "8 tài nguyên có thể tải xuống",
                    "Truy cập trên thiết bị di động và TV",
                    "Quyền truy cập đầy đủ suốt đời",
                    "Giấy chứng nhận hoàn thành",
                  ].map((text, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <CheckIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2">{text}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Dialog>
  );
}
