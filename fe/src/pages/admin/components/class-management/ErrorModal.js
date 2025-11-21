import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ErrorModal = ({ open, onClose, title, errors, message }) => {
  // Parse error message từ backend để lấy danh sách trường thiếu
  const parseMissingFields = (errorMessage) => {
    if (!errorMessage) return [];
    
    if (errorMessage.includes("Các trường bắt buộc:")) {
      const fieldsStr = errorMessage.replace("Các trường bắt buộc: ", "").trim();
      return fieldsStr.split(", ").map((field) => field.trim());
    }
    
    return [];
  };

  const missingFields = Array.from(new Set(parseMissingFields(message)));
  const hasFieldErrors = errors && Object.keys(errors).length > 0;
  const hasMissingFields = missingFields.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          fontWeight: 600,
          color: "#dc3545",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ErrorOutlineIcon sx={{ color: "#dc3545" }} />
        {title || "Lỗi Validation"}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Hiển thị message chung nếu có */}
          {message && !hasMissingFields && (
            <Typography
              variant="body1"
              sx={{
                color: "#dc3545",
                mb: hasFieldErrors ? 2 : 0,
                fontWeight: 500,
              }}
            >
              {message}
            </Typography>
          )}

          {/* Hiển thị danh sách trường thiếu từ backend */}
          {hasMissingFields && (
            <Box sx={{ mb: hasFieldErrors ? 3 : 0 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#dc3545",
                  mb: 1.5,
                  fontWeight: 500,
                }}
              >
                Các trường bắt buộc còn thiếu:
              </Typography>
              <List dense sx={{ pl: 0 }}>
                {missingFields.map((field, index) => (
                  <ListItem key={index} sx={{ py: 0.5, pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorOutlineIcon
                        sx={{ color: "#dc3545", fontSize: "20px" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={field}
                      primaryTypographyProps={{
                        sx: { color: "#333", fontSize: "0.95rem" },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Hiển thị lỗi validation từ frontend */}
          {hasFieldErrors && (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#dc3545",
                  mb: 1.5,
                  fontWeight: 500,
                }}
              >
                Các trường cần sửa:
              </Typography>
              <List dense sx={{ pl: 0 }}>
                {Object.entries(errors).map(([field, errorMessage]) => (
                  <ListItem key={field} sx={{ py: 0.5, pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorOutlineIcon
                        sx={{ color: "#dc3545", fontSize: "20px" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: "#333",
                              mb: 0.5,
                            }}
                          >
                            {getFieldLabel(field)}:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#666", fontSize: "0.9rem" }}
                          >
                            {errorMessage}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Nếu không có lỗi cụ thể, hiển thị message chung */}
          {!hasMissingFields && !hasFieldErrors && message && (
            <Typography variant="body1" sx={{ color: "#333" }}>
              {message}
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#dc3545",
            "&:hover": {
              backgroundColor: "#c82333",
            },
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function để map field name sang label tiếng Việt
const getFieldLabel = (field) => {
  const fieldLabels = {
    Name: "Tên lớp học",
    InstructorID: "Giảng viên",
    OpendatePlan: "Ngày dự kiến bắt đầu",
    EnddatePlan: "Ngày dự kiến kết thúc",
    Numofsession: "Số buổi học",
    Maxstudent: "Sĩ số tối đa",
    ZoomID: "Zoom ID",
    Zoompass: "Mật khẩu Zoom",
    Fee: "Học phí",
    CourseID: "Khóa học",
    DaysOfWeek: "Ngày học trong tuần",
    TimeslotsByDay: "Ca học",
    preview: "Lịch học",
    scheduleDetailOpendatePlan: "Ngày dự kiến bắt đầu",
    scheduleDetailEnddatePlan: "Ngày dự kiến kết thúc",
  };

  return fieldLabels[field] || field;
};

export default ErrorModal;








