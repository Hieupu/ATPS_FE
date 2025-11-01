import React from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Chip,
  Button,
  Box,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import TimerIcon from "@mui/icons-material/Timer";

import UnitAccordion from "./UnitAccordion";
import MaterialList from "./MaterialList";

export default function CourseDialog({
  open,
  onClose,

  course,
  getStatusColor,
  getStatusLabel,

  units = [],
  lessonsByUnit = {},
  materials = [],

  onEditCourse,
  onSubmitCourse,
  onPreviewCourse,

  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
}) {
  if (!course) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* HEADER: CỐ ĐỊNH */}
      <AppBar
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "white",
          color: "#1e293b",
          borderBottom: "1px solid #e2e8f0",
          zIndex: (t) => t.zIndex.appBar,
        }}
      >
        <Toolbar>
          <SchoolIcon sx={{ mr: 2, color: "#5b5bff" }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Chi tiết khóa học
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            sx={{ "&:hover": { bgcolor: "#f1f5f9" } }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* BODY: CUỘN */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
        {/* Info */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}
              >
                {course.Title}
              </Typography>
              <Chip
                label={getStatusLabel(course.Status)}
                color={getStatusColor(course.Status)}
                size="small"
              />
            </Box>
            <Typography variant="h5" sx={{ color: "#5b5bff", fontWeight: 700 }}>
              {Number(course.Fee || 0).toLocaleString("vi-VN")}₫
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ color: "#64748b", mb: 2 }}>
            {course.Description}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TimerIcon sx={{ fontSize: 20, color: "#64748b" }} />
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {course.Duration} giờ
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEditCourse}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "#5b5bff",
                color: "#5b5bff",
              }}
            >
              Sửa khóa học
            </Button>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={onPreviewCourse}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "#10b981",
                color: "#10b981",
              }}
            >
              Xem trước
            </Button>
            {String(course.Status).toLowerCase() === "draft" && (
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={onSubmitCourse}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: "#5b5bff",
                }}
              >
                Gửi duyệt
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Units */}
        <UnitAccordion
          units={units}
          lessonsByUnit={lessonsByUnit}
          onAddUnit={onAddUnit}
          onEditUnit={onEditUnit}
          onDeleteUnit={onDeleteUnit}
          onAddLesson={onAddLesson}
          onEditLesson={onEditLesson}
          onDeleteLesson={onDeleteLesson}
        />

        <Divider sx={{ my: 3 }} />

        {/* Materials */}
        <MaterialList
          materials={materials}
          onAddMaterial={onAddMaterial}
          onEditMaterial={onEditMaterial}
          onDeleteMaterial={onDeleteMaterial}
        />
      </Box>
    </Dialog>
  );
}
