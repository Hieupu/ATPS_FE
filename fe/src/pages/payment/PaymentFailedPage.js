import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { updatePaymentStatusApi } from "../../apiServices/paymentService";

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const hasUpdated = useRef(false); // Thêm useRef để track

  useEffect(() => {
    const updatePaymentStatus = async () => {
      // Chỉ chạy 1 lần
      if (hasUpdated.current) return;
      hasUpdated.current = true;

      try {
        const orderCode = searchParams.get("orderCode");
        console.log("Updating payment status for order:", orderCode);
        
        if (orderCode) {
          // Gọi API để cập nhật trạng thái thất bại
          await updatePaymentStatusApi(orderCode, "failed");
          console.log("Payment failed status updated");
        }
      } catch (error) {
        console.error("Error updating payment status:", error);
      } finally {
        setLoading(false);
      }
    };

    updatePaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <Box textAlign="center" sx={{ mt: 10 }}>
        <CircularProgress />
        <Typography>Đang xử lý...</Typography>
      </Box>
    );
  }

  return (
    <Box textAlign="center" sx={{ mt: 10 }}>
      <Typography variant="h3" color="error.main" gutterBottom>
        ❌ Thanh toán thất bại
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Bạn đã hủy thanh toán hoặc thanh toán không thành công.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/courses")}>
        Quay lại khóa học
      </Button>
    </Box>
  );
}