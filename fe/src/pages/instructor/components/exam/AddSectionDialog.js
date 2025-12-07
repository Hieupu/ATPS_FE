import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Typography,
  Box, IconButton, Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { cloudinaryUpload } from "../../../../utils/cloudinaryUpload";

const SECTION_TYPES = [
  { value: "Listening", label: "Listening" },
  { value: "Reading", label: "Reading" },
  { value: "Speaking", label: "Speaking" },
  { value: "Writing", label: "Writing" },
];

/** ⭐ Loại bỏ suffix Cloudinary (_abcxyz) để file nhìn đẹp hơn */
const cleanFileName = (url) => {
  if (!url) return "";
  const file = url.split("/").pop(); // ExamInstructor_bybcgr.docx
  const match = file.match(/(.+?)_\w+\.(\w+)$/);
  if (match) return `${match[1]}.${match[2]}`;
  return file;
};

/** ⭐ Tạo link preview (Google Docs Viewer cho file Word/PDF) */
const getPreviewUrl = (url) => {
  if (!url) return "";
  const ext = url.split(".").pop().toLowerCase();
  const docTypes = ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf"];

  if (docTypes.includes(ext)) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url; // media mở bình thường
};

const AddSectionDialog = ({ open, onClose, onSave, isChild, editData, parentType }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    fileURL: ""
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  /** Reset form khi mở dialog */
  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          title: editData.title || "",
          type: editData.type || "",
          fileURL: editData.fileURL || ""
        });
      } else if (isChild) {
        setFormData({
          title: "",
          type: parentType,
          fileURL: ""
        });
      } else {
        setFormData({
          title: "",
          type: "",
          fileURL: ""
        });
      }
      setErrors({});
    }
  }, [open, editData, isChild, parentType]);

  /** Validate */
  const validate = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = "Vui lòng chọn loại phần thi";
    if (!isChild && !formData.title.trim()) newErrors.title = "Tiêu đề là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Save dữ liệu */
  const handleSave = () => {
    if (!validate()) return;

    let title = formData.title.trim();
    if (isChild && !title) title = `Section ${Date.now()}`;

    onSave({
      title,
      type: formData.type,
      fileURL: formData.fileURL
    });
  };

  /** Upload file Cloudinary */
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await cloudinaryUpload(file, setUploading);
    if (url) {
      setFormData(prev => ({ ...prev, fileURL: url }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { p: 1.5 } }}>
      <DialogTitle>
        {editData ? "Chỉnh sửa phần thi" : isChild ? "Thêm phân mục" : "Thêm phần thi"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>

            {/* Loại phần thi */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Loại phần thi *"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                error={Boolean(errors.type)}
                helperText={errors.type}
                disabled={isChild}
              >
                {SECTION_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Tiêu đề */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isChild ? "Tiêu đề (tùy chọn)" : "Tiêu đề *"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={Boolean(errors.title)}
                helperText={
                  errors.title ||
                  (isChild ? "Nếu để trống hệ thống tự tạo tên" : "Nhập tiêu đề phần thi")
                }
              />
            </Grid>

            {/* Upload file cho SECTION CON */}
            {isChild && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tài liệu đính kèm
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  disabled={uploading}
                >
                  {uploading ? "Đang tải lên..." : "TẢI LÊN TÀI LIỆU"}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.mp3,.mp4"
                    onChange={handleFileSelect}
                  />
                </Button>

                {/* Hiển thị file đã upload */}
                {formData.fileURL && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      backgroundColor: "#fafafa",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* Click xem preview */}
                    <a
                      href={getPreviewUrl(formData.fileURL)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      📄 {cleanFileName(formData.fileURL)}
                    </a>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setFormData(prev => ({ ...prev, fileURL: "" }))}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Grid>
            )}

            {/* Info box */}
            <Grid item xs={12}>
              <Alert severity="info">
                {isChild
                  ? "Phân mục con kế thừa loại phần thi từ phân mục cha."
                  : "Bạn có thể thêm phân mục con sau khi tạo phần thi."}
              </Alert>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" disabled={uploading} onClick={handleSave}>
          {editData ? "Lưu" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSectionDialog;
