import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Email, Phone } from "@mui/icons-material";

export default function StudentsTab({ students = [] }) {
  // Bảo vệ tuyệt đối
  const studentList = Array.isArray(students) ? students : [];

  if (studentList.length === 0) {
    return (
      <Box textAlign="center" py={8}>
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
      sx={{ border: 1, borderColor: "divider" }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "grey.50" }}>
            <TableCell sx={{ fontWeight: 700 }}>STT</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Học viên</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Số điện thoại</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {studentList.map((s, i) => (
            <TableRow key={s.LearnerID} hover>
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={s.ProfilePicture}
                    sx={{ bgcolor: "primary.main" }}
                  >
                    {s.FullName?.[0]}
                  </Avatar>
                  <Typography fontWeight={600}>{s.FullName}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color="action" />
                  {s.Email || "—"}
                </Box>
              </TableCell>
              <TableCell>
                {s.Phone ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    {s.Phone}
                  </Box>
                ) : (
                  <Chip label="Chưa có" size="small" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
