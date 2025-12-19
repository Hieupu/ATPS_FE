import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import dayjs from "dayjs";
import { Search } from "@mui/icons-material";
import {
  getInstructorPayrollApi,
  getAllInstructorsApi,
} from "../../../apiServices/payrollService";

const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "—";
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};

const PayrollPage = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(3, "month"));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [grandTotals, setGrandTotals] = useState({
    baseSalary: 0,
    expectedTeachingSalary: 0,
    totalSalaryActual: 0,
    totalSessionsActual: 0,
    totalHoursActual: 0,
    totalSalaryPlanned: 0,
    totalSessionsPlanned: 0,
    totalHoursPlanned: 0,
  });

  const fetchInstructors = async () => {
    try {
      const response = await getAllInstructorsApi();
      const data = response?.data || [];
      setInstructors(data);
    } catch (err) {
      // Silent fail for instructors loading
    }
  };

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDateStr = startDate.format("YYYY-MM-DD");
      const endDateStr = endDate.format("YYYY-MM-DD");
      const instructorId = selectedInstructor?.InstructorID || null;

      const response = await getInstructorPayrollApi(
        startDateStr,
        endDateStr,
        instructorId
      );
      const data = response?.data || [];
      const grandTotalsData = response?.grandTotals || {
        baseSalary: 0,
        expectedTeachingSalary: 0,
        totalSalaryActual: 0,
        totalSessionsActual: 0,
        totalHoursActual: 0,
        totalSalaryPlanned: 0,
        totalSessionsPlanned: 0,
        totalHoursPlanned: 0,
      };
      setPayrollData(data);
      setGrandTotals(grandTotalsData);
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Không thể tải dữ liệu báo cáo lương."
      );
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleQuickFilter = (months) => {
    const newEndDate = dayjs();
    const newStartDate = dayjs().subtract(months, "month");
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleApplyFilter = () => {
    fetchPayroll();
  };

  return (
    <Box sx={{ p: 2, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Báo cáo lương giảng viên
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Xem báo cáo lương giảng viên theo khoảng thời gian (Mỗi buổi = 2 giờ)
        </Typography>
      </Box>

      {/* Filter Section */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          {/* First Row: Quick Filters and Date Range */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography sx={{ fontWeight: 600, minWidth: 100 }}>
              Lọc nhanh:
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickFilter(3)}
              sx={{ textTransform: "none" }}
            >
              3 tháng
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickFilter(6)}
              sx={{ textTransform: "none" }}
            >
              6 tháng
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickFilter(12)}
              sx={{ textTransform: "none" }}
            >
              12 tháng
            </Button>

            <Box sx={{ flex: 1, minWidth: 200 }} />

            <TextField
              label="Từ ngày"
              type="date"
              size="small"
              value={startDate.format("YYYY-MM-DD")}
              onChange={(e) => setStartDate(dayjs(e.target.value))}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            <TextField
              label="Đến ngày"
              type="date"
              size="small"
              value={endDate.format("YYYY-MM-DD")}
              onChange={(e) => setEndDate(dayjs(e.target.value))}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />

            <Button
              variant="contained"
              onClick={handleApplyFilter}
              sx={{
                textTransform: "none",
                backgroundColor: "#667eea",
                "&:hover": { backgroundColor: "#5568d3" },
              }}
            >
              Áp dụng
            </Button>
          </Stack>

          {/* Second Row: Instructor Search and Dropdown */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography sx={{ fontWeight: 600, minWidth: 100 }}>
              Giảng viên:
            </Typography>
            <Autocomplete
              options={instructors}
              getOptionLabel={(option) => option.FullName || ""}
              value={selectedInstructor}
              onChange={(event, newValue) => {
                setSelectedInstructor(newValue);
              }}
              size="small"
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Tìm kiếm hoặc chọn giảng viên..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText="Không tìm thấy giảng viên"
              isOptionEqualToValue={(option, value) =>
                option.InstructorID === value.InstructorID
              }
            />
            {selectedInstructor && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedInstructor(null)}
                sx={{ textTransform: "none" }}
              >
                Xóa lọc
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Payroll Table */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
            }}
          >
            <CircularProgress sx={{ color: "#667eea" }} />
          </Box>
        ) : payrollData.length === 0 ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Không có dữ liệu báo cáo lương trong khoảng thời gian đã chọn
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              maxHeight: "calc(100vh - 400px)",
              position: "relative",
            }}
          >
            <Table stickyHeader sx={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
              </colgroup>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Giảng viên</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Lương cơ bản (theo giờ)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Lương giảng dạy dự kiến (theo buổi)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Tổng lương thực tế
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Tổng buổi dạy thực tế
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Tổng giờ dạy thực tế
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Tổng lương dự kiến
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Tổng buổi dạy dự kiến
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Tổng giờ dạy dự kiến
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollData.map((row) => (
                  <TableRow key={row.InstructorID} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.FullName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.BaseSalary)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.ExpectedTeachingSalary)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.TotalSalaryActual)}
                    </TableCell>
                    <TableCell align="right">
                      {row.TotalSessionsActual}
                    </TableCell>
                    <TableCell align="right">
                      {row.TotalHoursActual || row.TotalSessionsActual * 2} giờ
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.TotalSalaryPlanned)}
                    </TableCell>
                    <TableCell align="right">
                      {row.TotalSessionsPlanned}
                    </TableCell>
                    <TableCell align="right">
                      {row.TotalHoursPlanned || row.TotalSessionsPlanned * 2}{" "}
                      giờ
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Sticky Footer - Grand Totals */}
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "#f8fafc",
                borderTop: "2px solid #e2e8f0",
                zIndex: 10,
              }}
            >
              <Table sx={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "9%" }} />
                </colgroup>
                <TableBody>
                  <TableRow
                    sx={{ backgroundColor: "#f8fafc", fontWeight: 700 }}
                  >
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      TỔNG CỘNG (Toàn bộ)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {formatCurrency(grandTotals.baseSalary)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {formatCurrency(grandTotals.expectedTeachingSalary)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {formatCurrency(grandTotals.totalSalaryActual)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {grandTotals.totalSessionsActual}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {grandTotals.totalHoursActual ||
                        grandTotals.totalSessionsActual * 2}{" "}
                      giờ
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {formatCurrency(grandTotals.totalSalaryPlanned)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {grandTotals.totalSessionsPlanned}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                    >
                      {grandTotals.totalHoursPlanned ||
                        grandTotals.totalSessionsPlanned * 2}{" "}
                      giờ
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
};

export default PayrollPage;
