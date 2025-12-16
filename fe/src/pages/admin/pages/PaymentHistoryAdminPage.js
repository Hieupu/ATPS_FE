import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import { Search, ReceiptLong, CloudOff } from "@mui/icons-material";
import { getAdminPaymentHistoryApi } from "../../../apiServices/paymentService";

const PAGE_SIZE = 10;

const formatCurrency = (value) =>
  typeof value === "number"
    ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : value || "—";

const PaymentHistoryAdminPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const payosConfigured = useMemo(() => {
    return Boolean(
      process.env.REACT_APP_PAYOS_CLIENT_ID ||
        process.env.REACT_APP_PAYOS_CLIENT_KEY ||
        process.env.REACT_APP_PAYOS_CHECKSUM_KEY
    );
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminPaymentHistoryApi({
        search: searchQuery || undefined,
      });
      const list =
        (Array.isArray(data?.payments) && data.payments) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data) && data) ||
        [];
      setPayments(list);
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Không thể tải lịch sử thanh toán."
      );
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => payments, [payments]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE) || 1
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, page]);

  return (
    <Box sx={{ p: 2, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Lịch sử thanh toán
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Giám sát các giao dịch thanh toán và trạng thái PayOS.
          </Typography>
        </Box>
        <Chip
          icon={payosConfigured ? <ReceiptLong /> : <CloudOff />}
          label={
            payosConfigured ? "PayOS: ĐÃ CẤU HÌNH" : "PayOS: CHƯA CẤU HÌNH"
          }
          color={payosConfigured ? "success" : "warning"}
          sx={{ fontWeight: 700 }}
        />
      </Box>

      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              placeholder="Tìm theo order code, tên học viên, khóa học..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                },
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(searchInput.trim());
                  setPage(1);
                }
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={() => {
                  setSearchQuery(searchInput.trim());
                  setPage(1);
                }}
                startIcon={<Search />}
                sx={{ textTransform: "none" }}
              >
                Lọc
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setPage(1);
                }}
                sx={{ textTransform: "none" }}
              >
                Xóa lọc
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Học viên</TableCell>
                <TableCell>Khóa học/Lớp</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Gateway</TableCell>
                <TableCell>Thời gian</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={28} sx={{ color: "#667eea" }} />
                  </TableCell>
                </TableRow>
              ) : paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      Không có giao dịch nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.OrderCode || payment.PaymentID}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {payment.OrderCode || "—"}
                    </TableCell>
                    <TableCell>
                      {payment.LearnerName ||
                        payment.LearnerFullName ||
                        payment.FullName ||
                        "—"}
                    </TableCell>
                    <TableCell>
                      {payment.ClassName ||
                        payment.CourseTitle ||
                        payment.CourseName ||
                        "—"}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.Amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.Status || payment.PaymentStatus || "—"}
                        size="small"
                        sx={{
                          textTransform: "uppercase",
                          fontWeight: 700,
                          backgroundColor:
                            (
                              payment.Status ||
                              payment.PaymentStatus ||
                              ""
                            ).toLowerCase() === "paid"
                              ? "#dcfce7"
                              : "#fef9c3",
                          color:
                            (
                              payment.Status ||
                              payment.PaymentStatus ||
                              ""
                            ).toLowerCase() === "paid"
                              ? "#166534"
                              : "#92400e",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {payment.Gateway || payment.Provider || "—"}
                    </TableCell>
                    <TableCell>
                      {payment.CreatedAt
                        ? new Date(payment.CreatedAt).toLocaleString("vi-VN")
                        : payment.PaidAt
                        ? new Date(payment.PaidAt).toLocaleString("vi-VN")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default PaymentHistoryAdminPage;
