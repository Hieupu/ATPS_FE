import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CircularProgress from "@mui/material/CircularProgress";

const SessionConflictModal = ({
  open,
  onClose,
  onSuggest,
  conflicts = [],
  createdCount = 0,
  totalCount = 0,
  loadingSuggestions = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#b45309",
          fontWeight: 600,
        }}
      >
        <WarningAmberIcon sx={{ color: "#f59e0b" }} />
        Xung đột lịch học
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1.5 }}>
            Đã tạo thành công <strong>{createdCount}</strong>/
            <strong>{totalCount}</strong> buổi học. Các buổi bên dưới bị trùng
            lịch hoặc giảng viên bận.
          </Typography>
          <Chip
            label={`${conflicts.length} buổi bị xung đột`}
            color="warning"
            size="small"
          />
        </Box>

        <List dense sx={{ px: 0 }}>
          {conflicts.map((conflict, idx) => (
            <ListItem
              key={`${conflict.sessionIndex}-${idx}`}
              alignItems="flex-start"
              sx={{
                mb: 1.5,
                border: "1px solid #fee2e2",
                borderRadius: 1,
                backgroundColor: "#fff7ed",
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, mt: 0.5 }}>
                <ErrorOutlineIcon sx={{ color: "#dc2626" }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Buổi {conflict.sessionIndex}:{" "}
                    {conflict.conflictInfo?.sessionTitle ||
                      conflict.sessionData?.Title ||
                      "Chưa đặt tên"}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }} component="div">
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      Ngày:{" "}
                      {conflict.conflictInfo?.date ||
                        conflict.sessionData?.Date ||
                        "N/A"}{" "}
                      | Giờ:{" "}
                      {conflict.conflictInfo?.startTime
                        ? `${conflict.conflictInfo.startTime} - ${
                            conflict.conflictInfo.endTime || "??"
                          }`
                        : conflict.sessionData?.TimeslotStart
                        ? `${conflict.sessionData.TimeslotStart} - ${
                            conflict.sessionData.TimeslotEnd || "??"
                          }`
                        : "?? - ??"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#991b1b", mt: 0.5 }}
                    >
                      {conflict.conflictInfo?.message ||
                        conflict.error ||
                        "Giảng viên trùng lịch"}
                    </Typography>
                    {conflict.conflictType && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", mt: 0.5, display: "block" }}
                      >
                        Loại xung đột:{" "}
                        {conflict.conflictType === "date_day_mismatch"
                          ? "Ngày không khớp với ca học"
                          : conflict.conflictType === "instructor_leave"
                          ? "Giảng viên nghỉ phép"
                          : conflict.conflictType === "session_conflict"
                          ? "Trùng lịch dạy"
                          : conflict.conflictType || "Không xác định"}
                      </Typography>
                    )}
                  </Box>
                }
                secondaryTypographyProps={{ component: "div" }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Quay về quản lý lớp
        </Button>
        <Button
          onClick={onSuggest}
          variant="contained"
          disabled={loadingSuggestions}
          startIcon={loadingSuggestions ? <CircularProgress size={18} /> : null}
          sx={{ backgroundColor: "#2563eb" }}
        >
          {loadingSuggestions ? "Đang gợi ý..." : "Gợi ý buổi học bù"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionConflictModal;
