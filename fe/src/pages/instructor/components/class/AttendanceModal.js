import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Paper,
  TableContainer,
  Divider,
} from "@mui/material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Person, CheckCircle, Cancel } from "@mui/icons-material";

export default function AttendanceModal({
  open,
  session,
  attendanceSheet = [],
  saving,
  onClose,
  onSave,
}) {
  const [list, setList] = useState([]);

  // Khởi tạo state khi mở modal
  useEffect(() => {
    if (attendanceSheet && attendanceSheet.length > 0) {
      const initializedList = attendanceSheet.map((item) => ({
        ...item,
        note: item.note || "",
        status: item.status || "PRESENT",
      }));
      setList(initializedList);
    }
  }, [attendanceSheet]);

  // Xử lý khi thay đổi Radio (Có mặt/Vắng)
  const handleStatusChange = (learnerId, newStatus) => {
    setList((prev) =>
      prev.map((item) =>
        item.learnerId === learnerId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Xử lý khi nhập Note
  const handleNoteChange = (learnerId, newNote) => {
    setList((prev) =>
      prev.map((item) =>
        item.learnerId === learnerId ? { ...item, note: newNote } : item
      )
    );
  };

  const handleSave = () => {
    const payload = list.map(({ learnerId, status, note }) => ({
      LearnerID: learnerId,
      Status: status,
      note: note || "",
    }));
    onSave(payload);
  };

  // Thống kê
  const presentCount = list.filter((item) => item.status === "PRESENT").length;
  const absentCount = list.filter((item) => item.status === "ABSENT").length;

  if (!session) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "90%", md: "85%", lg: 1200 },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header cố định */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            📋 Điểm danh buổi học
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <Chip
              label={session.title}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
            <Typography color="text.secondary">
              {format(new Date(session.date), "EEEE, dd/MM/yyyy", {
                locale: vi,
              })}
            </Typography>
            <Typography color="text.secondary">
              {session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}
            </Typography>
          </Box>

          {/* Thống kê */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Chip
              icon={<CheckCircle />}
              label={`Có mặt: ${presentCount}`}
              color="success"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<Cancel />}
              label={`Vắng: ${absentCount}`}
              color="error"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Tổng: ${list.length}`}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        <Divider />

        {/* Bảng điểm danh - có thể cuộn */}
        <TableContainer
          sx={{
            flex: 1,
            overflow: "auto",
            maxHeight: "calc(90vh - 240px)",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: "grey.50",
                    fontWeight: 700,
                    width: "60px",
                  }}
                >
                  STT
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "grey.50",
                    fontWeight: 700,
                    width: "100px",
                  }}
                >
                  Ảnh 3x4
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "grey.50",
                    fontWeight: 700,
                    minWidth: "180px",
                  }}
                >
                  Họ và tên
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "grey.50",
                    fontWeight: 700,
                    width: "200px",
                  }}
                  align="center"
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "grey.50",
                    fontWeight: 700,
                    minWidth: "250px",
                  }}
                >
                  Ghi chú
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((item, index) => (
                <TableRow
                  key={item.learnerId}
                  hover
                  sx={{
                    bgcolor:
                      item.status === "ABSENT" ? "error.50" : "transparent",
                  }}
                >
                  {/* STT */}
                  <TableCell>
                    <Typography fontWeight={500}>{index + 1}</Typography>
                  </TableCell>

                  {/* Ảnh 3x4 */}
                  <TableCell>
                    <Box
                      sx={{
                        width: 60,
                        height: 80,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: 1,
                        borderColor: "divider",
                        bgcolor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.fullName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Person sx={{ fontSize: 32, color: "grey.400" }} />
                      )}
                    </Box>
                  </TableCell>

                  {/* Họ tên */}
                  <TableCell>
                    <Typography fontWeight={600}>{item.fullName}</Typography>
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell>
                    <RadioGroup
                      row
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.learnerId, e.target.value)
                      }
                      sx={{ justifyContent: "center" }}
                    >
                      <FormControlLabel
                        value="PRESENT"
                        control={<Radio color="success" size="small" />}
                        label={
                          <Typography variant="body2" fontWeight={500}>
                            Có mặt
                          </Typography>
                        }
                        sx={{ mr: 1 }}
                      />
                      <FormControlLabel
                        value="ABSENT"
                        control={<Radio color="error" size="small" />}
                        label={
                          <Typography variant="body2" fontWeight={500}>
                            Vắng
                          </Typography>
                        }
                      />
                    </RadioGroup>
                  </TableCell>

                  {/* Ghi chú */}
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={
                        item.status === "ABSENT"
                          ? "Nhập lý do vắng..."
                          : "Ghi chú (nếu có)"
                      }
                      value={item.note}
                      onChange={(e) =>
                        handleNoteChange(item.learnerId, e.target.value)
                      }
                      multiline
                      maxRows={2}
                      sx={{
                        "& .MuiInputBase-root": {
                          backgroundColor:
                            item.status === "ABSENT" ? "#fff5f5" : "white",
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        {/* Footer cố định */}
        <Box
          sx={{
            p: 3,
            pt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            💡 Chọn trạng thái và nhập ghi chú cho từng học viên
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={onClose}
              disabled={saving}
              variant="outlined"
              size="large"
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? "Đang lưu..." : "💾 Lưu điểm danh"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
