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
import CircularProgress from "@mui/material/CircularProgress";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const SessionSuggestionModal = ({
  open,
  onClose,
  onApply,
  suggestions = [],
  applying = false,
}) => {
  const availableSuggestions = suggestions.filter(
    (item) => item.suggestion
  );

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
          fontWeight: 600,
        }}
      >
        <EventAvailableIcon color="success" />
        Gợi ý buổi học bù
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Hệ thống đã tìm các khung giờ trống sau buổi học cuối cùng của lớp,
          ưu tiên theo timeslot bạn đã chọn.
        </Typography>
        <List dense sx={{ px: 0 }}>
          {suggestions.map((item, idx) => {
            const { conflict, suggestion, error } = item;
            return (
              <ListItem
                key={`${conflict.sessionIndex}-${idx}`}
                alignItems="flex-start"
                sx={{
                  mb: 1.5,
                  border: "1px solid #e2e8f0",
                  borderRadius: 1,
                  backgroundColor: suggestion ? "#f0fdf4" : "#fef2f2",
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, mt: 0.5 }}>
                  {suggestion ? (
                    <ScheduleIcon sx={{ color: "#16a34a" }} />
                  ) : (
                    <ErrorOutlineIcon sx={{ color: "#dc2626" }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      component="div"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Buổi {conflict.sessionIndex}:{" "}
                        {conflict.conflictInfo?.sessionTitle ||
                          conflict.sessionData?.Title ||
                          "Chưa đặt tên"}
                      </Typography>
                      <Chip
                        label={
                          suggestion
                            ? "Đã tìm thấy buổi bù"
                            : "Chưa tìm thấy lịch trống"
                        }
                        color={suggestion ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }} component="div">
                      <Typography variant="body2" sx={{ color: "#475569" }}>
                        Buổi gốc:{" "}
                        {conflict.conflictInfo?.date ||
                          conflict.sessionData?.Date ||
                          "N/A"}{" "}
                        |{" "}
                        {conflict.conflictInfo?.startTime
                          ? `${conflict.conflictInfo.startTime} - ${conflict.conflictInfo.endTime || "??"}`
                          : conflict.sessionData?.TimeslotStart
                          ? `${conflict.sessionData.TimeslotStart} - ${conflict.sessionData.TimeslotEnd || "??"}`
                          : "?? - ??"}
                      </Typography>
                      {suggestion ? (
                        <Typography
                          variant="body2"
                          sx={{ color: "#0f766e", mt: 0.5, fontWeight: 500 }}
                        >
                          Buổi học bù: {suggestion.date} |{" "}
                          {suggestion.startTime || "??"} -{" "}
                          {suggestion.endTime || "??"}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: "#b91c1c", mt: 0.5 }}
                        >
                          {error ||
                            "Không tìm thấy khung giờ trống phù hợp cho ca học này."}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={applying}>
          Đóng
        </Button>
        <Button
          onClick={onApply}
          variant="contained"
          disabled={availableSuggestions.length === 0 || applying}
          startIcon={applying ? <CircularProgress size={18} /> : null}
          sx={{ backgroundColor: "#0f766e" }}
        >
          {applying ? "Đang thêm..." : "Thêm buổi bù gợi ý"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionSuggestionModal;

