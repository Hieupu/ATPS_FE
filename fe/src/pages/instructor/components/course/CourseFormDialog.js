import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

const LEVEL_OPTIONS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function CourseFormDialog({
  open,
  onClose,
  title,
  mode = "create",
  initialValues,
  onSubmit,
}) {
  const [values, setValues] = useState({
    Title: "",
    Description: "",
    Image: "",
    Duration: "",
    Objectives: "",
    Requirements: "",
    Level: "BEGINNER",
    Status: "DRAFT",
    ImageFile: null,
    _localPreview: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    setIsSubmitting(false);
    if (initialValues) {
      // EDIT
      setValues((prev) => ({
        ...prev,
        ...initialValues,
        ImageFile: null,
        _localPreview: "",
      }));
    } else {
      // CREATE
      setValues({
        Title: "",
        Description: "",
        Image: "",
        Duration: "",
        Objectives: "",
        Requirements: "",
        Level: "BEGINNER",
        Status: "DRAFT",
        ImageFile: null,
        _localPreview: "",
      });
    }
  }, [initialValues, open]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        Duration: values.Duration ? Number(values.Duration) : null,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? null : onClose}
      maxWidth="md" // 🔥 rộng hơn "sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Tên khóa học */}
          <TextField
            label="Tên khóa học"
            value={values.Title}
            onChange={handleChange("Title")}
            fullWidth
            required
            placeholder="Ví dụ: Lập trình React cho người mới bắt đầu"
            disabled={isSubmitting}
          />

          <TextField
            label="Mô tả"
            value={values.Description}
            onChange={handleChange("Description")}
            fullWidth
            multiline
            minRows={4}
            placeholder="Mô tả chi tiết về nội dung, giá trị và đối tượng học viên của khóa học..."
            disabled={isSubmitting}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Ảnh khóa học
            </Typography>

            <Box
              sx={{
                border: "2px dashed #ccc",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                position: "relative",
                bgcolor: "grey.50",
              }}
            >
              {values.Image || values._localPreview ? (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={values._localPreview || values.Image}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 250,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Chưa có ảnh — Hãy chọn ảnh để xem trước
                </Typography>
              )}

              <Button
                variant="outlined"
                component="label"
                disabled={isSubmitting}
                sx={{ fontWeight: 600 }}
              >
                Chọn ảnh
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const previewURL = URL.createObjectURL(file);

                    setValues((prev) => ({
                      ...prev,
                      ImageFile: file,
                      _localPreview: previewURL,
                    }));
                  }}
                />
              </Button>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Thời lượng (giờ)"
              value={values.Duration}
              onChange={handleChange("Duration")}
              type="number"
              fullWidth
              disabled={isSubmitting}
              InputProps={{ inputProps: { min: 0, step: 0.5 } }}
            />
            <TextField
              select
              label="Cấp độ"
              value={values.Level}
              onChange={handleChange("Level")}
              fullWidth
              disabled={isSubmitting}
            >
              {LEVEL_OPTIONS.map((lv) => (
                <MenuItem key={lv} value={lv}>
                  {lv}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Mục tiêu học tập"
            value={values.Objectives}
            onChange={handleChange("Objectives")}
            fullWidth
            multiline
            minRows={4}
            placeholder={
              "Mục tiêu 1: Nắm được kiến thức cơ bản về...\n" +
              "Mục tiêu 2: ..."
            }
            disabled={isSubmitting}
          />

          <TextField
            label="Yêu cầu tiên quyết"
            value={values.Requirements}
            onChange={handleChange("Requirements")}
            fullWidth
            multiline
            minRows={3}
            placeholder={"Đã làm quen với máy tính và internet\n" + "..."}
            disabled={isSubmitting}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none" }}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isSubmitting
            ? "Đang xử lý..."
            : isEdit
            ? "Cập nhật"
            : "Tạo khóa học"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
