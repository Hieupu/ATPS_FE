import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Event } from "@mui/icons-material";
import {
  getInstructorClassesApi,
  getClassScheduleApi,
} from "../../apiServices/scheduleService";
import { createPaymentLinkApi } from "../../apiServices/paymentService";

const BookSessionDialog = ({
  open,
  onClose,
  instructor,
  learnerId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classSchedule, setClassSchedule] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const instructorId = instructor?.id || instructor?.InstructorID;
      if (!open || !instructorId) return;
      try {
        setError(null);
        setLoading(true);
        console.log(
          "[BookSessionDialog] Fetch classes for instructor:",
          instructorId
        );
        const data = await getInstructorClassesApi(instructorId);
        const classList = data.classes || [];
        setClasses(classList);
        // Auto-select first class if multiple exist
        if (classList.length > 0) {
          setSelectedClassId(classList[0].ClassID);
        } else {
          setSelectedClassId("");
        }
      } catch (e) {
        setError(e.message || "Không thể tải danh sách lớp");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, instructor?.id, instructor?.InstructorID]);

  React.useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedClassId) {
        setClassSchedule([]);
        return;
      }
      try {
        setLoading(true);
        const data = await getClassScheduleApi(selectedClassId);
        setClassSchedule(data.schedules || []);
      } catch (e) {
        setError(e.message || "Không thể tải lịch lớp");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [selectedClassId]);

  const handleBook = async () => {
    if (!selectedClassId) {
      setError("Vui lòng chọn lớp để đăng ký");
      return;
    }
    try {
      setBooking(true);
      setError(null);
      // Tạo link thanh toán, Enrollment ở trạng thái Pending, điều hướng tới cổng thanh toán
      const resp = await createPaymentLinkApi(selectedClassId);
      if (resp?.paymentUrl) {
        setTimeout(() => {
          window.location.href = resp.paymentUrl;
        }, 400);
        return;
      }
      setError("Không nhận được đường dẫn thanh toán");
    } catch (err) {
      console.error("Error booking:", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        err?.error ||
        err?.details ||
        (typeof err === "string" ? err : "Không thể đặt lịch");
      setError(serverMsg);
    } finally {
      setBooking(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setClasses([]);
    setSelectedClassId("");
    setClassSchedule([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Event color="primary" />
          <Typography variant="h6">
            Đặt lịch học với {instructor?.FullName}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Chọn lớp */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="select-class-label">Chọn lớp</InputLabel>
              <Select
                labelId="select-class-label"
                label="Chọn lớp"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map((c) => (
                  <MenuItem key={c.ClassID} value={c.ClassID}>
                    {c.ClassName} (SV: {c.StudentCount})
                  </MenuItem>
                ))}
                {classes.length === 0 && (
                  <MenuItem value="" disabled>
                    Không có lớp hoạt động
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Lịch lớp */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Lịch học của lớp
            </Typography>
            {classSchedule.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Chưa có buổi học nào được tạo cho lớp này.
              </Alert>
            ) : (
              <List dense sx={{ mb: 2, maxHeight: 240, overflowY: "auto" }}>
                {classSchedule.map((s, idx) => (
                  <React.Fragment key={s.SessionID || idx}>
                    <ListItem>
                      <ListItemText
                        primary={s.Title}
                        secondary={`${s.formattedDate || ""} ${
                          s.timeRange || ""
                        }`.trim()}
                      />
                    </ListItem>
                    {idx < classSchedule.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={booking}>
          Hủy
        </Button>
        <Button
          onClick={handleBook}
          variant="contained"
          disabled={booking}
          startIcon={booking ? <CircularProgress size={20} /> : null}
        >
          Thanh toán và đăng ký
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookSessionDialog;
