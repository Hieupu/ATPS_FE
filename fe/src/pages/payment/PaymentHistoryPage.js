import React, { useState, useEffect, useCallback } from "react";
import { 
  Container, 
  Box, 
  Alert, 
  CircularProgress, 
  Typography,
  Tabs,
  Tab
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getPaymentHistoryApi, 
} from "../../apiServices/paymentService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";
import PaymentStatistics from "./components/PaymentStatistics";
import PaymentTable from "./components/PaymentTable";
import RefundRequestTab from "./components/RefundRequestTab";
import NotificationSnackbar from "./components/NotificationSnackbar";
import PaymentHeroSection from "./components/PaymentHeroSection";
const PaymentHistoryPage = () => {
  const { user, isLearner } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [activeTab, setActiveTab] = useState(0); // 0: Lịch sử thanh toán, 1: Yêu cầu hoàn tiền

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRequestRefundSuccess = (message) => {
    setSnackbar({
      open: true,
      message: message || "Yêu cầu hoàn tiền đã được gửi thành công",
      severity: "success"
    });
    fetchPaymentHistory();
    setActiveTab(0); // Quay lại tab lịch sử sau khi gửi thành công
  };

  const handleCancelRefundSuccess = (message) => {
    setSnackbar({
      open: true,
      message: message || "Đã hủy yêu cầu hoàn tiền thành công",
      severity: "success"
    });
    fetchPaymentHistory();
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
      
        <PaymentHeroSection title="Quản lý thanh toán" />
      
      {/* Tabs được đưa xuống dưới HeroSection */}
      <Box sx={{ 
        bgcolor: "white", 
        borderBottom: "1px solid #e2e8f0", 
        py: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "relative",
        zIndex: 1
      }}>
        <Container maxWidth="xl">
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              label="Lịch sử thanh toán" 
              sx={{ 
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                color: activeTab === 0 ? '#1976d2' : '#64748b',
                minHeight: 48,
                px: 3
              }}
            />
            <Tab 
              label="Yêu cầu hoàn tiền" 
              sx={{ 
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                color: activeTab === 1 ? '#1976d2' : '#64748b',
                minHeight: 48,
                px: 3
              }}
            />
          </Tabs>
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

        {/* Nội dung theo tab */}
        {activeTab === 0 ? (
          // Tab Lịch sử thanh toán
          <>
            <PaymentStatistics payments={payments} />
            
            <Box sx={{ mt: 4 }}>
              <PaymentTable payments={payments} />
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
          </>
        ) : (
          // Tab Yêu cầu hoàn tiền
          <RefundRequestTab 
            payments={payments}
            onRefundRequestSuccess={handleRequestRefundSuccess}
            onCancelRefundSuccess={handleCancelRefundSuccess}
            onError={(errorMessage) => {
              setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error"
              });
            }}
          />
        )}
      </Container>

      <NotificationSnackbar 
        snackbar={snackbar}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default PaymentHistoryPage;