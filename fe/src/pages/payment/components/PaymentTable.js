import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography
} from "@mui/material";
import PaymentTableRow from "./PaymentTableRow";

const PaymentTable = ({ payments }) => {
  return (
    <Card sx={{ 
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 0 }}>
        {/* Table Header */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          p: 3,
          borderBottom: "2px solid #f1f5f9",
          bgcolor: "#f8fafc"
        }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: "#1e293b"
              }}
            >
              Tất cả giao dịch ({payments.length})
            </Typography>
          </Box>
        </Box>

        {/* Table Content */}
        <Box>
          {/* Table Headers */}
          <Box sx={{ 
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr",
            gap: 3,
            px: 3,
            py: 2.5,
            bgcolor: "#f8fafc",
            borderBottom: "2px solid #e2e8f0"
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem' }}>
              MÃ GIAO DỊCH
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem' }}>
              NGÀY THANH TOÁN
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem' }}>
              THÔNG TIN KHÓA HỌC
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem' }}>
              SỐ TIỀN
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem' }}>
              TRẠNG THÁI
            </Typography>
          </Box>

          {/* Table Rows */}
          {payments.map((payment, index) => (
            <PaymentTableRow
              key={payment.PaymentID}
              payment={payment}
              isLast={index === payments.length - 1}
            />
          ))}
        </Box>

        {/* Table Footer */}
        {payments.length > 0 && (
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2.5,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#f8fafc"
          }}>
            <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500 }}>
              Hiển thị {payments.length} giao dịch
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ fontWeight: 500 }}>
              Tổng cộng: {payments.length} thanh toán
            </Typography>
          </Box>
        )}

        {payments.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 3
          }}>
            <Typography 
              variant="h6" 
              color="#64748b" 
              sx={{ 
                fontWeight: 500,
                mb: 1
              }}
            >
              Chưa có giao dịch nào
            </Typography>
            <Typography 
              variant="body2" 
              color="#94a3b8"
            >
              Các giao dịch thanh toán của bạn sẽ xuất hiện tại đây
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentTable;