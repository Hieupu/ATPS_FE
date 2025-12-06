import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const LEVEL_OPTIONS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const LEVEL_CONFIG = {
  BEGINNER: { label: "Beginner" },
  INTERMEDIATE: { label: "Intermediate" },
  ADVANCED: { label: "Advanced" },
};

export default function CourseHeader({
  course,
  onUpdateCourseMeta,
  onSubmitCourse,
}) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [values, setValues] = useState(() => ({
    Title: course.Title || "",
    Description: course.Description || "",
    Duration: course.Duration || "",
    Level: course.Level || "BEGINNER",
    Objectives: course.Objectives || "",
    Requirements: course.Requirements || "",
  }));

  const handleOpenEdit = () => {
    setValues({
      Title: course.Title || "",
      Description: course.Description || "",
      Duration: course.Duration || "",
      Level: course.Level || "BEGINNER",
      Objectives: course.Objectives || "",
      Requirements: course.Requirements || "",
    });
    setEditOpen(true);
  };

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    const payload = {
      ...values,
      Duration: values.Duration ? Number(values.Duration) : null,
    };
    try {
      await onUpdateCourseMeta(payload);
      setEditOpen(false);
    } catch (err) {
      // đã log ở trên, ở đây có thể thêm UI nếu muốn
    }
  };

  const handleBack = () => {
    navigate("/instructor/courses");
  };

  const canSubmit = course.Status === "DRAFT";

  const handleSubmitCourse = async () => {
    if (!window.confirm("Gửi khóa học này để duyệt?")) return;
    try {
      await onSubmitCourse();
    } catch (err) {
      // handle error UI nếu muốn
    }
  };

  const levelConfig = LEVEL_CONFIG[course.Level] || LEVEL_CONFIG.BEGINNER;

  const statusColorMap = {
    DRAFT: "default",
    IN_REVIEW: "warning",
    APPROVED: "success",
    PUBLISHED: "primary",
    DELETED: "error",
  };

  return (
    <>
      {/* Header Container */}
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2.5,
          mb: 3,
        }}
      >
        {/* Top Row: Back + Title + Status + Actions */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          {/* Left: Back + Title + Status */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              size="small"
              onClick={handleBack}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  bgcolor: "action.hover",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ color: "text.primary" }}
            >
              {course.Title}
            </Typography>

            <Chip
              label={course.Status}
              size="small"
              color={statusColorMap[course.Status] || "default"}
              sx={{
                fontWeight: 500,
                height: 24,
              }}
            />
          </Stack>

          {/* Right: Actions */}
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<EditIcon />}
              onClick={handleOpenEdit}
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Chỉnh sửa
            </Button>
            {canSubmit && (
              <Button
                variant="contained"
                size="medium"
                startIcon={<SendIcon />}
                onClick={handleSubmitCourse}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Gửi duyệt
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Bottom Row: Metadata (Level, Duration, Description) */}
        <Stack direction="row" spacing={4} alignItems="center" sx={{ pl: 6 }}>
          {/* Level */}
          <Stack direction="row" spacing={1} alignItems="center">
            <SignalCellularAltIcon
              sx={{ fontSize: 18, color: "text.secondary" }}
            />
            <Typography variant="body2" color="text.secondary">
              Cấp độ:
            </Typography>
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {levelConfig.label}
            </Typography>
          </Stack>

          {/* Duration */}
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Thời lượng:
            </Typography>
            <Typography variant="body2" fontWeight={500} color="text.primary">
              {course.Duration ? `${course.Duration} giờ` : "Chưa đặt"}
            </Typography>
          </Stack>

          {/* Description */}
          {course.Description && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: "500px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {course.Description}
              </Typography>
            </>
          )}
        </Stack>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Chỉnh sửa thông tin khóa học
          </Typography>
          <IconButton size="small" onClick={() => setEditOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 5,
            pb: 2,
            overflow: "visible",
          }}
        >
          <Stack spacing={3}>
            <TextField
              label="Tên khóa học"
              fullWidth
              value={values.Title}
              onChange={handleChange("Title")}
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Ví dụ: Lập trình React cho người mới bắt đầu"
            />

            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={4}
              value={values.Description}
              onChange={handleChange("Description")}
              placeholder="Mô tả chi tiết về nội dung, giá trị và đối tượng của khóa học..."
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Thời lượng (giờ)"
                type="number"
                fullWidth
                value={values.Duration}
                onChange={handleChange("Duration")}
                InputProps={{
                  inputProps: { min: 0, step: 0.5 },
                }}
              />
              <TextField
                select
                label="Cấp độ"
                fullWidth
                value={values.Level}
                onChange={handleChange("Level")}
              >
                {LEVEL_OPTIONS.map((lv) => (
                  <MenuItem key={lv} value={lv}>
                    {LEVEL_CONFIG[lv]?.label || lv}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              label="Mục tiêu học tập"
              fullWidth
              multiline
              minRows={4}
              value={values.Objectives}
              onChange={handleChange("Objectives")}
              placeholder={
                "Mục tiêu 1: Nắm được kiến thức cơ bản về...\n" +
                "Mục tiêu 2: Có thể thực hành xây dựng...\n" +
                "Mục tiêu 3: Ứng dụng vào dự án thực tế..."
              }
            />

            <TextField
              label="Yêu cầu tiên quyết"
              fullWidth
              multiline
              minRows={3}
              value={values.Requirements}
              onChange={handleChange("Requirements")}
              placeholder={
                "Đã làm quen với máy tính và internet\n" +
                "Có kiến thức cơ bản về HTML/CSS (không bắt buộc nhưng là một lợi thế)\n" +
                "Tinh thần tự học và thực hành đều đặn"
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setEditOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
