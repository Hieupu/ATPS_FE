import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ClassIcon from "@mui/icons-material/Class";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

// --- CẤU HÌNH DỊCH & MÀU SẮC ---

// 1. Dịch trạng thái sang tiếng Việt
const STATUS_LABELS = {
  DRAFT: "Bản nháp",
  IN_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PUBLISHED: "Đã xuất bản",
  DELETED: "Đã xóa",
};

// 2. Cấu hình màu sắc cho trạng thái
const STATUS_COLORS = {
  PUBLISHED: "success.main",
  IN_REVIEW: "warning.main",
  APPROVED: "info.main",
  DRAFT: "grey.700",
  DELETED: "error.main",
};

// 3. Dịch cấp độ sang tiếng Việt
const LEVEL_LABELS = {
  BEGINNER: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};

export default function CoursesCardList({
  courses,
  loading,
  onPreviewCourse,
  onViewClasses,
  onApprove,
  onReject,
  onPublish,
  onUnpublish,
  onRevert,
  getStatus,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCourse, setMenuCourse] = useState(null);

  const handleOpenMenu = (event, course) => {
    setAnchorEl(event.currentTarget);
    setMenuCourse(course);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuCourse(null);
  };

  if (loading) {
    return <Typography>Đang tải danh sách khóa học...</Typography>;
  }

  if (!courses || courses.length === 0) {
    return <Typography>Chưa có khóa học nào.</Typography>;
  }

  return (
    <>
      <Grid container spacing={2}>
        {courses.map((course) => {
          // Xử lý cả PascalCase và camelCase từ backend
          const CourseID = course.CourseID || course.courseId || course.id;
          const Title =
            course.Title || course.title || course.name || course.Name;
          const Description = course.Description || course.description;
          const Image = course.Image || course.image || course.thumbnail;
          const Duration = course.Duration ?? course.duration ?? 0;
          const Objectives = course.Objectives || course.objectives;
          const Requirements = course.Requirements || course.requirements;
          const Level = course.Level || course.level;
          const Status = course.Status || course.status;
          const Code = course.Code || course.code;
          const UnitCount =
            course.UnitCount ?? course.unitCount ?? course.units ?? 0;
          const LessonCount =
            course.LessonCount ?? course.lessonCount ?? course.lessons ?? 0;
          const MaterialMissingCount =
            course.MaterialMissingCount ??
            course.materialMissingCount ??
            course.missingMaterials ??
            0;

          const units = UnitCount ?? 0;
          const lessons = LessonCount ?? 0;
          const missingMaterials = MaterialMissingCount ?? 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={CourseID}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: "hidden",
                  transform: "none",
                  transition: "none",
                }}
              >
                {/* IMAGE TRÊN ĐẦU */}
                <Box sx={{ position: "relative" }}>
                  {Image ? (
                    <CardMedia
                      component="img"
                      height="150"
                      image={Image}
                      alt={Title}
                      sx={{ objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 150,
                        bgcolor: "grey.200",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Không có ảnh
                      </Typography>
                    </Box>
                  )}

                  {/* CHIP TRẠNG THÁI (Đã sửa hiển thị tiếng Việt) */}
                  {Status && (
                    <Chip
                      size="small"
                      // Lấy text tiếng Việt từ STATUS_LABELS, nếu không có thì hiện nguyên gốc
                      label={STATUS_LABELS[Status] || Status}
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        // Lấy màu từ STATUS_COLORS
                        backgroundColor: STATUS_COLORS[Status] || "grey.700",
                        color: "#fff",
                      }}
                    />
                  )}

                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.55)" },
                    }}
                    onClick={(e) => handleOpenMenu(e, course)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Title + Level + Code */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box sx={{ pr: 1, maxWidth: "70%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={Title}
                      >
                        {Title}
                      </Typography>

                      {Code && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          title={Code}
                        >
                          Mã khóa học: {Code}
                        </Typography>
                      )}
                    </Box>

                    {/* CHIP CẤP ĐỘ (Đã sửa hiển thị tiếng Việt) */}
                    {Level && (
                      <Chip
                        size="small"
                        // Lấy text tiếng Việt từ LEVEL_LABELS
                        label={LEVEL_LABELS[Level] || Level}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {/* Description */}
                  {Description && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: "text.secondary",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      title={Description}
                    >
                      {Description}
                    </Typography>
                  )}

                  {(Duration || Duration === 0) && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.75, display: "block" }}
                      color="text.secondary"
                    >
                      ⏱ Thời lượng: {Duration} giờ
                    </Typography>
                  )}

                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 1 }}
                    alignItems="center"
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MenuBookIcon fontSize="small" />
                      <Typography variant="caption">{units} unit</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MenuOpenIcon fontSize="small" />
                      <Typography variant="caption">
                        {lessons} lesson
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <DescriptionIcon fontSize="small" />
                      <Typography variant="caption">
                        {missingMaterials} material
                      </Typography>
                    </Stack>
                  </Stack>

                  {(Objectives || Requirements) && (
                    <Box sx={{ mt: 1 }}>
                      {Objectives && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={Objectives}
                        >
                          🎯 <b>Mục tiêu:</b> {Objectives}
                        </Typography>
                      )}
                      {Requirements && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={Requirements}
                        >
                          📌 <b>Yêu cầu:</b> {Requirements}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {missingMaterials > 0 && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ mt: 0.75 }}
                    >
                      <WarningAmberIcon fontSize="inherit" color="warning" />
                      <Typography variant="caption" color="warning.main">
                        Còn {missingMaterials} lesson chưa có tài liệu.
                      </Typography>
                    </Stack>
                  )}

                  {/* Action Buttons for IN_REVIEW Courses */}
                  {getStatus && getStatus(course) === "IN_REVIEW" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() =>
                          onApprove && onApprove(course, "APPROVE")
                        }
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          backgroundColor: "#10b981",
                          "&:hover": {
                            backgroundColor: "#059669",
                          },
                        }}
                      >
                        Duyệt
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => onReject && onReject(course, "REJECT")}
                        sx={{
                          textTransform: "none",
                          borderColor: "#ef4444",
                          color: "#ef4444",
                          "&:hover": {
                            borderColor: "#dc2626",
                            backgroundColor: "#fef2f2",
                          },
                        }}
                      >
                        Từ chối
                      </Button>
                    </Box>
                  )}

                  {/* Action Buttons for APPROVED Courses */}
                  {getStatus && getStatus(course) === "APPROVED" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => onPublish && onPublish(course)}
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          backgroundColor: "#667eea",
                          "&:hover": {
                            backgroundColor: "#5568d3",
                          },
                        }}
                      >
                        Công khai
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => onRevert && onRevert(course)}
                        sx={{
                          textTransform: "none",
                          borderColor: "#f59e0b",
                          color: "#f59e0b",
                          "&:hover": {
                            borderColor: "#d97706",
                            backgroundColor: "#fef3c7",
                          },
                        }}
                      >
                        Về nháp
                      </Button>
                    </Box>
                  )}

                  {/* Action Buttons for PUBLISHED Courses */}
                  {getStatus && getStatus(course) === "PUBLISHED" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => onUnpublish && onUnpublish(course)}
                        sx={{
                          flex: 1,
                          textTransform: "none",
                          borderColor: "#06b6d4",
                          color: "#06b6d4",
                          "&:hover": {
                            borderColor: "#0891b2",
                            backgroundColor: "#cffafe",
                          },
                        }}
                      >
                        Hủy công khai
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {menuCourse
          ? [
              <MenuItem
                key="preview"
                onClick={() => {
                  onPreviewCourse && onPreviewCourse(menuCourse);
                  handleCloseMenu();
                }}
              >
                <VisibilityIcon fontSize="small" style={{ marginRight: 8 }} />
                Xem trước khóa học
              </MenuItem>,
              <MenuItem
                key="view-classes"
                onClick={() => {
                  onViewClasses && onViewClasses(menuCourse);
                  handleCloseMenu();
                }}
              >
                <ClassIcon fontSize="small" style={{ marginRight: 8 }} />
                Xem lớp học
              </MenuItem>,
            ]
          : null}
      </Menu>
    </>
  );
}
