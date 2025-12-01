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
  Chip,
} from "@mui/material";
import { Email, Phone } from "@mui/icons-material";

export default function StudentsTab({ students = [] }) {
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
            <TableCell sx={{ fontWeight: 700, width: "50px" }}>STT</TableCell>
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
                  {s.ProfilePicture ? (
                    <Box
                      component="img"
                      src={s.ProfilePicture}
                      alt={s.FullName}
                      sx={{
                        width: 60,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 1.5,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        border: "1px solid #eee",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 60,
                        height: 80,
                        bgcolor: "primary.light",
                        color: "white",
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "24px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {s.FullName?.charAt(0)?.toUpperCase()}
                    </Box>
                  )}

                  <Typography fontWeight={600} variant="subtitle1">
                    {s.FullName}
                  </Typography>
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
                  <Chip label="Chưa có" size="small" variant="outlined" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
