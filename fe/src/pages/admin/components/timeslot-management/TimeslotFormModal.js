import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Stack,
} from "@mui/material";

const defaultForm = {
  Day: "",
  StartTime: "",
  EndTime: "",
};

const TimeslotFormModal = ({
  open,
  mode = "create",
  dayOptions = [],
  initialData = defaultForm,
  submitting = false,
  error = "",
  onClose,
  onSubmit,
}) => {
  const [formValues, setFormValues] = useState(initialData);

  useEffect(() => {
    if (open) {
      setFormValues(initialData || defaultForm);
    }
  }, [initialData, open]);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(formValues);
  };

  const title = mode === "edit" ? "Chỉnh sửa ca học" : "Thêm ca học mới";
  const submitLabel = mode === "edit" ? "Cập nhật ca học" : "Thêm ca học";

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            select
            label="Thứ"
            value={formValues.Day}
            onChange={handleChange("Day")}
            required
            fullWidth
          >
            <MenuItem value="">-- Chọn thứ --</MenuItem>
            {dayOptions.map((day) => (
              <MenuItem key={day.value} value={day.value}>
                {day.label}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Giờ bắt đầu"
              type="time"
              value={formValues.StartTime}
              onChange={handleChange("StartTime")}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              required
              fullWidth
            />
            <TextField
              label="Giờ kết thúc"
              type="time"
              value={formValues.EndTime}
              onChange={handleChange("EndTime")}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              required
              fullWidth
            />
          </Stack>

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ textTransform: "none", color: "#64748b" }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          sx={{
            textTransform: "none",
            backgroundColor: "#667eea",
            "&:hover": { backgroundColor: "#5568d3" },
          }}
        >
          {submitting ? "Đang lưu..." : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeslotFormModal;

