import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { formatCurrency } from "./paymentUtils";

const PaymentStatistics = ({ payments }) => {
  // Tính toán các số liệu thống kê dựa trên dữ liệu thực tế
  const totalSpent = payments.reduce((sum, p) => {
    const amount = parseFloat(p.Amount || p.Fee || 0);
    return sum + amount;
  }, 0);

  // PaymentStatus thực tế là "success", "pending", "failed"
  const completedPayments = payments.filter(p => 
    p.PaymentStatus === "success" || p.Status === "success"
  ).length;

  const pendingPayments = payments.filter(p => 
    p.RefundStatus === "pending" 
  ).length;

  // Tính tổng số yêu cầu hoàn tiền (có RefundID)
  const refundRequests = payments.filter(p => p.RefundID).length;
  
  // Tính tổng số tiền đang chờ hoàn (RefundStatus = pending)
  const pendingRefundAmount = payments
    .filter(p => p.RefundStatus === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.Amount || p.Fee || 0), 0);

  // Tính tổng số tiền đã hoàn (RefundStatus = approved)
  const approvedRefundAmount = payments
    .filter(p => p.RefundStatus === 'approved')
    .reduce((sum, p) => sum + parseFloat(p.Amount || p.Fee || 0), 0);

  const stats = [
    {
      label: "Tổng chi tiêu",
      value: formatCurrency(totalSpent),
      description: `${payments.length} giao dịch`
    },
    {
      label: "Thanh toán thành công",
      value: completedPayments,
      description: `${((completedPayments / payments.length) * 100).toFixed(0)}% tổng số`
    },
    {
      label: "Đang chờ xử lý",
      value: pendingPayments,
      description: pendingPayments > 0 ? "Cần xử lý" : "Tất cả đã xong"
    },
    {
      label: "Yêu cầu hoàn tiền",
      value: refundRequests,
      description: refundRequests > 0 ? 
        `${formatCurrency(pendingRefundAmount)} đang chờ` : 
        "Không có yêu cầu"
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ 
            bgcolor: "white", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {stat.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PaymentStatistics;