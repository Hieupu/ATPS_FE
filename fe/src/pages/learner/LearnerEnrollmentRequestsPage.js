import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Divider,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import AppHeader from "../../components/Header/AppHeader";
import {
  Notifications,
  Person,
  AccessTime,
  Payments,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  getMyEnrollmentRequestsApi,
  cancelMyEnrollmentApi,
  getEnrollmentSessionsApi,
  getAvailableInstructorSlotsApi,
  handleSessionActionApi,
} from "../../apiServices/scheduleService";
import { useAuth } from "../../contexts/AuthContext";

export default function LearnerEnrollmentRequestsPage() {
  const { isLearner } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [detailSessions, setDetailSessions] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [rescheduleDialog, setRescheduleDialog] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const loadMyRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMyEnrollmentRequestsApi();
        setRequests(response.requests || []);
      } catch (err) {
        const errorMessage =
          err.message ||
          err.response?.data?.message ||
          "Không thể tải danh sách đơn đăng ký";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (isLearner) {
      loadMyRequests();
    } else {
      setLoading(false);
      setError("Chỉ người học mới có thể truy cập trang này");
    }
  }, [isLearner]);

  const refresh = async () => {
    const response = await getMyEnrollmentRequestsApi();
    setRequests(response.requests || []);
  };

  const formatDate = (input) => {
    if (!input) return "—";
    try {
      const d = new Date(input);
      if (Number.isNaN(d.getTime())) return String(input);
      return d.toLocaleDateString("vi-VN");
    } catch {
      return String(input);
    }
  };

  const formatCurrency = (v) => {
    if (v == null) return "—";
    const num = Number(v);
    if (Number.isNaN(num)) return String(v);
    return num.toLocaleString("vi-VN") + " ₫";
  };

  const openDetailModal = async (enrollmentId) => {
    try {
      setLoadingDetail(true);
      const response = await getEnrollmentSessionsApi(enrollmentId);
      setDetailSessions(response.sessions || []);
      setDetailModal(enrollmentId);
    } catch (err) {
      alert(err.message || "Không thể tải chi tiết buổi học");
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModal(null);
    setDetailSessions([]);
  };

  const openReschedule = async (request) => {
    try {
      setRescheduleDialog(request);
      setSelectedSessionId(null);
      setSelectedSlotId(null);
      setSelectedDate("");
      if (request.InstructorID) {
        const response = await getAvailableInstructorSlotsApi(
          request.InstructorID
        );
        setAvailableSlots(response.slots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      alert(err.message || "Không thể tải slot khả dụng");
    }
  };

  const submitReschedule = async () => {
    if (!selectedSessionId || !selectedSlotId || !selectedDate) {
      alert("Vui lòng chọn buổi học, slot và ngày mới");
      return;
    }
    try {
      await handleSessionActionApi(String(selectedSessionId), {
        action: "reschedule",
        newTimeslotID: selectedSlotId,
        newDate: selectedDate,
        reason: "Learner propose",
      });
      alert("Đã gửi đề xuất đổi lịch");
      setRescheduleDialog(null);
    } catch (err) {
      alert(err.message || "Không thể gửi đề xuất đổi lịch");
    }
  };

  const cancelEnrollment = async (enrollmentId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn đăng ký này?")) return;
    try {
      await cancelMyEnrollmentApi(enrollmentId);
      alert("Đã hủy đơn đăng ký");
      await refresh();
    } catch (err) {
      alert(err.message || "Không thể hủy đơn đăng ký");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Đang tải danh sách đơn đăng ký...</Typography>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography color="error">{error}</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      {/* Header gradient giống lịch học */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
          >
            Đơn đăng ký của tôi
          </Typography>
          <Typography variant="h6" sx={{ textAlign: "center", opacity: 0.9 }}>
            Xem và quản lý các đơn đăng ký chờ xác nhận
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            component={Link}
            to="/reschedule-requests"
            variant="outlined"
            startIcon={<Notifications />}
            sx={{ mb: 2 }}
          >
            Xem đề xuất đổi lịch
          </Button>
        </Box>

        {requests.length === 0 ? (
          <Card
            variant="outlined"
            sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc" }}
          >
            <Typography sx={{ fontSize: 40, mb: 1 }}>📋</Typography>
            <Typography fontWeight={600}>
              Chưa có đơn đăng ký chờ xác nhận
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Khi đặt lịch 1-1, đơn sẽ hiển thị tại đây
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {requests.map((req) => (
              <Grid item xs={12} md={12} key={req.EnrollmentID}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                          {req.ClassName || "Lớp 1-1"}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ color: "text.secondary" }}
                        >
                          <Person fontSize="small" />
                          <Typography variant="body2">
                            {req.InstructorName || "—"}
                          </Typography>
                        </Stack>
                      </Box>
                      <Chip
                        label="Pending"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Stack>

                    <Stack spacing={1.2} sx={{ mt: 2 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        color="text.secondary"
                      >
                        <AccessTime fontSize="small" />
                        <Typography variant="body2">
                          {formatDate(req.FirstSessionDate)} →{" "}
                          {formatDate(req.LastSessionDate)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Tổng buổi: <b>{req.TotalSessions || 0}</b>
                      </Typography>
                      {req.ClassFee != null && (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          color="text.secondary"
                        >
                          <Payments fontSize="small" />
                          <Typography variant="body2">
                            Học phí: {formatCurrency(req.ClassFee)}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                  <CardActions
                    sx={{ px: 2, pb: 2, pt: 0, justifyContent: "flex-end" }}
                  >
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => openDetailModal(req.EnrollmentID)}
                      >
                        Chi tiết buổi học
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => cancelEnrollment(req.EnrollmentID)}
                      >
                        Hủy đơn
                      </Button>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {detailModal && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Card sx={{ width: 640, maxWidth: "90%" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={700}>Chi tiết buổi học</Typography>
                <Button onClick={closeDetailModal} size="small">
                  Đóng
                </Button>
              </Box>
              <Divider />
              <Box sx={{ p: 2, maxHeight: 360, overflow: "auto" }}>
                {loadingDetail ? (
                  <Typography>Đang tải...</Typography>
                ) : detailSessions.length === 0 ? (
                  <Typography>Không có buổi học</Typography>
                ) : (
                  <Box component="ul" sx={{ pl: 3, m: 0 }}>
                    {detailSessions.map((s) => (
                      <Box component="li" key={s.SessionID} sx={{ mb: 1 }}>
                        #{s.SessionID} - {s.Date} ({s.StartTime} - {s.EndTime})
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Card>
          </Box>
        )}

        {rescheduleDialog && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Card sx={{ width: 720, maxWidth: "95%" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={700}>Đề xuất đổi lịch</Typography>
                <Button onClick={() => setRescheduleDialog(null)} size="small">
                  Đóng
                </Button>
              </Box>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Chọn buổi học</InputLabel>
                      <Select
                        label="Chọn buổi học"
                        value={selectedSessionId || ""}
                        onChange={(e) =>
                          setSelectedSessionId(Number(e.target.value))
                        }
                      >
                        <MenuItem value="">-- Chọn --</MenuItem>
                        {detailSessions.map((s) => (
                          <MenuItem key={s.SessionID} value={s.SessionID}>
                            #{s.SessionID} - {s.Date} ({s.StartTime}-{s.EndTime}
                            )
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {!detailSessions.length && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Gợi ý: bấm "Chi tiết buổi học" để nạp danh sách buổi
                        trước
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Slot khả dụng</InputLabel>
                      <Select
                        label="Slot khả dụng"
                        value={selectedSlotId || ""}
                        onChange={(e) =>
                          setSelectedSlotId(Number(e.target.value))
                        }
                      >
                        <MenuItem value="">-- Chọn --</MenuItem>
                        {availableSlots.map((slot) => (
                          <MenuItem
                            key={slot.TimeslotID}
                            value={slot.TimeslotID}
                          >
                            {slot.Day} {slot.StartTime} - {slot.EndTime}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InputLabel
                      sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}
                    >
                      Ngày mới
                    </InputLabel>
                    <Box
                      component="input"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      sx={{
                        width: "100%",
                        p: 1,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  </Grid>
                </Grid>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="flex-end"
                  sx={{ mt: 2 }}
                >
                  <Button
                    onClick={() => setRescheduleDialog(null)}
                    variant="outlined"
                  >
                    Đóng
                  </Button>
                  <Button onClick={submitReschedule} variant="contained">
                    Gửi đề xuất
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Box>
        )}
      </Container>
    </Box>
  );
}
