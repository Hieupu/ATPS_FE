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
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
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

  // Khởi tạo state khi mở modal
  useEffect(() => {
    if (attendanceSheet && attendanceSheet.length > 0) {
      // Đảm bảo mỗi item đều có trường note, nếu chưa có thì set rỗng
      const initializedList = attendanceSheet.map((item) => ({
        ...item,
        note: item.note || "",
        status: item.status || "PRESENT", // Mặc định là có mặt nếu chưa có status
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
    // Map lại đúng định dạng backend cần (Lưu ý: note viết thường)
    const payload = list.map(({ learnerId, status, note }) => ({
      LearnerID: learnerId,
      Status: status,
      note: note || "",
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
          width: { xs: "95%", md: 1000 }, // Tăng chiều rộng một chút để chứa cột note
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
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="30%">Học viên</TableCell>
              <TableCell width="30%" align="center">
                Trạng thái
              </TableCell>
              <TableCell width="40%">Ghi chú (Lý do vắng)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((item) => (
              <TableRow key={item.learnerId} hover>
                {/* Cột 1: Thông tin học viên */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar src={item.avatar || "/default-avatar.png"} />
                    <Box>
                      <Typography fontWeight={500}>{item.fullName}</Typography>
                      {/* Có thể thêm email hoặc ID nhỏ ở dưới nếu cần */}
                    </Box>
                  </Box>
                </TableCell>

                {/* Cột 2: Radio Button Trạng thái */}
                <TableCell align="center">
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
                      label="Có mặt"
                      sx={{ mr: 2 }}
                    />
                    <FormControlLabel
                      value="ABSENT"
                      control={<Radio color="error" size="small" />}
                      label="Vắng"
                    />
                  </RadioGroup>
                </TableCell>

                {/* Cột 3: Ghi chú */}
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nhập lý do..."
                    value={item.note}
                    onChange={(e) =>
                      handleNoteChange(item.learnerId, e.target.value)
                    }
                    // Nếu muốn chỉ cho nhập khi vắng thì bỏ comment dòng dưới
                    // disabled={item.status === "PRESENT"}
                    sx={{
                      "& .MuiInputBase-root": {
                        backgroundColor:
                          item.status === "ABSENT" ? "#fff5f5" : "inherit",
                      },
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
            pt: 2,
            borderTop: "1px solid #eee",
          }}
        >
          <Button onClick={onClose} disabled={saving} variant="outlined">
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
