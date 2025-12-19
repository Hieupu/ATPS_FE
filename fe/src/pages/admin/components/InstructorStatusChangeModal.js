import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import { Warning, Class as ClassIcon } from "@mui/icons-material";
import { toast } from "react-toastify";

const InstructorStatusChangeModal = ({
  open,
  onClose,
  instructor,
  classes,
  onConfirm,
  onCancelClasses,
}) => {
  const [step, setStep] = useState(1); // 1: Show classes, 2: Warning
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const showToast = (severity, message) => {
    const content = (
      <div style={{ whiteSpace: "pre-line" }}>{String(message || "")}</div>
    );
    switch (severity) {
      case "success":
        return toast.success(content);
      case "error":
        return toast.error(content);
      case "warn":
        return toast.warn(content);
      case "info":
      default:
        return toast.info(content);
    }
  };

  const handleContinue = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCancel = () => {
    setStep(1);
    onClose();
  };

  const handleConfirm = async () => {
    try {
      setCancelling(true);

      // Cancel all classes
      if (onCancelClasses && classes.length > 0) {
        await onCancelClasses(classes.map((c) => c.ClassID));
      }

      // Update status account
      if (onConfirm) {
        await onConfirm();
      }

      // Close modal
      setStep(1);
      onClose();
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      showToast("error", error?.message || "Có lỗi xảy ra khi xử lý");
    } finally {
      setCancelling(false);
    }
  };

  const handleClose = () => {
    if (!cancelling) {
      setStep(1);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {step === 1 ? "Danh sách lớp học" : "Xác nhận hủy lớp học"}
      </DialogTitle>
      <DialogContent dividers>
        {step === 1 ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Giảng viên <strong>{instructor?.FullName}</strong> đang có{" "}
              <strong>{classes.length}</strong> lớp học đang hoạt động. Nếu bạn
              đổi trạng thái giảng viên, tất cả các lớp này sẽ bị hủy.
            </Typography>

            {classes.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Không có lớp nào cần hủy.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Tên lớp</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Học phí</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Số buổi</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Ngày bắt đầu
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classes.map((classItem) => (
                      <TableRow key={classItem.ClassID}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {classItem.Name || classItem.ClassName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              classItem.Status === "DRAFT"
                                ? "Nháp"
                                : classItem.Status === "PENDING_APPROVAL"
                                ? "Chờ duyệt"
                                : classItem.Status === "APPROVED"
                                ? "Đã duyệt"
                                : classItem.Status === "PUBLISHED"
                                ? "Đang tuyển sinh"
                                : classItem.Status
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                classItem.Status === "PUBLISHED"
                                  ? "#10b981"
                                  : classItem.Status === "APPROVED"
                                  ? "#06b6d4"
                                  : classItem.Status === "PENDING_APPROVAL"
                                  ? "#f59e0b"
                                  : "#94a3b8",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "11px",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {classItem.Fee
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(classItem.Fee)
                            : "Miễn phí"}
                        </TableCell>
                        <TableCell>
                          {classItem.Numofsession ||
                            classItem.ExpectedSessions ||
                            0}{" "}
                          buổi
                        </TableCell>
                        <TableCell>
                          {classItem.OpendatePlan ||
                            classItem.StartDate ||
                            "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        ) : (
          <Box>
            <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Cảnh báo quan trọng!
              </Typography>
              <Typography variant="body2">
                Bạn sắp hủy <strong>{classes.length} lớp học</strong> của giảng
                viên <strong>{instructor?.FullName}</strong>.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Hành động này sẽ:
              </Typography>
              <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 24 }}>
                <li>Hủy tất cả các buổi học tương lai</li>
                <li>Tạo yêu cầu hoàn tiền cho học viên</li>
                <li>Gửi email thông báo cho học viên</li>
                <li>Đổi trạng thái tài khoản giảng viên</li>
              </ul>
              <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                Bạn có chắc chắn muốn tiếp tục?
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 1 ? (
          <>
            <Button onClick={handleCancel} disabled={cancelling}>
              Hủy
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={cancelling || classes.length === 0}
            >
              Tiếp tục
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleBack} disabled={cancelling}>
              Quay lại
            </Button>
            <Box sx={{ flex: 1 }} />
            {cancelling && <CircularProgress size={24} sx={{ mr: 2 }} />}
            <Button onClick={handleCancel} disabled={cancelling}>
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirm}
              disabled={cancelling}
            >
              {cancelling ? "Đang xử lý..." : "Đồng ý"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InstructorStatusChangeModal;
