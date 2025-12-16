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

const cleanFileName = (url) => {
  if (!url) return "";
  const file = url.split("/").pop(); 
  const match = file.match(/(.+?)_\w+\.(\w+)$/);
  if (match) return `${match[1]}.${match[2]}`;
  return file;
};

const getPreviewUrl = (url) => {
  if (!url) return "";
  const ext = url.split(".").pop().toLowerCase();
  const docTypes = ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "pdf"];

  if (docTypes.includes(ext)) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }
  return url;
};

const AddSectionDialog = ({ open, onClose, onSave, isChild, editData, parentType }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    fileURL: ""
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
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
  const validate = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = "Vui lòng chọn loại phần bài tập";
    if (!isChild && !formData.title.trim()) newErrors.title = "Tiêu đề là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        {editData ? "Chỉnh sửa phần bài tập" : isChild ? "Thêm phân mục" : "Thêm phần bài tập"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Loại phần bài tập *"
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isChild ? "Tiêu đề (tùy chọn)" : "Tiêu đề *"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={Boolean(errors.title)}
                helperText={
                  errors.title ||
                  (isChild ? "Nếu để trống hệ thống tự tạo tên" : "Nhập tiêu đề phần bài tập")
                }
              />
            </Grid>
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
                      {cleanFileName(formData.fileURL)}
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
            <Grid item xs={12}>
              <Alert severity="info">
                {isChild
                  ? "Hãy tải tài liệu riêng cho phân mục nhỏ này."
                  : "Bạn có thể thêm phân mục nhỏ sau khi tạo phần bài tập."}
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
