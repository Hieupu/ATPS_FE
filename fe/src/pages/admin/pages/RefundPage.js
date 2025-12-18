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
  MenuItem,
  Snackbar,
  Divider,
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
  ArrowDropDown,
  Send,
  FilterList,
} from "@mui/icons-material";
import refundService from "../../../apiServices/refundService";
import classService from "../../../apiServices/classService";
import "./style.css";
import ChangeClassDialog from "../components/refund/ChangeClassDialog";

export default function RefundPage() {
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [actionRefund, setActionRefund] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    cancelled: 0,
    classpending: 0,
    classapproved: 0,
    classcancelled: 0,
  });
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success, error, warning, info
  });
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [classModalLoading, setClassModalLoading] = useState(false);
  const [classModalError, setClassModalError] = useState("");
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassOption, setSelectedClassOption] = useState(null);
  const [classScheduleSummaries, setClassScheduleSummaries] = useState({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  useEffect(() => {
    loadRefunds();
  }, [tabValue, page, appliedSearchQuery, appliedDateFrom, appliedDateTo]);

  useEffect(() => {
    loadStatusCounts();
  }, [appliedDateFrom, appliedDateTo, appliedSearchQuery]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError(null);

      let status = null;
      if (tabValue === 1) status = "pending";
      else if (tabValue === 2) status = "approved";
      else if (tabValue === 3) status = "cancelled";
      else if (tabValue === 4) status = "classpending";
      else if (tabValue === 5) status = "classapproved";
      else if (tabValue === 6) status = "classcancelled";

      const params = {
        page,
        limit: 10,
        status,
        search: appliedSearchQuery,
      };

      // Thêm filter thời gian nếu có
      if (appliedDateFrom) {
        params.dateFrom = appliedDateFrom;
      }
      if (appliedDateTo) {
        params.dateTo = appliedDateTo;
      }

      const response = await refundService.getAllRefunds(params);

      // Backend trả về: { success: true, data: [...], pagination: {...} }
      let refundsData = response.data || [];

      // Sắp xếp mới nhất lên đầu (theo RequestDate giảm dần)
      if (Array.isArray(refundsData)) {
        refundsData = [...refundsData].sort((a, b) => {
          const dateA = new Date(a.RequestDate || 0);
          const dateB = new Date(b.RequestDate || 0);
          return dateB - dateA; // Mới nhất lên đầu
        });
      }

      const pagination = response.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      setRefunds(refundsData);
      setTotal(pagination.total || 0);
      setTotalPages(pagination.totalPages || 1);
      setError(null);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải danh sách yêu cầu hoàn tiền";
      setError(errorMessage);
      setRefunds([]);
      setTotal(0);
      setTotalPages(1);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatusCounts = async () => {
    try {
      const statuses = [
        null,
        "pending",
        "approved",
        "cancelled",
        "classpending",
        "classapproved",
        "classcancelled",
      ];
      const counts = {
        all: 0,
        pending: 0,
        approved: 0,
        cancelled: 0,
        classpending: 0,
        classapproved: 0,
        classcancelled: 0,
      };

      const responses = await Promise.all(
        statuses.map((status) => {
          const params = {
            page: 1,
            limit: 1,
            status,
            search: appliedSearchQuery,
          };

          // Áp dụng filter thời gian nếu có
          if (appliedDateFrom) {
            params.dateFrom = appliedDateFrom;
          }
          if (appliedDateTo) {
            params.dateTo = appliedDateTo;
          }

          return refundService.getAllRefunds(params);
        })
      );

      responses.forEach((response, index) => {
        const pagination = response.pagination || { total: 0 };
        const total = pagination.total || 0;

        if (index === 0) counts.all = total;
        else if (index === 1) counts.pending = total;
        else if (index === 2) counts.approved = total;
        else if (index === 3) counts.cancelled = total;
        else if (index === 4) counts.classpending = total;
        else if (index === 5) counts.classapproved = total;
        else if (index === 6) counts.classcancelled = total;
      });

      setStatusCounts(counts);
    } catch (error) {
      // Silent fail for status counts
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
      const isClassRequest = refund?.Status?.toLowerCase()?.startsWith("class");

      if (isClassRequest) {
        // Xử lý yêu cầu chuyển lớp
        await refundService.updateRefund(refund.RefundID, {
          Status: "classapproved",
        });
      } else {
        // Xử lý yêu cầu hoàn tiền
        await refundService.approveRefund(refund.RefundID);
      }

      handleMenuClose();
      await loadRefunds();
      await loadStatusCounts();
      setError(null);
      setSnackbar({
        open: true,
        message: isClassRequest
          ? "Duyệt yêu cầu chuyển lớp thành công"
          : "Hoàn tiền thành công",
        severity: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể duyệt yêu cầu hoàn tiền";
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleReject = async () => {
    try {
      const isClassRequest =
        selectedRefund?.Status?.toLowerCase()?.startsWith("class");
      const newStatus = isClassRequest ? "classcancelled" : "cancelled";

      await refundService.updateRefund(selectedRefund.RefundID, {
        Status: newStatus,
        Reason: rejectionReason
          ? `${selectedRefund.Reason || ""}\n\nLý do hủy: ${rejectionReason}`
          : selectedRefund.Reason,
      });

      setOpenRejectDialog(false);
      setRejectionReason("");
      handleMenuClose();
      await loadRefunds();
      await loadStatusCounts();
      setError(null);
      setSnackbar({
        open: true,
        message: isClassRequest
          ? "Hủy yêu cầu chuyển lớp thành công"
          : "Hủy yêu cầu hoàn tiền thành công",
        severity: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể hủy yêu cầu";
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleSwitchToClassPending = async (refund) => {
    try {
      await refundService.updateRefund(refund.RefundID, {
        Status: "classpending",
      });
      handleMenuClose();
      await loadRefunds();
      await loadStatusCounts();
      setSnackbar({
        open: true,
        message: "Đã chuyển sang yêu cầu chuyển lớp",
        severity: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể chuyển sang yêu cầu chuyển lớp";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleSwitchToPending = async (refund) => {
    try {
      await refundService.updateRefund(refund.RefundID, {
        Status: "pending",
      });
      handleMenuClose();
      await loadRefunds();
      await loadStatusCounts();
      setSnackbar({
        open: true,
        message: "Đã chuyển sang yêu cầu hoàn tiền",
        severity: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể chuyển sang yêu cầu hoàn tiền";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilter = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setPage(1); // Reset về trang đầu khi filter
  };

  const handleClearFilter = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setAppliedSearchQuery("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setPage(1);
  };

  const handleActionMenuOpen = (event, refund) => {
    setAnchorEl(event.currentTarget);
    setActionRefund(refund);
    setSelectedRefund(refund);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
    setActionRefund(null);
  };

  const handleOpenClassModal = async (refund) => {
    const targetRefund = refund || selectedRefund;
    if (!targetRefund) return;
    setSelectedRefund(targetRefund);
    setClassModalOpen(true);
    setClassModalLoading(true);
    setClassModalError("");
    try {
      const response = await refundService.getRelatedClasses(
        targetRefund.RefundID
      );
      const options = response?.data || response || [];
      const normalizedOptions = Array.isArray(options) ? options : [];
      setClassOptions(normalizedOptions);

      // Load schedule summaries for each candidate class so that admin can see days/timeslots
      try {
        const summaries = {};
        await Promise.all(
          normalizedOptions.map(async (cls) => {
            const classId = cls.ClassID || cls.id;
            if (!classId) return;
            try {
              const sessions = await classService.getClassSessionsForFrontend(
                classId
              );
              if (Array.isArray(sessions) && sessions.length > 0) {
                const summary = buildClassScheduleSummary(sessions);
                summaries[classId] = summary;
              }
            } catch (err) {
              console.error(
                "Error loading sessions for class in refund change dialog:",
                err
              );
            }
          })
        );
        setClassScheduleSummaries(summaries);
      } catch (scheduleError) {
        console.error(
          "Error building class schedule summaries for refund change dialog:",
          scheduleError
        );
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải danh sách lớp liên quan";
      setClassModalError(errorMessage);
      setClassOptions([]);
    } finally {
      setClassModalLoading(false);
    }
  };

  const handleConfirmClassSelection = async () => {
    if (!selectedRefund || !selectedClassOption) return;
    try {
      setClassModalLoading(true);
      await refundService.updateRefund(selectedRefund.RefundID, {
        Status: "classapproved",
        TargetClassID:
          selectedClassOption.ClassID ||
          selectedClassOption.id ||
          selectedClassOption.value,
      });
      setClassModalOpen(false);
      setSelectedClassOption(null);
      await loadRefunds();
      await loadStatusCounts();
      setSnackbar({
        open: true,
        message: "Đã xử lý chuyển lớp",
        severity: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật chuyển lớp";
      setClassModalError(errorMessage);
    } finally {
      setClassModalLoading(false);
    }
  };

  // Build a human-readable schedule summary from class sessions
  const buildClassScheduleSummary = (sessions) => {
    if (!Array.isArray(sessions) || sessions.length === 0) return "";

    const dayMap = {
      0: "CN",
      1: "T2",
      2: "T3",
      3: "T4",
      4: "T5",
      5: "T6",
      6: "T7",
    };

    const byDay = {};

    sessions.forEach((s) => {
      if (!s.Date) return;
      const date = new Date(s.Date);
      if (Number.isNaN(date.getTime())) return;
      const dayKey = dayMap[date.getDay()] || "";
      if (!dayKey) return;

      const start =
        (s.StartTime && String(s.StartTime).slice(0, 5)) || undefined;
      const end = (s.EndTime && String(s.EndTime).slice(0, 5)) || undefined;
      const range =
        start && end ? `${start}-${end}` : start || end || "Không rõ giờ";

      if (!byDay[dayKey]) {
        byDay[dayKey] = new Set();
      }
      byDay[dayKey].add(range);
    });

    const parts = Object.entries(byDay).map(([day, rangesSet]) => {
      const ranges = Array.from(rangesSet);
      return `${day}: ${ranges.join(", ")}`;
    });

    return parts.join(" | ");
  };

  const getClassScheduleSummary = (cls) => {
    if (!cls) return "";
    const classId = cls.ClassID || cls.id;
    if (!classId) return "";
    return classScheduleSummaries[classId] || "";
  };

  const handleSendAccountEmail = async (refund) => {
    try {
      await refundService.sendAccountInfoEmail(refund.RefundID);
      setSnackbar({
        open: true,
        message: "Đã gửi email yêu cầu thông tin chuyển khoản",
        severity: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể gửi email yêu cầu thông tin chuyển khoản";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
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

  const isClassRequest = (status) =>
    (status || "").toLowerCase().startsWith("class");

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "approved":
      case "classapproved":
        return { bg: "#dbeafe", color: "#2563eb" };
      case "pending":
      case "classpending":
        return { bg: "#e0e7ff", color: "#6366f1" };
      case "cancelled":
      case "classcancelled":
        return { bg: "#fee2e2", color: "#dc2626" };
      default:
        return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const getStatusLabel = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "Đang chờ xử lý hoàn tiền";
      case "approved":
        return "Hoàn tiền thành công";
      case "cancelled":
        return "Đã hủy yêu cầu hoàn tiền";
      case "classpending":
        return "Đang chờ xử lý chuyển lớp";
      case "classapproved":
        return "Đã xử lý chuyển lớp";
      case "classcancelled":
        return "Đã hủy yêu cầu chuyển lớp";
      default:
        return status || "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      // Yêu cầu hoàn tiền
      case "approved":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "pending":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case "cancelled":
        return <Cancel sx={{ fontSize: 16 }} />;
      // Yêu cầu chuyển lớp
      case "classapproved":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "classpending":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case "classcancelled":
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const displayRefunds = refunds;

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Xử lý Yêu cầu
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Quản lý và xử lý các yêu cầu hoàn tiền và chuyển lớp của học viên
            </Typography>
          </Box>
        </Box>

        {/* Search and Date Filter */}
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <TextField
              placeholder="Tìm kiếm theo tên học viên, lớp học..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8fafc",
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
            <TextField
              label="Từ ngày"
              type="date"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8fafc",
                },
              }}
            />
            <TextField
              label="Đến ngày"
              type="date"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8fafc",
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={handleFilter}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                backgroundColor: "#667eea",
                "&:hover": {
                  backgroundColor: "#5568d3",
                },
              }}
            >
              Lọc
            </Button>
            {(appliedSearchQuery || appliedDateFrom || appliedDateTo) && (
              <Button
                variant="outlined"
                onClick={handleClearFilter}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#cbd5e0",
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                Xóa lọc
              </Button>
            )}
          </Box>
        </Paper>

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
          <Tab label={`Tất cả (${statusCounts.all})`} />
          <Tab label={`Chờ xử lý hoàn tiền (${statusCounts.pending})`} />
          <Tab label={`Đã xử lý hoàn tiền (${statusCounts.approved})`} />
          <Tab label={`Đã hủy hoàn tiền (${statusCounts.cancelled})`} />
          <Tab label={`Chờ xử lý chuyển lớp (${statusCounts.classpending})`} />
          <Tab label={`Đã xử lý chuyển lớp (${statusCounts.classapproved})`} />
          <Tab label={`Đã hủy chuyển lớp (${statusCounts.classcancelled})`} />
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
          <AccountBalanceWallet
            sx={{ fontSize: 64, color: "#cbd5e0", mb: 2 }}
          />
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            Không có yêu cầu hoàn tiền nào
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
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
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuOpen(e, refund)}
                      >
                        <MoreVert sx={{ fontSize: 18 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleActionMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                minWidth: 220,
              },
            }}
          >
            {actionRefund &&
              actionRefund.Status?.toLowerCase() === "pending" && (
                <MenuItem
                  onClick={() => {
                    handleApprove(actionRefund);
                    handleActionMenuClose();
                  }}
                >
                  <CheckCircle sx={{ fontSize: 18, mr: 1.5 }} />
                  Duyệt hoàn tiền
                </MenuItem>
              )}
            {actionRefund &&
              ["pending", "classpending"].includes(
                actionRefund.Status?.toLowerCase()
              ) && (
                <MenuItem
                  onClick={() => {
                    setSelectedRefund(actionRefund);
                    setOpenRejectDialog(true);
                    handleActionMenuClose();
                  }}
                >
                  <Cancel sx={{ fontSize: 18, mr: 1.5 }} />
                  Hủy
                </MenuItem>
              )}
            {actionRefund &&
              actionRefund.Status?.toLowerCase() === "pending" && (
                <MenuItem
                  onClick={() => {
                    handleSendAccountEmail(actionRefund);
                    handleActionMenuClose();
                  }}
                >
                  <Send sx={{ fontSize: 18, mr: 1.5 }} />
                  Gửi email yêu cầu thông tin chuyển khoản
                </MenuItem>
              )}
            {actionRefund &&
              actionRefund.Status?.toLowerCase() === "pending" && (
                <MenuItem
                  onClick={() => {
                    handleSwitchToClassPending(actionRefund);
                    handleActionMenuClose();
                  }}
                >
                  <Edit sx={{ fontSize: 18, mr: 1.5 }} />
                  Chuyển sang yêu cầu chuyển lớp
                </MenuItem>
              )}
            {actionRefund &&
              actionRefund.Status?.toLowerCase() === "classpending" && (
                <MenuItem
                  onClick={() => {
                    handleSwitchToPending(actionRefund);
                    handleActionMenuClose();
                  }}
                >
                  <CheckCircle sx={{ fontSize: 18, mr: 1.5 }} />
                  Đổi sang yêu cầu hoàn tiền
                </MenuItem>
              )}
            {actionRefund &&
              actionRefund.Status?.toLowerCase() === "classpending" && (
                <MenuItem
                  onClick={() => {
                    handleOpenClassModal(actionRefund);
                    handleActionMenuClose();
                  }}
                >
                  <Search sx={{ fontSize: 18, mr: 1.5 }} />
                  Tìm lớp chuyển
                </MenuItem>
              )}
            {actionRefund && (
              <MenuItem
                onClick={() => {
                  setSelectedRefund(actionRefund);
                  setOpenDetailDialog(true);
                  handleActionMenuClose();
                }}
              >
                <Visibility sx={{ fontSize: 18, mr: 1.5 }} />
                Xem chi tiết
              </MenuItem>
            )}
          </Menu>
          <Divider />
          <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
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
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isClassRequest(selectedRefund?.Status)
            ? "Chi tiết yêu cầu chuyển lớp"
            : "Chi tiết yêu cầu hoàn tiền"}
        </DialogTitle>
        <DialogContent>
          {selectedRefund && (
            <Box
              sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
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
                {!isClassRequest(selectedRefund.Status) && (
                  <>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", mb: 0.5 }}
                    >
                      Số tiền
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#ef4444" }}
                    >
                      {formatCurrency(
                        selectedRefund.PaymentAmount || selectedRefund.ClassFee
                      )}
                    </Typography>
                  </>
                )}
                {isClassRequest(selectedRefund.Status) && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", mb: 0.5 }}
                  >
                    Yêu cầu chuyển lớp
                  </Typography>
                )}
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
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedRefund?.Status?.toLowerCase()?.startsWith("class")
            ? "Hủy yêu cầu chuyển lớp"
            : "Hủy yêu cầu hoàn tiền"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
              Vui lòng nhập lý do hủy:
            </Typography>
            <TextareaAutosize
              minRows={4}
              placeholder="Nhập lý do hủy..."
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
            Gửi
          </Button>
        </DialogActions>
      </Dialog>

      <ChangeClassDialog
        open={classModalOpen}
        onClose={() => {
          if (!classModalLoading) {
            setClassModalOpen(false);
            setSelectedClassOption(null);
          }
        }}
        loading={classModalLoading}
        error={classModalError}
        options={classOptions}
        selectedClass={selectedClassOption}
        onSelectClass={setSelectedClassOption}
        onConfirm={handleConfirmClassSelection}
        title="Chọn lớp chuyển"
        getScheduleSummary={getClassScheduleSummary}
      />

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
