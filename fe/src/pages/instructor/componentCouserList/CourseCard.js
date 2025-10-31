// src/pages/instructor/components/CourseCard.js
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  MoreHoriz as MoreHorizIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  MenuBook as BookIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import UnitAccordion from "./UnitAccordion";
import MaterialList from "./MaterialList";

export default function CourseCard({
  course,
  expandedCourse,
  units,
  lessons,
  materials,
  getStatusColor,
  onExpand,
  onOpenModal,
  onDeleteCourse,
  onSubmitCourse,
  onDeleteUnit,
  onDeleteLesson,
  onDeleteMaterial,
  selectedCourse,
  onPreview,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isExpanded = expandedCourse === course.CourseID;
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        bgcolor: "#ffffff",
        overflow: "hidden",
        "&:hover": {
          borderColor: "#d1d5db",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header Section */}
        <Box sx={{ px: 3, pt: 3.5, pb: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#111827",
                  mb: 1.5,
                  lineHeight: 1.4,
                  letterSpacing: "-0.01em",
                }}
              >
                {course.Title}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  lineHeight: 1.6,
                  mb: 2.5,
                }}
              >
                {course.Description}
              </Typography>

              {/* Meta Info Row */}
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <ScheduleIcon sx={{ fontSize: "1.1rem", color: "#9ca3af" }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.8125rem",
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    {course.Duration} giờ
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <MoneyIcon sx={{ fontSize: "1.1rem", color: "#9ca3af" }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.8125rem",
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    {Number(course.Fee).toLocaleString("vi-VN")} VND
                  </Typography>
                </Box>
              </Stack>

              {/* Status Badge */}
              <Chip
                label={course.Status}
                size="small"
                color={getStatusColor(course.Status)}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 26,
                  borderRadius: "8px",
                }}
              />
            </Box>

            {/* More Menu */}
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: "#6b7280",
                bgcolor: alpha("#000", 0.02),
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: alpha("#000", 0.06),
                  color: "#111827",
                },
              }}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1,
                  minWidth: 200,
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
                  "& .MuiMenuItem-root": {
                    px: 2,
                    py: 1.25,
                    borderRadius: "8px",
                    mx: 1,
                    my: 0.5,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onOpenModal("updateCourse", course);
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" sx={{ color: "#6366f1" }} />
                </ListItemIcon>
                <ListItemText>Chỉnh sửa khóa học</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onDeleteCourse(course.CourseID);
                }}
                sx={{ color: "#ef4444" }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
                </ListItemIcon>
                <ListItemText>Xóa khóa học</ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ px: 3, pb: 2.5 }}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              size="medium"
              startIcon={<VisibilityIcon sx={{ fontSize: "1.1rem" }} />}
              onClick={() => onPreview(course)}
              sx={{
                bgcolor: "#6366f1",
                color: "#fff",
                px: 2.5,
                py: 1,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.25)",
                "&:hover": {
                  bgcolor: "#4f46e5",
                  boxShadow: "0 6px 20px rgba(99, 102, 241, 0.35)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              Xem trước
            </Button>

            {course.Status === "draft" && (
              <Button
                variant="contained"
                size="medium"
                startIcon={<SendIcon sx={{ fontSize: "1rem" }} />}
                onClick={() => onSubmitCourse(course.CourseID)}
                sx={{
                  bgcolor: "#10b981",
                  color: "#fff",
                  px: 2.5,
                  py: 1,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
                  "&:hover": {
                    bgcolor: "#059669",
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.35)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Gửi phê duyệt
              </Button>
            )}

            <Button
              variant="outlined"
              size="medium"
              endIcon={isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
              onClick={() => onExpand(course.CourseID)}
              sx={{
                borderColor: "#d1d5db",
                color: "#374151",
                px: 2.5,
                py: 1,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                bgcolor: "#fff",
                "&:hover": {
                  borderColor: "#6366f1",
                  bgcolor: alpha("#6366f1", 0.04),
                  color: "#6366f1",
                },
                transition: "all 0.2s",
              }}
            >
              {isExpanded ? "Thu gọn" : "Chi tiết khóa học"}
            </Button>
          </Stack>
        </Box>

        {/* Expanded Content */}
        {isExpanded && (
          <Box
            sx={{
              borderTop: "1px solid #e5e7eb",
              bgcolor: alpha("#f9fafb", 0.5),
              px: 3,
              py: 3,
              animation: "slideDown 0.3s ease-out",
              "@keyframes slideDown": {
                from: {
                  opacity: 0,
                  transform: "translateY(-10px)",
                },
                to: {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {/* Units Section */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: alpha("#6366f1", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookIcon sx={{ fontSize: "1.25rem", color: "#6366f1" }} />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  Cấu trúc bài học
                </Typography>
              </Box>

              <UnitAccordion
                units={units}
                lessons={lessons}
                onOpenModal={onOpenModal}
                onEditUnit={(u) => onOpenModal("updateUnit", u)}
                onDeleteUnit={onDeleteUnit}
                onEditLesson={(l, unitId) =>
                  onOpenModal("updateLesson", { ...l, UnitID: unitId })
                }
                onDeleteLesson={onDeleteLesson}
              />
            </Box>

            {/* Materials Section */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: alpha("#10b981", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DescriptionIcon
                    sx={{ fontSize: "1.25rem", color: "#10b981" }}
                  />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  Tài liệu khóa học
                </Typography>
              </Box>

              <MaterialList
                materials={materials}
                onOpenModal={(type, data) =>
                  onOpenModal(type, { ...data, CourseID: course.CourseID })
                }
                onDeleteMaterial={onDeleteMaterial}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
