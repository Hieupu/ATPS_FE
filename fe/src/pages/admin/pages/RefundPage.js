import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  Menu,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Search,
  MoreVert,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  AccountBalanceWallet,
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";
import refundService from "../../../apiServices/refundService";
import "./style.css";

export default function RefundPage() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRefunds();
  }, [tabValue, page, searchQuery]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError(null);

      let status = null;
      if (tabValue === 1) status = "pending";
      else if (tabValue === 2) status = "completed";
      else if (tabValue === 3) status = "rejected";

      const params = {
        page,
        limit: 10,
        status,
        search: searchQuery,
      };

      const response = await refundService.getAllRefunds(params);
      setRefunds(response.data?.data || response.data || []);
      setTotalPages(
        response.data?.pagination?.totalPages || response.pagination?.totalPages || 1
      );
    } catch (error) {
      console.error("Error loading refunds:", error);
      setError("Không thể tải danh sách yêu cầu hoàn tiền");
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, refund) => {
    setAnchorEl(event.currentTarget);
    setSelectedRefund(refund);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRefund(null);
  };

  const handleApprove = async (refund) => {
    try {
      await refundService.approveRefund(refund.RefundID);
      handleMenuClose();
      loadRefunds();
    } catch (error) {
      console.error("Error approving refund:", error);
      setError(error.message || "Không thể duyệt yêu cầu hoàn tiền");
    }
  };

  const handleReject = async () => {
    try {
      await refundService.rejectRefund(selectedRefund.RefundID, rejectionReason);
      setOpenRejectDialog(false);
      setRejectionReason("");
      handleMenuClose();
      loadRefunds();
    } catch (error) {
      console.error("Error rejecting refund:", error);
      setError(error.message || "Không thể từ chối yêu cầu hoàn tiền");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "pending":
        return { bg: "#e0e7ff", color: "#6366f1" };
      case "rejected":
        return { bg: "#fee2e2", color: "#dc2626" };
      default:
        return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Đã hoàn tiền";
      case "pending":
        return "Chờ xử lý";
      case "rejected":
        return "Đã từ chối";
      default:
        return status || "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "pending":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case "rejected":
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const displayRefunds = refunds;
  const pendingCount = refunds.filter((r) => r.Status?.toLowerCase() === "pending").length;
  const completedCount = refunds.filter((r) => r.Status?.toLowerCase() === "completed").length;
  const rejectedCount = refunds.filter((r) => r.Status?.toLowerCase() === "rejected").length;

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Xử lý Hoàn tiền
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Quản lý và xử lý các yêu cầu hoàn tiền của học viên
            </Typography>
          </Box>
        </Box>

        {/* Search */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            placeholder="Tìm kiếm theo tên học viên, lớp học..."
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#fff",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue);
            setPage(1);
          }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              minHeight: "48px",
            },
            "& .Mui-selected": {
              color: "#667eea",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#667eea",
            },
          }}
        >
          <Tab label={`Tất cả (${refunds.length})`} />
          <Tab label={`Chờ xử lý (${pendingCount})`} />
          <Tab label={`Đã hoàn tiền (${completedCount})`} />
          <Tab label={`Đã từ chối (${rejectedCount})`} />
        </Tabs>
      </Box>

      {/* Refunds Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#667eea" }} />
        </Box>
      ) : displayRefunds.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <AccountBalanceWallet sx={{ fontSize: 64, color: "#cbd5e0", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            Không có yêu cầu hoàn tiền nào
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Mã yêu cầu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Học viên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Lớp học</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Số tiền</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ngày yêu cầu</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Lý do</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayRefunds.map((refund) => (
                  <TableRow key={refund.RefundID} hover>
                    <TableCell>#{refund.RefundID}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {refund.LearnerName || "N/A"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          {refund.LearnerEmail || ""}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{refund.ClassName || "N/A"}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatCurrency(refund.PaymentAmount || refund.ClassFee)}
                    </TableCell>
                    <TableCell>{formatDate(refund.RequestDate)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={refund.Reason}
                      >
                        {refund.Reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(refund.Status)}
                        size="small"
                        icon={getStatusIcon(refund.Status)}
                        sx={{
                          backgroundColor: getStatusColor(refund.Status).bg,
                          color: getStatusColor(refund.Status).color,
                          fontWeight: 600,
                          height: 26,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {refund.Status?.toLowerCase() === "pending" && (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApprove(refund)}
                              sx={{
                                textTransform: "none",
                                backgroundColor: "#10b981",
                                "&:hover": {
                                  backgroundColor: "#059669",
                                },
                              }}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={() => {
                                setSelectedRefund(refund);
                                setOpenRejectDialog(true);
                              }}
                              sx={{
                                textTransform: "none",
                                borderColor: "#ef4444",
                                color: "#ef4444",
                                "&:hover": {
                                  borderColor: "#dc2626",
                                  backgroundColor: "#fef2f2",
                                },
                              }}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setSelectedRefund(refund);
                            setOpenDetailDialog(true);
                          }}
                        >
                          <Visibility sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Chi tiết yêu cầu hoàn tiền</DialogTitle>
        <DialogContent>
          {selectedRefund && (
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Mã yêu cầu
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  #{selectedRefund.RefundID}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Học viên
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedRefund.LearnerName || "N/A"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  {selectedRefund.LearnerEmail || ""}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Lớp học
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedRefund.ClassName || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Số tiền
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#ef4444" }}>
                  {formatCurrency(selectedRefund.PaymentAmount || selectedRefund.ClassFee)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Ngày yêu cầu
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedRefund.RequestDate)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Lý do hoàn tiền
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedRefund.Reason || "Không có lý do"}
                  </Typography>
                </Paper>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Trạng thái
                </Typography>
                <Chip
                  label={getStatusLabel(selectedRefund.Status)}
                  size="small"
                  icon={getStatusIcon(selectedRefund.Status)}
                  sx={{
                    backgroundColor: getStatusColor(selectedRefund.Status).bg,
                    color: getStatusColor(selectedRefund.Status).color,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setOpenDetailDialog(false)}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={() => {
          setOpenRejectDialog(false);
          setRejectionReason("");
        }}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Từ chối yêu cầu hoàn tiền</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
              Vui lòng nhập lý do từ chối:
            </Typography>
            <TextareaAutosize
              minRows={4}
              placeholder="Nhập lý do từ chối..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setOpenRejectDialog(false);
              setRejectionReason("");
            }}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleReject}
            disabled={!rejectionReason.trim()}
            sx={{
              textTransform: "none",
              backgroundColor: "#ef4444",
              "&:hover": { backgroundColor: "#dc2626" },
            }}
          >
            Từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


