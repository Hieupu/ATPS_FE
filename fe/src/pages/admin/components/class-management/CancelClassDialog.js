import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";

const CancelClassDialog = ({
  open,
  onClose,
  onConfirm,
  classInfo,
  loading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Xác nhận hủy lớp học</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Bạn có chắc chắn muốn hủy lớp học này?
        </Alert>
        {classInfo && (
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>Tên lớp:</strong>{" "}
              {classInfo.Name || classInfo.name || "N/A"}
            </Typography>
            {classInfo.ClassID && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Mã lớp:</strong> {classInfo.ClassID}
              </Typography>
            )}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, mb: 1 }}
            >
              Khi hủy lớp, hệ thống sẽ:
            </Typography>
            <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
              <li>Xóa tất cả các buổi học sau thời điểm hiện tại</li>
              <li>Chuyển lịch giảng viên từ "Đã đặt" về "Có thể dạy"</li>
              <li>Tạo yêu cầu hoàn tiền cho tất cả học sinh</li>
            </ul>
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 2, fontWeight: 500 }}
            >
              ⚠️ Hành động này không thể hoàn tác!
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Đang xử lý..." : "Xác nhận hủy"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelClassDialog;
