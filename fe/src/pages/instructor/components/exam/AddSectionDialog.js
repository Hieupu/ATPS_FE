import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const SECTION_TYPES = [
  { value: "Listening", label: "Listening" },
  { value: "Reading", label: "Reading" },
  { value: "Speaking", label: "Speaking" },
  { value: "Writing", label: "Writing" },
];

const AddSectionDialog = ({ open, onClose, onSave, isChild, editData, parentType }) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editData) {
        // Edit mode
        setFormData({
          title: editData.title || "",
          type: editData.type || "",
        });
      } else if (isChild && parentType) {
        // Child section - auto inherit parent type
        setFormData({
          title: "",
          type: parentType, // Kế thừa type từ parent
        });
      } else {
        // Create parent mode
        setFormData({
          title: "",
          type: "",
        });
      }
      setErrors({});
    }
  }, [open, editData, isChild, parentType]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = "Vui lòng chọn loại phần thi";
    }

    // Title required for parent, optional for child
    if (!isChild && !formData.title?.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc cho phần thi cha";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Auto-generate title for child if empty
    let finalTitle = formData.title;
    if (isChild && !finalTitle.trim()) {
      finalTitle = `Section ${Date.now()}`; // Will be replaced by orderIndex later
    }

    onSave({
      title: finalTitle,
      type: formData.type,
    });
  };

  const handleClose = () => {
    setFormData({ title: "", type: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editData ? "Chỉnh sửa phần thi" : isChild ? "Thêm phân mục" : "Thêm phần thi mới"}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Type Dropdown */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Loại phần thi *"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                error={Boolean(errors.type)}
                helperText={errors.type}
                disabled={isChild} // Child không được chọn type, kế thừa từ parent
              >
                {SECTION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isChild ? "Tiêu đề (Tùy chọn)" : "Tiêu đề *"}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                error={Boolean(errors.title)}
                helperText={
                  errors.title || 
                  (isChild 
                    ? "Ví dụ: Section 1, Part A, ..." 
                    : "Ví dụ: Listening Section, Reading Comprehension, ...")
                }
                placeholder={
                  isChild
                    ? "Để trống sẽ tự động đặt tên"
                    : "Nhập tiêu đề phần thi"
                }
              />
            </Grid>

            {/* Info box for child sections */}
            {isChild && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Lưu ý:
                  </Typography>
                  <Typography variant="body2">
                    • Phân mục này sẽ thuộc về phân mục cha đã chọn.
                  </Typography>
                  <Typography variant="body2">
                    • Bạn có thể kéo–thả để sắp xếp thứ tự sau khi tạo.
                  </Typography>
                  <Typography variant="body2">
                    • Loại phần thi được tự động kế thừa từ phân mục cha.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Info box for parent sections */}
            {!isChild && !editData && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Sau khi tạo phần thi, bạn có thể kéo thả để sắp xếp thứ tự
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="large">
          Hủy
        </Button>
        <Button onClick={handleSave} variant="contained" size="large">
          {editData ? "Lưu" : "Thêm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSectionDialog;