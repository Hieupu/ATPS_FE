import React, { useState } from "react";
import {
  ListItem,
  Box,
  Typography,
  Button,
  Chip,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CheckCircle,
  Download,
  Schedule,
  AccessTime,
  Lock,
  Replay, // Import icon làm lại cho đẹp
} from "@mui/icons-material";
import AssignmentDialog from "./AssignmentDialog";
import AssignmentResultDialog from "./AssignmentResultDialog";
import {
  getFileIcon,
  getTypeColor,
  formatDate,
  isAssignmentOverdue,
  getAssignmentStatusColor,
  getAssignmentStatusText,
} from "../../../utils/assignment";

const AssignmentItem = ({ assignment, isEnrolled, index, onRefresh }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  console.log(assignment, "assignment in AssignmentItem");

  const typeInfo = getTypeColor("assignment");
  const hasSubmission = assignment.Submission;
  const isOverdue = isAssignmentOverdue(assignment.Deadline);

  const handleStartAssignment = () => {
    setDialogOpen(true);
  };

  const handleViewResult = () => {
    setResultDialogOpen(true);
  };

  const handleSubmitSuccess = () => {
    setDialogOpen(false);
    onRefresh?.(); // Refresh curriculum to show updated submission
  };

  return (
    <>
      <ListItem
        sx={{
          py: 2,
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
          "&:last-child": { borderBottom: "none" },
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "action.hover",
            transform: "translateX(4px)",
          },
        }}
        secondaryAction={
          <AssignmentActions
            assignment={assignment}
            isEnrolled={isEnrolled}
            hasSubmission={hasSubmission}
            isOverdue={isOverdue}
            onStart={handleStartAssignment}
            onViewResult={handleViewResult}
          />
        }
      >
        <AssignmentIndex index={index} />

        <ListItemIcon sx={{ minWidth: 40 }}>
          {getFileIcon("assignment")}
        </ListItemIcon>

        <ListItemText
          primary={
            <AssignmentPrimary assignment={assignment} typeInfo={typeInfo} />
          }
          secondary={
            <AssignmentSecondary
              assignment={assignment}
              isEnrolled={isEnrolled}
              hasSubmission={hasSubmission}
            />
          }
        />
      </ListItem>

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        assignment={assignment}
        onSubmitSuccess={handleSubmitSuccess}
      />

      {/* Result Dialog */}
      {hasSubmission && (
        <AssignmentResultDialog
          open={resultDialogOpen}
          onClose={() => setResultDialogOpen(false)}
          assignment={assignment}
        />
      )}
    </>
  );
};

const AssignmentIndex = ({ index }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 36,
      height: 36,
      borderRadius: "50%",
      bgcolor: "primary.light",
      mr: 2,
      fontWeight: 600,
      fontSize: "0.875rem",
      color: "primary.contrastText",
    }}
  >
    A{index + 1}
  </Box>
);

const AssignmentPrimary = ({ assignment, typeInfo }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      mb: 0.5,
      flexWrap: "wrap",
    }}
  >
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {assignment.Title}
    </Typography>
    <Chip
      label={typeInfo.label}
      size="small"
      sx={{
        bgcolor: typeInfo.bg,
        color: typeInfo.text,
        fontWeight: 600,
        height: 22,
        fontSize: "0.75rem",
      }}
    />
    <Chip
      label={assignment.Type}
      color="primary"
      variant="outlined"
      size="small"
    />
  </Box>
);

const AssignmentSecondary = ({ assignment, isEnrolled, hasSubmission }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
    {assignment.Description && (
      <Typography variant="body2" color="text.secondary">
        {assignment.Description}
      </Typography>
    )}

    <AssignmentDetails assignment={assignment} />

    {!isEnrolled && (
      <Typography
        variant="body2"
        sx={{ color: "warning.main", fontWeight: 500 }}
      >
        📌 Đăng ký để làm bài tập
      </Typography>
    )}

    {hasSubmission && assignment.Submission.Feedback && (
      <Feedback feedback={assignment.Submission.Feedback} />
    )}
  </Box>
);

const AssignmentDetails = ({ assignment }) => {
  const isOverdue = isAssignmentOverdue(assignment.Deadline);
  const hasSubmission = assignment.Submission;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary">
          Hạn nộp: {formatDate(assignment.Deadline)}
        </Typography>
        {isOverdue && !hasSubmission && (
          <Chip label="Quá hạn" color="error" size="small" />
        )}
      </Box>

      {assignment.MaxDuration && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {assignment.MaxDuration} phút
          </Typography>
        </Box>
      )}

      <FileAttachments assignment={assignment} />
    </Box>
  );
};

const FileAttachments = ({ assignment }) => (
  <Box sx={{ display: "flex", gap: 0.5 }}>
    {assignment.FileURL && (
      <Button
        size="small"
        startIcon={<Download />}
        component="a"
        href={assignment.FileURL}
        target="_blank"
        sx={{ minWidth: "auto" }}
      >
        Đề bài
      </Button>
    )}
    {assignment.MediaURL && (
      <Button
        size="small"
        startIcon={<Download />}
        component="a"
        href={assignment.MediaURL}
        target="_blank"
        sx={{ minWidth: "auto" }}
      >
        Tài liệu
      </Button>
    )}
  </Box>
);

// --- PHẦN ĐÃ CHỈNH SỬA ---
const AssignmentActions = ({
  assignment,
  isEnrolled,
  hasSubmission,
  isOverdue,
  onStart,
  onViewResult,
}) => {
  if (!isEnrolled) {
    return (
      <Chip
        icon={<Lock />}
        label="Cần đăng ký"
        size="small"
        sx={{ bgcolor: "warning.light", color: "warning.dark" }}
      />
    );
  }

  if (hasSubmission) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        <Chip
          icon={<CheckCircle />}
          label={getAssignmentStatusText(assignment.Submission.Status)}
          color={getAssignmentStatusColor(assignment.Submission.Status)}
          size="small"
        />
        {assignment.Submission.Score !== null && (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "success.main" }}
          >
            Điểm: {assignment.Submission.Score}
          </Typography>
        )}

        {/* Nhóm 2 nút: Làm lại và Xem kết quả */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined" // Nút phụ
            color="primary"
            onClick={onStart}
            disabled={isOverdue} // Không cho làm lại nếu quá hạn
            startIcon={<Replay />}
          >
            Làm lại
          </Button>

          <Button
            size="small"
            variant="contained" // Nút chính
            onClick={onViewResult}
          >
            Xem kết quả
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      size="small"
      onClick={onStart}
      disabled={isOverdue}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        px: 2,
      }}
    >
      {isOverdue ? "Quá hạn" : "Làm bài"}
    </Button>
  );
};

const Feedback = ({ feedback }) => (
  <Box
    sx={{
      mt: 1,
      p: 1.5,
      bgcolor: "success.50",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "success.200",
    }}
  >
    <Typography
      variant="subtitle2"
      sx={{ color: "success.800", fontWeight: 600, mb: 0.5 }}
    >
      Nhận xét từ giảng viên:
    </Typography>
    <Typography variant="body2" sx={{ color: "success.700" }}>
      {feedback}
    </Typography>
  </Box>
);

export default AssignmentItem;
