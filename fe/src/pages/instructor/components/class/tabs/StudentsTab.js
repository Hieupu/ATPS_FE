import React, { useState, useMemo } from "react";
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
  LinearProgress,
  Tooltip,
  Avatar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  EmailOutlined,
  PhoneOutlined,
  ViewList,
  GridOn,
  CheckCircle,
  Cancel,
  RemoveCircleOutline,
  BadgeOutlined,
} from "@mui/icons-material";

const formatDateCompact = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return dateString;
};

const StatusCell = ({ isPresent }) => {
  if (isPresent === true)
    return <CheckCircle sx={{ color: "#4caf50", fontSize: 20 }} />;
  if (isPresent === false)
    return <Cancel sx={{ color: "#ef5350", fontSize: 20 }} />;
  return <RemoveCircleOutline sx={{ color: "#e0e0e0", fontSize: 18 }} />;
};

export default function StudentsTab({ students = [] }) {
  const studentList = Array.isArray(students) ? students : [];
  const [viewMode, setViewMode] = useState("info");

  const sessionColumns = useMemo(() => {
    if (studentList.length > 0 && studentList[0].Attendance?.History) {
      return studentList[0].Attendance.History;
    }
    return [];
  }, [studentList]);

  const stickyLeftStyle = {
    position: "sticky",
    left: 0,
    zIndex: 3,
    bgcolor: "#fff",
    borderRight: "1px solid #e0e0e0",
    boxShadow: "4px 0 8px -2px rgba(0,0,0,0.05)",
  };

  const stickyRightStyle = {
    position: "sticky",
    right: 0,
    zIndex: 3,
    bgcolor: "#fff",
    borderLeft: "1px solid #e0e0e0",
    boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.05)",
  };

  if (studentList.length === 0) {
    return (
      <Box
        textAlign="center"
        py={8}
        bgcolor="white"
        borderRadius={3}
        border="1px dashed #ccc"
      >
        <Typography variant="h6" color="text.secondary">
          Chưa có dữ liệu học viên
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", pb: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
          {viewMode === "info"
            ? `Danh sách lớp (${studentList.length})`
            : "Bảng theo dõi điểm danh"}
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
          sx={{ bgcolor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        >
          <ToggleButton value="info" sx={{ px: 2, textTransform: "none" }}>
            <ViewList fontSize="small" sx={{ mr: 1 }} /> Chi tiết
          </ToggleButton>
          <ToggleButton value="matrix" sx={{ px: 2, textTransform: "none" }}>
            <GridOn fontSize="small" sx={{ mr: 1 }} /> Tổng quan
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          width: "100%",
          maxWidth: "100%",
          overflow: "auto",
          maxHeight: "calc(100vh - 220px)",
        }}
      >
        <Table
          stickyHeader
          sx={{ minWidth: viewMode === "info" ? 900 : "max-content" }}
        >
          <TableHead>
            {viewMode === "info" && (
              <TableRow
                sx={{ bgcolor: "#fafafa", borderBottom: "2px solid #eee" }}
              >
                <TableCell
                  sx={{ fontWeight: 700, color: "#666", py: 2, width: "50px" }}
                >
                  STT
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#666", width: "40%", py: 2 }}
                >
                  HỌC VIÊN
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#666", width: "30%", py: 2 }}
                >
                  LIÊN HỆ
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#666", width: "25%", py: 2 }}
                >
                  TIẾN ĐỘ KHÓA
                </TableCell>
              </TableRow>
            )}

            {viewMode === "matrix" && (
              <TableRow>
                <TableCell
                  sx={{
                    ...stickyLeftStyle,
                    zIndex: 4,
                    bgcolor: "#f8f9fa",
                    minWidth: 240,
                    py: 1.5,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <BadgeOutlined sx={{ fontSize: 18, color: "#666" }} />
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="#444"
                    >
                      HỌC VIÊN
                    </Typography>
                  </Box>
                </TableCell>

                {sessionColumns.map((session, idx) => (
                  <TableCell
                    key={session.SessionID || idx}
                    align="center"
                    sx={{
                      bgcolor: "#f8f9fa",
                      color: "#666",
                      minWidth: 70,
                      px: 0.5,
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: "1px dashed #e0e0e0",
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="#888"
                        sx={{ fontSize: "10px" }}
                      >
                        B.{idx + 1}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color="#333"
                        sx={{ fontSize: "11px" }}
                      >
                        {formatDateCompact(session.Date)}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}

                <TableCell
                  align="center"
                  sx={{
                    ...stickyRightStyle,
                    zIndex: 4,
                    bgcolor: "#f8f9fa",
                    minWidth: 100,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} color="#444">
                    TỔNG
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableHead>

          <TableBody>
            {studentList.map((s, index) => {
              const contact = s.Contact || {};
              const att = s.Attendance || {
                Progress: 0,
                Present: 0,
                TotalCurriculum: 0,
                Rate: 0,
                History: [],
              };

              if (viewMode === "info") {
                return (
                  <TableRow
                    key={s.LearnerID || index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ color: "#888", fontWeight: 500 }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={3}>
                        <Avatar
                          src={s.ProfilePicture}
                          alt={s.FullName}
                          variant="rounded"
                          sx={{
                            width: 60,
                            height: 80,
                            borderRadius: 2,
                            bgcolor: s.ProfilePicture
                              ? "transparent"
                              : "#e3f2fd",
                            color: "#1565c0",
                            fontWeight: "bold",
                            fontSize: "28px",
                            border: "1px solid #f0f0f0",
                            objectFit: "cover",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                        >
                          {s.FullName?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h7"
                            fontWeight={700}
                            sx={{ color: "#2c3e50" }}
                          >
                            {s.FullName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1.5}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box
                            sx={{
                              p: 0.5,
                              borderRadius: "50%",
                              bgcolor: "#f5f5f5",
                              display: "flex",
                            }}
                          >
                            <EmailOutlined
                              sx={{ fontSize: 18, color: "#555" }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            fontSize={14}
                          >
                            {contact.Email || "—"}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box
                            sx={{
                              p: 0.5,
                              borderRadius: "50%",
                              bgcolor: "#f5f5f5",
                              display: "flex",
                            }}
                          >
                            <PhoneOutlined
                              sx={{ fontSize: 18, color: "#555" }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            fontSize={14}
                          >
                            {contact.Phone || (
                              <span
                                style={{ color: "#aaa", fontStyle: "italic" }}
                              >
                                Chưa cập nhật
                              </span>
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box width="100%" pr={2}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="text.secondary"
                          >
                            Đã học
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="primary.main"
                          >
                            {att.Present}/{att.TotalCurriculum} buổi
                          </Typography>
                        </Box>
                        <Tooltip title={`Tiến độ: ${att.Progress}% toàn khóa`}>
                          <LinearProgress
                            variant="determinate"
                            value={att.Progress}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: "#f0f0f0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 5,
                                bgcolor: "primary.main",
                              },
                            }}
                          />
                        </Tooltip>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ mt: 0.5, display: "block", textAlign: "right" }}
                        >
                          {att.Progress}% hoàn thành
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow key={s.LearnerID || index} hover>
                  <TableCell sx={{ ...stickyLeftStyle, py: 1 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        src={s.ProfilePicture}
                        variant="rounded"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          border: "1px solid #eee",
                        }}
                      >
                        {s.FullName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="#333"
                          noWrap
                          sx={{ maxWidth: 160 }}
                        >
                          {s.FullName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {sessionColumns.map((colSession) => {
                    const studentSession = att.History?.find(
                      (h) => h.SessionID === colSession.SessionID
                    );
                    return (
                      <TableCell
                        key={colSession.SessionID}
                        align="center"
                        sx={{ borderRight: "1px dashed #eee", p: 0.5 }}
                      >
                        <StatusCell
                          isPresent={
                            studentSession ? studentSession.IsPresent : null
                          }
                        />
                      </TableCell>
                    );
                  })}

                  <TableCell align="center" sx={{ ...stickyRightStyle }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        fontWeight: "bold",
                        fontSize: "12px",
                        border: `2px solid ${
                          att.Rate >= 80
                            ? "#4caf50"
                            : att.Rate >= 50
                            ? "#ff9800"
                            : "#ef5350"
                        }`,
                        color:
                          att.Rate >= 80
                            ? "#2e7d32"
                            : att.Rate >= 50
                            ? "#e65100"
                            : "#c62828",
                        bgcolor:
                          att.Rate >= 80
                            ? "#e8f5e9"
                            : att.Rate >= 50
                            ? "#fff3e0"
                            : "#ffebee",
                      }}
                    >
                      {att.Rate}%
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
