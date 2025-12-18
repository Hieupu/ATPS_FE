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
  Link,
} from "@mui/material";
import {
  Lock,
  Schedule,
  PlayArrow,
  FastForward,
  Visibility,
  Refresh,
  CheckCircle,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import AssignmentTakingDialog from "./AssignmentTakingDialog";
import AssignmentResultDialog from "./AssignmentResultDialog";
import AssignmentReviewDialog from "./AssignmentReviewDialog";
import {
  getFileIcon,
  formatDate,
  isAssignmentOverdue,
} from "../../../utils/assignment";
import { retryExamApi } from "../../../apiServices/learnerExamService";

const AssignmentItem = ({ assignment, isEnrolled, index, onRefresh }) => {
  const [openTaking, setOpenTaking] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isOverdue = isAssignmentOverdue(assignment.Deadline);
  const submission = assignment.Submission;

  const checkIsSubmitted = (status) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return ["submitted", "completed", "graded", "passed", "failed"].includes(s);
  };

  const isSubmitted = submission && checkIsSubmitted(submission.Status);
  const isInProgress = submission && !isSubmitted;

  const handleStartOrContinue = () => setOpenTaking(true);
  const handleViewResult = () => setOpenResult(true);

  const handleViewReview = () => {
    setOpenResult(false);
    setOpenReview(true);
  };

  const handleRetry = async () => {
    const confirmRetry = window.confirm(
      "Bạn có chắc chắn muốn làm lại bài tập này? Kết quả cũ sẽ bị ghi đè."
    );

    if (!confirmRetry) return;

    try {
      setLoadingRetry(true);
      await retryExamApi(assignment.InstanceID);
      setOpenResult(false);
      setOpenReview(false);
      setOpenTaking(true);
    } catch (error) {
      toast.error(error.message || "Không thể làm lại bài");
    } finally {
      setLoadingRetry(false);
    }
  };

  const handleCloseTaking = () => {
    setOpenTaking(false);
    if (onRefresh) onRefresh();
  };

  const hasLongDescription =
    assignment.Description && assignment.Description.length > 60;

  return (
    <>
      <ListItem
        sx={{
          py: 2,
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}
        >
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
              flexShrink: 0,
              fontWeight: 600,
              color: isSubmitted
                ? "success.contrastText"
                : "primary.contrastText",
            }}
          >
            {isSubmitted ? <CheckCircle fontSize="small" /> : `A${index + 1}`}
          </Box>

          <ListItemIcon sx={{ minWidth: 40, flexShrink: 0 }}>
            {getFileIcon("assignment")}
          </ListItemIcon>

          <ListItemText
            sx={{ m: 0, flex: 1, minWidth: 0 }}
            primary={
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography fontWeight={600} noWrap>
                  {assignment.Title}
                </Typography>
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
              <Box component="span" sx={{ display: "block" }}>
                {assignment.Description && (
                  <Box sx={{ mb: 0.5 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: isExpanded ? "unset" : 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordBreak: "break-word",
                        lineHeight: "1.4em",
                      }}
                    >
                      {assignment.Description}
                    </Typography>

                    {hasLongDescription && (
                      <Link
                        component="button"
                        variant="caption"
                        underline="hover"
                        onClick={() => setIsExpanded(!isExpanded)}
                        sx={{
                          fontWeight: 600,
                          color: "primary.main",
                          cursor: "pointer",
                          display: "block",
                        }}
                      >
                        {isExpanded ? "Thu gọn" : "Xem thêm"}
                      </Link>
                    )}
                  </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    Hạn nộp: {formatDate(assignment.Deadline)}
                  </Typography>
                  {isOverdue && !isSubmitted && (
                    <Chip
                      label="Quá hạn"
                      color="error"
                      size="small"
                      sx={{ height: 20, fontSize: "0.65rem" }}
                    />
                  )}
                </Box>
              </Box>
            }
          />
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <AssignmentActions
            isEnrolled={isEnrolled}
            isOverdue={isOverdue}
            isSubmitted={isSubmitted}
            isInProgress={isInProgress}
            loadingRetry={loadingRetry}
            onStart={handleStartOrContinue}
            onViewResult={handleViewResult}
            onHandleRetry={handleRetry}
          />
        </Box>
      </ListItem>

      <AssignmentTakingDialog
        open={openTaking}
        onClose={handleCloseTaking}
        assignmentId={assignment.InstanceID}
      />

      {isSubmitted && (
        <AssignmentResultDialog
          open={openResult}
          onClose={() => setOpenResult(false)}
          assignmentId={assignment.InstanceID}
          onRetry={handleRetry}
          onViewReview={handleViewReview}
        />
      )}

      {isSubmitted && (
        <AssignmentReviewDialog
          open={openReview}
          onClose={() => setOpenReview(false)}
          assignmentId={assignment.InstanceID}
        />
      )}
    </>
  );
};

const AssignmentActions = ({
  isEnrolled,
  isOverdue,
  isSubmitted,
  isInProgress,
  loadingRetry,
  onStart,
  onViewResult,
  onHandleRetry,
}) => {
  if (!isEnrolled) {
    return <Chip icon={<Lock />} label="Cần đăng ký" size="small" />;
  }

  if (isSubmitted) {
    return (
      <Stack direction="row" spacing={1}>
        {!isOverdue && (
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={onHandleRetry}
            disabled={loadingRetry}
            startIcon={
              loadingRetry ? <CircularProgress size={16} /> : <Refresh />
            }
          >
            Làm lại
          </Button>
        )}
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

  if (isInProgress) {
    return (
      <Button
        variant="contained"
        color="warning"
        size="small"
        onClick={onStart}
        disabled={isOverdue}
        startIcon={<FastForward />}
      >
        Tiếp tục
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      size="small"
      onClick={onStart}
      disabled={isOverdue}
      startIcon={<PlayArrow />}
    >
      {isOverdue ? "Quá hạn" : "LÀM BÀI"}
    </Button>
  );
};

export default AssignmentItem;
