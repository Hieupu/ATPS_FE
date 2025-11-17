import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Receipt,
  Payment,
  Schedule,
  Cancel,
  CheckCircle,
  Pending,
  MoreVert,
  Block,
  Autorenew,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getPaymentHistoryApi, 
  requestRefundApi,
  cancelRefundRequestApi 
} from "../../apiServices/paymentService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";

const PaymentHistoryPage = () => {
  const { user, isLearner } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundDialog, setRefundDialog] = useState({
    open: false,
    payment: null,
  });
  const [refundReason, setRefundReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [actionMenu, setActionMenu] = useState({ anchor: null, payment: null });

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accId = user.AccID || user.AccID || user.id || user.AccountID;
      
      if (!accId) {
        throw new Error("Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại.");
      }

      const learnerId = await getLearnerIdFromAccount(accId);

      if (!learnerId) {
        throw new Error("Không tìm thấy Learner ID.");
      }

      const data = await getPaymentHistoryApi(learnerId);
      console.log("Payment history data:", data);
      
      // Xử lý dữ liệu từ API để đảm bảo cấu trúc nhất quán
      const processedPayments = (data.payments || []).map(payment => ({
        ...payment,
        Status: payment.PaymentStatus || payment.Status,
        RefundStatus: payment.RefundStatus,
        Enrollment: payment.Enrollment || {
          EnrollmentID: payment.EnrollmentID,
          OrderCode: payment.OrderCode,
          Status: payment.EnrollmentStatus,
          Class: {
            ClassID: payment.ClassID,
            Name: payment.ClassName,
            Opendate: payment.Opendate,
            OpendatePlan: payment.OpendatePlan,
            Enddate: payment.Enddate,
            EnddatePlan: payment.EnddatePlan,
            Course: {
              CourseID: payment.CourseID,
              Title: payment.CourseTitle
            }
          }
        }
      }));
      
      setPayments(processedPayments);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError(err.message || "Không thể tải lịch sử thanh toán.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isLearner) {
      fetchPaymentHistory();
    } else {
      setError("Chỉ học viên mới có thể xem lịch sử thanh toán");
      setLoading(false);
    }
  }, [user, isLearner, fetchPaymentHistory]);

  const handleRefundRequest = async () => {
    try {
      if (!refundReason.trim()) {
        setSnackbar({
          open: true,
          message: "Vui lòng nhập lý do hoàn tiền",
          severity: "error"
        });
        return;
      }

      await requestRefundApi(refundDialog.payment.Enrollment.EnrollmentID, refundReason);
      
      setSnackbar({
        open: true,
        message: "Yêu cầu hoàn tiền đã được gửi thành công",
        severity: "success"
      });
      
      setRefundDialog({ open: false, payment: null });
      setRefundReason("");
      fetchPaymentHistory(); // Refresh data
    } catch (err) {
      console.error("Error requesting refund:", err);
      setSnackbar({
        open: true,
        message: err.message || "Không thể gửi yêu cầu hoàn tiền",
        severity: "error"
      });
    }
  };

  const handleCancelRefund = async (refundId) => {
    try {
      await cancelRefundRequestApi(refundId);
      
      setSnackbar({
        open: true,
        message: "Đã hủy yêu cầu hoàn tiền thành công",
        severity: "success"
      });
      
      setActionMenu({ anchor: null, payment: null });
      fetchPaymentHistory(); // Refresh data
    } catch (err) {
      console.error("Error canceling refund:", err);
      setSnackbar({
        open: true,
        message: err.message || "Không thể hủy yêu cầu hoàn tiền",
        severity: "error"
      });
    }
  };

  const canRequestRefund = (payment) => {
    const classInfo = payment.Enrollment?.Class;
    if (!classInfo) return false;

    const currentDate = new Date();
    const startDate = new Date(classInfo.Opendate || classInfo.OpendatePlan);
    
    // Có thể hoàn tiền nếu lớp chưa bắt đầu, payment status là success và chưa có refund request
    return startDate > currentDate && 
           (payment.Status === "success" || payment.Status === "completed") &&
           !payment.RefundID;
  };

  const canCancelRefund = (payment) => {
    // Có thể hủy refund nếu refund status là pending
    return payment.RefundStatus === 'pending';
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "completed":
      case "success": 
        return "success";
      case "pending": return "warning";
      case "failed": return "error";
      case "refunded": return "info";
      case "refund_pending": return "warning";
      default: return "default";
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getRefundStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Đang chờ xử lý';
      case 'approved': return 'Đã chấp nhận';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusText = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "completed":
      case "success": 
        return "Thành công";
      case "pending": return "Đang chờ";
      case "failed": return "Thất bại";
      case "refunded": return "Đã hoàn tiền";
      case "refund_pending": return "Đang chờ hoàn tiền";
      default: return status || "Không xác định";
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "completed":
      case "success": 
        return <CheckCircle />;
      case "pending": return <Pending />;
      case "failed": return <Cancel />;
      case "refunded": return <Receipt />;
      case "refund_pending": return <Schedule />;
      default: return <Payment />;
    }
  };

  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numericAmount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("vi-VN");
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      
      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>
            Lịch sử thanh toán
          </Typography>
          <Typography variant="body1" sx={{ textAlign: "center", opacity: 0.9 }}>
            Theo dõi và quản lý các giao dịch thanh toán của bạn
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {payments.map((payment) => (
            <Grid item xs={12} key={payment.PaymentID}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {payment.Enrollment?.Class?.Course?.Title || payment.CourseTitle || "Khóa học không xác định"}
                      </Typography>
                      
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                        <Chip
                          icon={getStatusIcon(payment.Status)}
                          label={getStatusText(payment.Status)}
                          color={getStatusColor(payment.Status)}
                          size="small"
                        />
                        
                        {payment.RefundStatus && (
                          <Chip
                            icon={<Autorenew />}
                            label={getRefundStatusText(payment.RefundStatus)}
                            color={getRefundStatusColor(payment.RefundStatus)}
                            size="small"
                          />
                        )}
                        
                        <Chip
                          icon={<Receipt />}
                          label={`Mã: ${payment.Enrollment?.OrderCode || payment.OrderCode || "N/A"}`}
                          variant="outlined"
                          size="small"
                        />
                        
                        <Typography variant="body2" color="text.secondary">
                          Lớp: {payment.Enrollment?.Class?.Name || payment.ClassName || "N/A"}
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Số tiền:</strong> {formatCurrency(payment.Amount || payment.Fee)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Phương thức:</strong> {payment.PaymentMethod || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Ngày thanh toán:</strong> {formatDate(payment.PaymentDate)}
                          </Typography>
                          {payment.RefundRequestDate && (
                            <Typography variant="body2">
                              <strong>Ngày yêu cầu hoàn tiền:</strong> {formatDate(payment.RefundRequestDate)}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Ngày bắt đầu:</strong> {formatDate(payment.Enrollment?.Class?.OpendatePlan || payment.OpendatePlan)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Ngày kết thúc:</strong> {formatDate(payment.Enrollment?.Class?.EnddatePlan || payment.EnddatePlan)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Trạng thái lớp:</strong> {payment.Enrollment?.Status || payment.EnrollmentStatus || "N/A"}
                          </Typography>
                          {payment.RefundReason && (
                            <Typography variant="body2">
                              <strong>Lý do hoàn tiền:</strong> {payment.RefundReason}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {canRequestRefund(payment) && (
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<Autorenew />}
                          onClick={() => setRefundDialog({ 
                            open: true, 
                            payment: payment 
                          })}
                        >
                          Yêu cầu hoàn tiền
                        </Button>
                      )}
                      
                      {(payment.RefundID || canCancelRefund(payment)) && (
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<MoreVert />}
                          onClick={(e) => setActionMenu({ anchor: e.currentTarget, payment })}
                        >
                          Thao tác
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {payments.length === 0 && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Bạn chưa có giao dịch thanh toán nào.
          </Alert>
        )}
      </Container>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialog.open} onClose={() => setRefundDialog({ open: false, payment: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Yêu cầu hoàn tiền</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bạn đang yêu cầu hoàn tiền cho lớp: <strong>{refundDialog.payment?.Enrollment?.Class?.Name || refundDialog.payment?.ClassName}</strong>
          </Typography>
          <TextField
            autoFocus
            label="Lý do hoàn tiền"
            fullWidth
            multiline
            rows={4}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Vui lòng mô tả lý do bạn muốn hoàn tiền..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog({ open: false, payment: null })}>
            Hủy
          </Button>
          <Button 
            onClick={handleRefundRequest} 
            variant="contained" 
            color="warning"
            disabled={!refundReason.trim()}
          >
            Gửi yêu cầu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu.anchor}
        open={Boolean(actionMenu.anchor)}
        onClose={() => setActionMenu({ anchor: null, payment: null })}
      >
        {actionMenu.payment?.RefundStatus === 'pending' && (
          <MenuItem 
            onClick={() => handleCancelRefund(actionMenu.payment.RefundID)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Block color="error" />
            </ListItemIcon>
            <ListItemText>Hủy yêu cầu hoàn tiền</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentHistoryPage;