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
  Avatar,
  Chip,
} from "@mui/material";
import { format } from "date-fns";

export default function AttendanceModal({
  open,
  session,
  attendanceSheet = [],
  saving,
  onClose,
  onSave,
}) {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (attendanceSheet && attendanceSheet.length > 0) {
      setList([...attendanceSheet]);
    }
  }, [attendanceSheet]);

  const toggleStatus = (learnerId) => {
    setList((prev) =>
      prev.map((item) =>
        item.learnerId === learnerId
          ? {
              ...item,
              status: item.status === "PRESENT" ? "ABSENT" : "PRESENT",
            }
          : item
      )
    );
  };

  const handleSave = () => {
    const payload = list.map(({ learnerId, status }) => ({
      LearnerID: learnerId,
      Status: status,
    }));
    onSave(payload);
  };

  if (!session) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", md: 900 },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
        }}
      >
        {/* Tiêu đề buổi học */}
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Điểm danh – {session.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {format(new Date(session.date), "EEEE, dd/MM/yyyy")} •{" "}
          {session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}
        </Typography>

        {/* Bảng điểm danh */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Học viên</TableCell>
              <TableCell align="center" width={180}>
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((item) => (
              <TableRow key={item.learnerId}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar src={item.avatar || "/default-avatar.png"} />
                    <Typography fontWeight={500}>{item.fullName}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={item.status === "PRESENT" ? "Có mặt" : "Vắng"}
                    color={item.status === "PRESENT" ? "success" : "error"}
                    onClick={() => toggleStatus(item.learnerId)}
                    sx={{
                      cursor: "pointer",
                      minWidth: 110,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Nút hành động */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu điểm danh"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
