import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  Email,
  Phone,
  Warning,
  CheckCircle,
  Person,
  School, // Icon cho tiến độ
} from "@mui/icons-material";

// Component hiển thị vòng tròn phần trăm (Giữ nguyên vì đang đẹp)
function CircularProgressWithLabel({ value, color }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={45}
        thickness={5}
        sx={{ color: (theme) => theme.palette.grey[200] }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        color={color}
        size={45}
        thickness={5}
        sx={{
          position: "absolute",
          left: 0,
          [`& .MuiCircularProgress-circle`]: { strokeLinecap: "round" },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          fontWeight="bold"
          color="text.secondary"
        >
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default function StudentsTab({ students = [] }) {
  const studentList = Array.isArray(students) ? students : [];

  const getAttendanceColor = (rate) => {
    if (rate >= 80) return "success";
    if (rate >= 50) return "warning";
    return "error";
  };

  if (studentList.length === 0) {
    return (
      <Box textAlign="center" py={8} bgcolor="white" borderRadius={2}>
        <Typography variant="h6" color="text.secondary">
          Chưa có học viên nào trong lớp
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}
    >
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
            <TableCell sx={{ fontWeight: 700, width: "50px" }}>STT</TableCell>
            <TableCell sx={{ fontWeight: 700, width: "30%" }}>
              Thông tin học viên
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Liên hệ</TableCell>
            {/* THÊM: Cột tiến độ khóa học */}
            <TableCell
              sx={{ fontWeight: 700, width: "15%", textAlign: "center" }}
            >
              Tiến độ khóa
            </TableCell>
            <TableCell
              sx={{ fontWeight: 700, width: "20%", textAlign: "center" }}
            >
              Chuyên cần
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {studentList.map((s, index) => {
            const contact = s.Contact || {};

            // Map dữ liệu mới từ Backend
            const att = s.Attendance || {
              Rate: 100,
              Absent: 0,
              Present: 0,
              TotalOccurred: 0,
              TotalCurriculum: 0,
              Progress: 0,
            };

            const colorStatus = getAttendanceColor(att.Rate);

            return (
              <TableRow key={s.LearnerID} hover>
                <TableCell>{index + 1}</TableCell>

                {/* --- Cột 1: Thông tin học viên --- */}
                <TableCell>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    {s.ProfilePicture ? (
                      <Box
                        component="img"
                        src={s.ProfilePicture}
                        alt={s.FullName}
                        sx={{
                          width: 50,
                          height: 66, // 3:4 ratio nhỏ hơn chút cho gọn
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid #eee",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 50,
                          height: 66,
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "20px",
                          border: "1px solid #bbdefb",
                        }}
                      >
                        {s.FullName?.charAt(0)?.toUpperCase()}
                      </Box>
                    )}
                    <Box pt={0.5}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {s.FullName}
                      </Typography>
                      {/* ID ẩn */}
                    </Box>
                  </Box>
                </TableCell>

                {/* --- Cột 2: Liên hệ --- */}
                <TableCell>
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" fontSize={13}>
                        {contact.Email || "—"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" fontSize={13}>
                        {contact.Phone || (
                          <span style={{ color: "#aaa", fontStyle: "italic" }}>
                            Chưa có
                          </span>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* --- Cột 3 (MỚI): Tiến độ khóa học --- */}
                <TableCell align="center">
                  <Box width="100%" px={1}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mb={0.5}
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {att.Progress}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {att.Present}/{att.TotalCurriculum} buổi
                      </Typography>
                    </Box>
                    <Tooltip
                      title={`Đã tham gia ${att.Present} trên tổng ${att.TotalCurriculum} buổi dự kiến`}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={att.Progress}
                        sx={{
                          height: 6,
                          borderRadius: 5,
                          bgcolor: "#eee",
                          "& .MuiLinearProgress-bar": { borderRadius: 5 },
                        }}
                      />
                    </Tooltip>
                  </Box>
                </TableCell>

                {/* --- Cột 4: Chuyên cần (Dựa trên số buổi ĐÃ HỌC) --- */}
                <TableCell align="center">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1.5}
                  >
                    <CircularProgressWithLabel
                      value={att.Rate}
                      color={colorStatus}
                    />

                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-start"
                    >
                      {att.Absent > 0 ? (
                        <Chip
                          icon={<Warning style={{ fontSize: 12 }} />}
                          label={`Vắng: ${att.Absent}`}
                          size="small"
                          color="error" // Luôn đỏ nếu vắng để chú ý
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: "11px",
                            fontWeight: 600,
                            mb: 0.5,
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<CheckCircle style={{ fontSize: 12 }} />}
                          label="Đầy đủ"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: "11px",
                            fontWeight: 600,
                            mb: 0.5,
                          }}
                        />
                      )}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "11px" }}
                      >
                        (Trên {att.TotalOccurred} buổi)
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
