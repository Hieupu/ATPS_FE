import React, { useState } from "react";
import {
  ListItem,
  Box,
  Typography,
  Button,
  Chip,
  ListItemIcon,
  ListItemText,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  Lock,
  Schedule,
  PlayArrow,
  ContinueBox,
  FastForward,
  Visibility,
  Refresh,
  CheckCircle,
} from "@mui/icons-material";
import { toast } from "react-toastify";

// --- IMPORT CÁC DIALOG ---
import AssignmentTakingDialog from "./AssignmentTakingDialog";
import AssignmentResultDialog from "./AssignmentResultDialog";

// --- IMPORT UTILS & API ---
import {
  getFileIcon,
  formatDate,
  isAssignmentOverdue,
} from "../../../utils/assignment";
import { retryExamApi } from "../../../apiServices/learnerExamService";

const AssignmentItem = ({ assignment, isEnrolled, index, onRefresh }) => {
  const [openTaking, setOpenTaking] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [loadingRetry, setLoadingRetry] = useState(false);

  const isOverdue = isAssignmentOverdue(assignment.Deadline);
  const submission = assignment.Submission;

  const checkIsSubmitted = (status) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return ["submitted", "completed", "graded", "passed", "failed"].includes(s);
  };

  const isSubmitted = submission && checkIsSubmitted(submission.Status);

  const isInProgress = submission && !isSubmitted;

  // --- HANDLERS ---

  const handleStartOrContinue = () => {
    setOpenTaking(true);
  };

  const handleViewResult = () => {
    setOpenResult(true);
  };

  const handleRetry = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn làm lại bài tập này? Kết quả cũ có thể bị ghi đè."
      )
    )
      return;

    try {
      setLoadingRetry(true);
      // Gọi API reset đề
      await retryExamApi(assignment.InstanceID);

      toast.success("Đã tạo lượt làm bài mới!");

      // Sau khi reset thành công, mở ngay dialog làm bài
      setOpenTaking(true);

      // Nếu cần, gọi callback để load lại list bên ngoài (để cập nhật remaining attempts...)
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message || "Không thể làm lại bài");
    } finally {
      setLoadingRetry(false);
    }
  };

  // Callback khi đóng Dialog làm bài (có thể user đã nộp, cần reload list)
  const handleCloseTaking = () => {
    setOpenTaking(false);
    if (onRefresh) onRefresh();
  };

  return (
    <>
      <ListItem
        sx={{
          py: 2,
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap", // Cho phép xuống dòng trên mobile
        }}
        secondaryAction={
          // Truyền props cần thiết vào Actions
          <AssignmentActions
            isEnrolled={isEnrolled}
            isOverdue={isOverdue}
            isSubmitted={isSubmitted}
            isInProgress={isInProgress}
            loadingRetry={loadingRetry}
            onStart={handleStartOrContinue}
            onViewResult={handleViewResult}
            onRetry={handleRetry}
          />
        }
      >
        {/* Avatar số thứ tự */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: isSubmitted ? "success.light" : "primary.light",
            mr: 2,
            fontWeight: 600,
            color: isSubmitted
              ? "success.contrastText"
              : "primary.contrastText",
          }}
        >
          {isSubmitted ? <CheckCircle fontSize="small" /> : `A${index + 1}`}
        </Box>

        <ListItemIcon sx={{ minWidth: 40 }}>
          {getFileIcon("assignment")}
        </ListItemIcon>

        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography fontWeight={600}>{assignment.Title}</Typography>
              {isSubmitted && (
                <Chip
                  label="Đã nộp"
                  color="success"
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              )}
              {isInProgress && (
                <Chip
                  label="Đang làm"
                  color="warning"
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              )}
            </Box>
          }
          secondary={
            <>
              {assignment.Description && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {assignment.Description}
                </Typography>
              )}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Hạn nộp: {formatDate(assignment.Deadline)}
                </Typography>
                {isOverdue && !isSubmitted && (
                  <Chip label="Quá hạn" color="error" size="small" />
                )}
              </Box>
            </>
          }
        />
      </ListItem>

      {/* Dialog Làm bài */}
      <AssignmentTakingDialog
        open={openTaking}
        onClose={handleCloseTaking}
        assignmentId={assignment.InstanceID}
      />

      {/* Dialog Kết quả (chỉ render nếu đã nộp) */}
      {isSubmitted && (
        <AssignmentResultDialog
          open={openResult}
          onClose={() => setOpenResult(false)}
          assignmentId={assignment.InstanceID}
          onRetry={handleRetry} // Cho phép retry từ màn hình kết quả
        />
      )}
    </>
  );
};

// Component con tách biệt để xử lý logic hiển thị nút
const AssignmentActions = ({
  isEnrolled,
  isOverdue,
  isSubmitted,
  isInProgress,
  loadingRetry,
  onStart,
  onViewResult,
  onRetry,
}) => {
  // 1. Chưa đăng ký khóa học
  if (!isEnrolled) {
    return <Chip icon={<Lock />} label="Cần đăng ký" size="small" />;
  }

  // 2. Đã nộp bài (Hiển thị Xem kết quả + Làm lại)
  if (isSubmitted) {
    return (
      <Stack direction="row" spacing={1}>
        {/* Nút Làm lại (nếu chưa quá hạn hoặc chính sách cho phép - ở đây check đơn giản) */}
        {!isOverdue && (
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={onRetry}
            disabled={loadingRetry}
            startIcon={
              loadingRetry ? <CircularProgress size={16} /> : <Refresh />
            }
          >
            Làm lại
          </Button>
        )}

        {/* Nút Xem kết quả */}
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={onViewResult}
          startIcon={<Visibility />}
        >
          Kết quả
        </Button>
      </Stack>
    );
  }

  // 3. Đang làm dở (Tiếp tục)
  if (isInProgress) {
    return (
      <Button
        variant="contained"
        color="warning" // Màu vàng cam để báo hiệu đang làm dở
        size="small"
        onClick={onStart}
        disabled={isOverdue} // Quá hạn thì không cho tiếp tục (tùy logic business)
        startIcon={<FastForward />}
      >
        Tiếp tục
      </Button>
    );
  }

  // 4. Chưa làm (Bắt đầu)
  return (
    <Button
      variant="contained"
      size="small"
      onClick={onStart}
      disabled={isOverdue}
      startIcon={<PlayArrow />}
    >
      {isOverdue ? "Quá hạn" : "Làm bài"}
    </Button>
  );
};

export default AssignmentItem;
