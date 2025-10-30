import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { updatePaymentStatusApi } from "../../apiServices/paymentService";

export default function PaymentSuccessPage() {
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
          // Gọi API để cập nhật trạng thái thành công
          await updatePaymentStatusApi(orderCode, "success");
          console.log("Payment status updated successfully");
        }
      } catch (error) {
        console.error("Error updating payment status:", error);
      } finally {
        setLoading(false);
        // Chuyển tới Lịch học sau khi cập nhật xong
        setTimeout(() => navigate("/schedule"), 600);
      }
    };

    updatePaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <Box textAlign="center" sx={{ mt: 10 }}>
        <CircularProgress />
        <Typography>Đang xác nhận thanh toán...</Typography>
      </Box>
    );
  }

  return (
    <Box textAlign="center" sx={{ mt: 10 }}>
      <Typography variant="h3" color="success.main" gutterBottom>
        🎉 Thanh toán thành công!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Bạn đã đăng ký khóa học thành công.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/schedule")}>
        Đến Lịch học
      </Button>
    </Box>
  );
}
