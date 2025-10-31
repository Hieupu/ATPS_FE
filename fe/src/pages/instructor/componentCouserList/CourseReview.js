import React, { useState, forwardRef } from "react";
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
  Slide,
  Container,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionIcon from "@mui/icons-material/Description";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CategoryIcon from "@mui/icons-material/Category";
import CloseIcon from "@mui/icons-material/Close";

// Transition cho Dialog
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CourseReview = ({ course, onClose }) => {
  // Giữ nguyên toàn bộ logic state
  const [expandedUnits, setExpandedUnits] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  if (!course) return null;

  const {
    Title,
    Description,
    Duration,
    Fee,
    Category,
    Level,
    InstructorName,
    units = [],
    materials = [],
  } = course;

  return (
    <Dialog
      fullScreen
      open={Boolean(course)}
      onClose={onClose}
      TransitionComponent={Transition}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#f8fafc",
        },
      }}
    >
      {/* AppBar cố định trên cùng */}
      <AppBar
        sx={{
          position: "fixed",
          backgroundColor: "#5b5bff",
          boxShadow: "0 2px 8px rgba(91, 91, 255, 0.15)",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            Xem trước khóa học
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Nội dung chính - có thể cuộn */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 10,
          mb: 4,
          px: { xs: 2, md: 3 },
        }}
      >
        {/* PHẦN 1: Thông tin tổng quan */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            mb: 3,
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              boxShadow: "0 6px 28px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ xs: "center", md: "flex-start" }}
            >
              {/* Ảnh khóa học */}
              <CardMedia
                component="img"
                sx={{
                  width: { xs: "100%", md: 320 },
                  height: { xs: 200, md: 200 },
                  borderRadius: 3,
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                image={
                  course.Image ||
                  "https://service.keyframe.vn/uploads/filecloud/2018/April/25/72-559201524659628-1524659628.jpg"
                }
                alt={Title}
              />

              {/* Thông tin khóa học */}
              <Box flex={1}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    color: "#5b5bff",
                    mb: 2,
                    fontSize: { xs: "1.75rem", md: "2.125rem" },
                  }}
                >
                  {Title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mb: 3,
                    lineHeight: 1.7,
                  }}
                >
                  {Description}
                </Typography>

                {/* Chips thông tin */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  flexWrap="wrap"
                  sx={{ gap: 1.5 }}
                >
                  <Chip
                    icon={<CategoryIcon />}
                    label={Category || "Chưa có danh mục"}
                    sx={{
                      backgroundColor: "#e8e8ff",
                      color: "#5b5bff",
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "#5b5bff" },
                    }}
                  />
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={`${Duration || 0} phút`}
                    sx={{
                      backgroundColor: "#fff4e6",
                      color: "#ff9800",
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "#ff9800" },
                    }}
                  />
                  <Chip
                    icon={<MonetizationOnIcon />}
                    label={`${Fee || 0} VNĐ`}
                    sx={{
                      backgroundColor: "#e8f5e9",
                      color: "#4caf50",
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "#4caf50" },
                    }}
                  />
                  <Chip
                    icon={<DescriptionIcon />}
                    label={Level || "Mọi trình độ"}
                    sx={{
                      backgroundColor: "#fce4ec",
                      color: "#e91e63",
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: "#e91e63" },
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* PHẦN 2: Thông tin giảng viên */}
        {InstructorName && (
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              mb: 3,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 28px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#5b5bff",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "1.25rem",
                }}
              >
                Giảng viên
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={course.InstructorAvatar || ""}
                  sx={{
                    width: 64,
                    height: 64,
                    border: "3px solid #5b5bff",
                  }}
                />
                <Box>
                  <Typography fontWeight={700} variant="h6" sx={{ mb: 0.5 }}>
                    {InstructorName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.InstructorBio || "Chưa có mô tả"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* PHẦN 3: Cấu trúc khóa học */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#5b5bff",
                fontWeight: 700,
                mb: 3,
                fontSize: "1.25rem",
              }}
            >
              Cấu trúc khóa học
            </Typography>

            {units.length > 0 ? (
              units.map((unit) => (
                <Accordion
                  key={unit.UnitID}
                  expanded={expandedUnits.includes(unit.UnitID)}
                  onChange={() => {
                    if (expandedUnits.includes(unit.UnitID)) {
                      setExpandedUnits(
                        expandedUnits.filter((id) => id !== unit.UnitID)
                      );
                    } else {
                      setExpandedUnits([...expandedUnits, unit.UnitID]);
                    }
                  }}
                  sx={{
                    mb: 2,
                    borderRadius: "12px !important",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    "&:before": {
                      display: "none",
                    },
                    "&.Mui-expanded": {
                      boxShadow: "0 4px 16px rgba(91, 91, 255, 0.15)",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#5b5bff" }} />}
                    sx={{
                      backgroundColor: "#fafbff",
                      borderRadius: "12px",
                      "&.Mui-expanded": {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                      },
                    }}
                  >
                    <Typography fontWeight={700} sx={{ color: "#1a1a1a" }}>
                      {unit.Title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    {unit.lessons?.length > 0 ? (
                      <List sx={{ py: 0 }}>
                        {unit.lessons.map((lesson, index) => (
                          <React.Fragment key={lesson.LessonID}>
                            <ListItemButton
                              onClick={() =>
                                setSelectedLesson(
                                  selectedLesson?.LessonID === lesson.LessonID
                                    ? null
                                    : lesson
                                )
                              }
                              sx={{
                                py: 2,
                                px: 3,
                                borderTop:
                                  index === 0 ? "none" : "1px solid #f0f0f0",
                                "&:hover": {
                                  backgroundColor: "#f8f9ff",
                                },
                                transition: "background-color 0.2s",
                              }}
                            >
                              <VideoLibraryIcon
                                sx={{
                                  color: "#5b5bff",
                                  mr: 2,
                                  fontSize: 22,
                                }}
                              />
                              <ListItemText
                                primary={
                                  <Typography fontWeight={600}>
                                    {lesson.Title}
                                  </Typography>
                                }
                                secondary={
                                  lesson.Time
                                    ? `${lesson.Time} phút`
                                    : "Không có thời lượng"
                                }
                              />
                            </ListItemButton>

                            {/* Chi tiết bài học khi được chọn */}
                            <Collapse
                              in={selectedLesson?.LessonID === lesson.LessonID}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Card
                                sx={{
                                  bgcolor: "#f9faff",
                                  mx: 3,
                                  mb: 2,
                                  p: 2.5,
                                  borderLeft: "4px solid #5b5bff",
                                  borderRadius: 2,
                                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                }}
                              >
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  Loại:{" "}
                                  <Box
                                    component="span"
                                    sx={{ fontWeight: 700, color: "#5b5bff" }}
                                  >
                                    {lesson.Type === "video"
                                      ? "Video"
                                      : lesson.Type === "file"
                                      ? "Tài liệu"
                                      : "Khác"}
                                  </Box>
                                </Typography>
                                {lesson.FileURL && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      mt: 1,
                                      color: "#5b5bff",
                                      borderColor: "#5b5bff",
                                      textTransform: "none",
                                      fontWeight: 600,
                                      "&:hover": {
                                        borderColor: "#4a4acc",
                                        backgroundColor: "#f8f9ff",
                                      },
                                    }}
                                    onClick={() =>
                                      window.open(lesson.FileURL, "_blank")
                                    }
                                  >
                                    👉 Xem nội dung
                                  </Button>
                                )}
                              </Card>
                            </Collapse>
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Chưa có bài học nào
                        </Typography>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có chương học nào
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* PHẦN 4: Tài liệu khóa học */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#5b5bff",
                fontWeight: 700,
                mb: 2,
                fontSize: "1.25rem",
              }}
            >
              Tài liệu khóa học
            </Typography>
            {materials.length > 0 ? (
              <List sx={{ py: 0 }}>
                {materials.map((m, index) => (
                  <ListItemButton
                    key={m.MaterialID}
                    onClick={() => window.open(m.FileURL, "_blank")}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: "1px solid #f0f0f0",
                      "&:hover": {
                        backgroundColor: "#fff4f5",
                        borderColor: "#ff4b5c",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    <PictureAsPdfIcon
                      sx={{ color: "#ff4b5c", mr: 2, fontSize: 24 }}
                    />
                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>{m.Title}</Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có tài liệu nào được thêm
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* PHẦN 5: Button đóng ở cuối */}
        <Box textAlign="center" sx={{ pb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onClose}
            sx={{
              backgroundColor: "#5b5bff",
              fontWeight: 700,
              px: 6,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 14px rgba(91, 91, 255, 0.3)",
              "&:hover": {
                backgroundColor: "#4a4acc",
                boxShadow: "0 6px 20px rgba(91, 91, 255, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s",
            }}
          >
            Đóng xem trước
          </Button>
        </Box>
      </Container>
    </Dialog>
  );
};

export default CourseReview;
