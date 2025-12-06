import React, { useState, useEffect, useCallback } from "react";
import { Container, Box, Alert, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getPaymentHistoryApi, 
  requestRefundApi,
  cancelRefundRequestApi 
} from "../../apiServices/paymentService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import { canRequestRefund } from "./components/paymentUtils";
import AppHeader from "../../components/Header/AppHeader";
import PaymentStatistics from "./components/PaymentStatistics";
import PaymentTable from "./components/PaymentTable";
import RefundDialog from "./components/RefundDialog";
import ActionMenu from "./components/ActionMenu";
import NotificationSnackbar from "./components/NotificationSnackbar";

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
      
      const processedPayments = (data.payments || []).map(payment => ({
        ...payment,
        Status: payment.PaymentStatus || payment.Status,
        RefundStatus: payment.RefundStatus,
        RefundID: payment.RefundID,
        Enrollment: {
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
      fetchPaymentHistory();
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
      fetchPaymentHistory();
    } catch (err) {
      console.error("Error canceling refund:", err);
      setSnackbar({
        open: true,
        message: err.message || "Không thể hủy yêu cầu hoàn tiền",
        severity: "error"
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: "100vh", 
        bgcolor: "#f8fafc", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#1976d2', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Đang tải lịch sử thanh toán...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AppHeader />
      
      {/* Header */}
      <Box sx={{ 
        bgcolor: "white", 
        borderBottom: "1px solid #e2e8f0", 
        py: 4,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: "#1a202c" }}>
            Lịch sử thanh toán
          </Typography>
          <Typography variant="body1" sx={{ color: "#718096", fontSize: "1.1rem" }}>
            Theo dõi và quản lý tất cả giao dịch của bạn
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              fontSize: '1rem',
              py: 1
            }}
          >
            {error}
          </Alert>
        )}

        <PaymentStatistics payments={payments} />
        
        <Box sx={{ mt: 4 }}>
          <PaymentTable 
            payments={payments}
            onRefundRequest={setRefundDialog}
            onActionMenuOpen={setActionMenu}
          />
        </Box>

        {payments.length === 0 && !loading && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 4, 
              borderRadius: 2,
              fontSize: '1rem'
            }}
          >
            Hiện tại bạn chưa có giao dịch thanh toán nào.
          </Alert>
        )}
      </Container>

      <RefundDialog 
        open={refundDialog.open}
        payment={refundDialog.payment}
        refundReason={refundReason}
        onRefundReasonChange={setRefundReason}
        onClose={() => setRefundDialog({ open: false, payment: null })}
        onSubmit={handleRefundRequest}
      />

      <ActionMenu 
        anchorEl={actionMenu.anchor}
        payment={actionMenu.payment}
        onClose={() => setActionMenu({ anchor: null, payment: null })}
        onCancelRefund={handleCancelRefund}
      />

      <NotificationSnackbar 
        snackbar={snackbar}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default PaymentHistoryPage;