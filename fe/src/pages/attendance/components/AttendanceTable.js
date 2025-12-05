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
  Avatar,
  Chip,
  Alert,
  TextField,
  MenuItem,
} from "@mui/material";
import { CheckCircle, Cancel, AccessTime, Person } from "@mui/icons-material";

const AttendanceTable = ({ 
  attendance, 
  filterStatus, 
  onFilterChange, 
  isPast = false 
}) => {
  // Hàm lọc dữ liệu theo trạng thái
  const getFilteredAttendance = () => {
    if (!attendance || !Array.isArray(attendance)) return [];
    
    if (filterStatus === "all") return attendance;
    
    return attendance.filter(item => {
      const itemStatus = item.Status?.toLowerCase();
      const filterStatusLower = filterStatus?.toLowerCase();
      return itemStatus === filterStatusLower;
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "success";
      case "absent":
        return "error";
      case "late":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return <CheckCircle />;
      case "absent":
        return <Cancel />;
      case "late":
        return <AccessTime />;
      default:
        return null;
    }
  };

  const filteredAttendance = getFilteredAttendance();

  return (
    <>
         {isPast && (
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          value={filterStatus}
          onChange={onFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Tất cả trạng thái</MenuItem>
          <MenuItem value="present">Có mặt</MenuItem>
          <MenuItem value="late">Đi muộn</MenuItem>
          <MenuItem value="absent">Vắng mặt</MenuItem>
        </TextField>
      </Box>
             )}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell>Buổi học</TableCell>
              <TableCell>Khóa học / Lớp</TableCell>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAttendance.map((item) => (
              <TableRow key={item.AttendanceID || item.SessionID} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.SessionDate ? new Date(item.SessionDate).toLocaleDateString("vi-VN") : "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.DayOfWeek || ""}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.SessionTitle || "Không có tiêu đề"}</Typography>
                  {item.SessionDescription && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.SessionDescription}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.CourseTitle || "Không xác định"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.ClassName || ""}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar 
                      src={item.InstructorAvatar} 
                      sx={{ width: 32, height: 32 }}
                    >
                      <Person />
                    </Avatar>
                    <Typography variant="body2">
                      {item.InstructorName || "Không xác định"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.Time || "N/A"}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={getStatusIcon(item.Status)}
                    label={item.StatusText || item.Status || "Không xác định"}
                    color={getStatusColor(item.Status)}
                    size="small"
                  />
                </TableCell>
                {/* {isPast && (
                  <TableCell align="center">
                    <Chip
                      label={`${item.TotalPresent || 0}/${item.TotalLearners || 0}`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                )} */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAttendance.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {attendance.length === 0 
            ? "Không có dữ liệu điểm danh." 
            : "Không có buổi học nào phù hợp với bộ lọc."
          }
        </Alert>
      )}
    </>
  );
};

export default AttendanceTable;