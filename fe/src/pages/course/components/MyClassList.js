import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import { Schedule, People, Assignment, SwapHoriz } from "@mui/icons-material";
import {
  getMyClassesInCourseApi,
  getClassesByCourseApi,
  transferClassApi,
} from "../../../apiServices/courseService";
import TransferClassModal from "./TransferClassModal";

const MyClassList = ({ courseId }) => {
  const [classes, setClasses] = useState([]);
  const [classesInCourse, setClassesInCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [transferResult, setTransferResult] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    fromClassId: null,
    toClassId: null,
  });

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        setLoading(true);
        const response = await getMyClassesInCourseApi(courseId);

        setClasses(response.classes || []);
      } catch (error) {
        console.error("Error fetching my classes:", error);
        setError(error.message || "Failed to load your classes");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchMyClasses();
    }
  }, [courseId]);

    const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch song song cả hai API
      const [myClassesResponse, allClassesResponse] = await Promise.all([
        getMyClassesInCourseApi(courseId),
        getClassesByCourseApi(courseId)
      ]);
      
      console.log("My classes:", myClassesResponse);
      console.log("All classes:", allClassesResponse);
      
      setClasses(myClassesResponse.classes || []);
      setClassesInCourse(allClassesResponse.classes || []);
      
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError(error.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    if (courseId) {
      fetchAllData();
    }
  }, [courseId]);

  useEffect(() => {
    const fetchClassesInCourse = async () => {
      try {
        setLoading(true);
        const response = await getClassesByCourseApi(courseId);

        setClassesInCourse(response.classes || []);
      } catch (error) {
        console.error("Error fetching classes in course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchClassesInCourse();
    }
  }, [courseId]);

const handleOpenTransferModal = (classItem) => {
    // Tìm lớp hiện tại với thông tin mới nhất từ classes
    const currentClass = classes.find(cls => cls.ClassID === classItem.ClassID);
    setSelectedClass(currentClass || classItem);
    setTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setSelectedClass(null);
  };

  const handleConfirmTransfer = (fromClassId, toClassId) => {
    setTransferData({ fromClassId, toClassId });
    setConfirmDialogOpen(true);
  };

  const handleTransferClass = async () => {
    try {
      setTransferLoading(true);
      setConfirmDialogOpen(false);

      const response = await transferClassApi(
        transferData.fromClassId,
        transferData.toClassId,
        courseId
      );

      setTransferResult({
        success: true,
        message: response.message || "Chuyển lớp thành công!",
      });
      
      // Refresh tất cả dữ liệu
      await fetchAllData();
      
      // Close modal
      handleCloseTransferModal();
    } catch (error) {
      console.error("Transfer class error:", error);
      setTransferResult({
        success: false,
        message: error.message || "Chuyển lớp thất bại. Vui lòng thử lại.",
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDayVietnamese = (day) => {
    const dayMap = {
      Monday: "Thứ 2",
      Tuesday: "Thứ 3",
      Wednesday: "Thứ 4",
      Thursday: "Thứ 5",
      Friday: "Thứ 6",
      Saturday: "Thứ 7",
      Sunday: "Chủ nhật",
    };
    return dayMap[day] || day;
  };

  // Filter available classes for transfer (ACTIVE and not full)
  const getAvailableClassesForTransfer = () => {
    return classesInCourse.filter(
      (cls) =>
        cls.Status === "ACTIVE" &&
        cls.StudentCount < cls.Maxstudent &&
        (!selectedClass || cls.ClassID !== selectedClass.ClassID)
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Alert severity="info">
        Bạn chưa đăng ký lớp học nào trong khóa học này.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Transfer Result Snackbar */}
      <Snackbar
        open={!!transferResult}
        autoHideDuration={6000}
        onClose={() => setTransferResult(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={transferResult?.success ? "success" : "error"}
          onClose={() => setTransferResult(null)}
        >
          {transferResult?.message}
        </Alert>
      </Snackbar>

      {/* Confirm Transfer Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Xác nhận chuyển lớp</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn chuyển lớp không? Việc này sẽ:
            <ul>
              <li>Chuyển bạn sang lớp học mới</li>
              <li>Hủy đăng ký khỏi lớp hiện tại</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleTransferClass}
            variant="contained"
            disabled={transferLoading}
          >
            {transferLoading ? <CircularProgress size={24} /> : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Class Modal */}
      <TransferClassModal
        open={transferModalOpen}
        onClose={handleCloseTransferModal}
        currentClass={selectedClass}
        availableClasses={getAvailableClassesForTransfer()}
        onTransfer={handleConfirmTransfer}
        loading={transferLoading}
      />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Lớp học của bạn
          </Typography>
          <Chip
            label={`${classes.length} lớp`}
            size="small"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>

      {/* Classes List */}
      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} md={6} key={classItem.ClassID}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(99,102,241,0.15)",
                boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 15px 35px rgba(99,102,241,0.2)",
                  transform: "translateY(-3px)",
                  borderColor: "rgba(99,102,241,0.3)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "'Poppins', sans-serif",
                        mb: 1,
                      }}
                    >
                      {classItem.ClassName || `Lớp ${classItem.ClassID}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.9rem" }}
                    >
                      👨‍🏫 Giảng viên: <strong>{classItem.InstructorName}</strong>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={
                        classItem.Status?.toLowerCase() === "active"
                          ? "Đang mở"
                          : classItem.Status?.toLowerCase() === "ongoing"
                          ? "Đang học"
                          : classItem.Status?.toLowerCase() === "close" ||
                            classItem.Status?.toLowerCase() === "closed"
                          ? "Đã kết thúc"
                          : classItem.Status
                      }
                      sx={{
                        bgcolor: "white",
                        border: "1.5px solid",
                        borderColor:
                          classItem.Status?.toLowerCase() === "active"
                            ? "success.main"
                            : classItem.Status?.toLowerCase() === "ongoing"
                            ? "info.main"
                            : classItem.Status?.toLowerCase() === "close" ||
                              classItem.Status?.toLowerCase() === "closed"
                            ? "grey.500"
                            : "grey.400",
                        color:
                          classItem.Status?.toLowerCase() === "active"
                            ? "success.main"
                            : classItem.Status?.toLowerCase() === "ongoing"
                            ? "info.main"
                            : classItem.Status?.toLowerCase() === "close" ||
                              classItem.Status?.toLowerCase() === "closed"
                            ? "grey.700"
                            : "text.secondary",
                        fontWeight: 600,
                      }}
                      size="small"
                    />

                    {/* Transfer Button - Only show for ACTIVE classes */}
                    {(classItem.Status === "ACTIVE" ||
                      classItem.Status === "active" ||
                      classItem.Status === "Ongoing") && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SwapHoriz />}
                        onClick={() => handleOpenTransferModal(classItem)}
                        sx={{
                          fontSize: "0.75rem",
                          py: 0.5,
                          borderRadius: 2,
                        }}
                      >
                        Chuyển lớp
                      </Button>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 3,
                    p: 2,
                    bgcolor: "#f8f9fe",
                    borderRadius: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <People sx={{ fontSize: 20, color: "primary.main" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {classItem.StudentCount || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      học viên
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Schedule sx={{ fontSize: 20, color: "primary.main" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {classItem.TotalSessions || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      buổi học
                    </Typography>
                  </Box>
                  {classItem.Opendate && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Assignment
                        sx={{ fontSize: 20, color: "primary.main" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Khai giảng:{" "}
                        <strong>
                          {new Date(classItem.Opendate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </strong>
                      </Typography>
                    </Box>
                  )}
                </Box>

                {classItem.weeklySchedule &&
                  classItem.weeklySchedule.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          mb: 1.5,
                        }}
                      >
                        Lịch học hàng tuần:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                        {Array.from(
                          new Map(
                            classItem.weeklySchedule.map((schedule) => [
                              // Tạo key duy nhất từ ngày + giờ bắt đầu + giờ kết thúc
                              `${schedule.Day}-${schedule.StartTime}-${schedule.EndTime}`,
                              schedule,
                            ])
                          ).values()
                        ).map((schedule, index) => (
                          <Chip
                            key={index}
                            label={`${getDayVietnamese(
                              schedule.Day
                            )} ${formatTime(schedule.StartTime)}-${formatTime(
                              schedule.EndTime
                            )}`}
                            sx={{
                              bgcolor: "rgba(102,126,234,0.1)",
                              color: "primary.main",
                              fontWeight: 600,
                              borderRadius: 2,
                            }}
                            size="small"
                          />
                        ))}
                      </Box>

                      {/* Thêm phần hiển thị ngày bắt đầu và kết thúc */}
                      {(() => {
                        // Tính ngày bắt đầu và kết thúc từ weeklySchedule
                        const sortedSchedule = [
                          ...classItem.weeklySchedule,
                        ].sort((a, b) => new Date(a.Date) - new Date(b.Date));
                        const startDate = sortedSchedule[0]?.Date;
                        const endDate =
                          sortedSchedule[sortedSchedule.length - 1]?.Date;

                        return (
                          startDate &&
                          endDate && (
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  color: "text.secondary",
                                }}
                              >
                                <span role="img" aria-label="calendar">
                                  📅
                                </span>
                                <span>
                                  <strong>Thời gian khóa học:</strong>{" "}
                                  {new Date(startDate).toLocaleDateString(
                                    "vi-VN"
                                  )}{" "}
                                  -{" "}
                                  {new Date(endDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                              </Typography>

                              {/* Tùy chọn: Tính tổng số tuần học */}
                              {(() => {
                                const start = new Date(startDate);
                                const end = new Date(endDate);
                                const diffTime = Math.abs(end - start);
                                const diffWeeks = Math.ceil(
                                  diffTime / (1000 * 60 * 60 * 24 * 7)
                                );
                                return (
                                  <Chip
                                    label={`${diffWeeks} tuần`}
                                    size="small"
                                    sx={{
                                      bgcolor: "rgba(255,193,7,0.1)",
                                      color: "#ff9800",
                                      fontWeight: 600,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                );
                              })()}
                            </Box>
                          )
                        );
                      })()}
                    </Box>
                  )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyClassList;
