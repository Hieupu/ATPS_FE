import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";

/**
 * Generic dialog for selecting a target class to transfer to.
 * Reusable between RefundPage and other admin flows (e.g. StudentSelector).
 */
const ChangeClassDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  error = "",
  options = [],
  selectedClass = null,
  onSelectClass,
  title = "Chọn lớp chuyển",
  getScheduleSummary, // optional: (cls) => string
}) => {
  const handleSelect = (cls) => {
    if (loading) return;
    if (onSelectClass) {
      onSelectClass(cls);
    }
  };

  const handleConfirm = () => {
    if (loading) return;
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (loading) return;
    if (onClose) {
      onClose();
    }
  };

  const hasNoOptions =
    !loading && Array.isArray(options) && options.length === 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : hasNoOptions ? (
          <Typography>Không tìm thấy lớp phù hợp</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {options.map((cls) => {
              const classId = cls.ClassID;
              const isSelected =
                selectedClass && selectedClass.ClassID === classId;

              const scheduleText =
                typeof getScheduleSummary === "function"
                  ? getScheduleSummary(cls)
                  : "";

              // Format OpendatePlan
              const formatDate = (dateString) => {
                if (!dateString) return "";
                try {
                  const date = new Date(dateString);
                  return date.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                } catch {
                  return dateString;
                }
              };

              const opendatePlan = cls.OpendatePlan
                ? formatDate(cls.OpendatePlan)
                : "";

              return (
                <Button
                  key={classId}
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => handleSelect(cls)}
                  sx={{
                    justifyContent: "space-between",
                    textTransform: "none",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{cls.Name || `Lớp ${cls.ClassID}`}</span>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {cls.Status}
                    </Typography>
                  </Box>

                  {opendatePlan && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", mt: 0.25 }}
                    >
                      Ngày dự kiến bắt đầu: {opendatePlan}
                    </Typography>
                  )}

                  {scheduleText && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", mt: 0.25 }}
                    >
                      Lịch học: {scheduleText}
                    </Typography>
                  )}
                </Button>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: "none", color: "#64748b" }}
        >
          Đóng
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedClass || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ textTransform: "none" }}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeClassDialog;
