import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { 
  formatCurrency, 
  formatDate
} from "./paymentUtils";

const PaymentTableRow = ({ payment, isLast }) => {
  // Hàm xử lý màu và text cho trạng thái thanh toán
  const getPaymentStatusInfo = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return {
          text: 'Thành công',
          bgcolor: '#dcfce7',
          color: '#166534'
        };
      case 'pending':
      case 'processing':
        return {
          text: 'Đang xử lý',
          bgcolor: '#fef9c3',
          color: '#854d0e'
        };
      case 'failed':
      case 'error':
        return {
          text: 'Thất bại',
          bgcolor: '#fee2e2',
          color: '#991b1b'
        };
      case 'cancelled':
        return {
          text: 'Đã hủy',
          bgcolor: '#f3f4f6',
          color: '#374151'
        };
      default:
        return {
          text: 'Không xác định',
          bgcolor: '#f3f4f6',
          color: '#6b7280'
        };
    }
  };

  const statusInfo = getPaymentStatusInfo(payment.PaymentStatus || payment.Status);

  return (
    <Box 
      sx={{ 
        display: "grid",
        gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr",
        gap: 3,
        px: 3,
        py: 3,
        borderBottom: isLast ? "none" : "1px solid #f1f5f9",
        alignItems: "center",
        transition: "all 0.2s ease",
        '&:hover': {
          bgcolor: '#f8fafc'
        }
      }}
    >
      {/* Mã giao dịch */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", fontFamily: 'monospace' }}>
          {payment.OrderCode || "N/A"}
        </Typography>
      </Box>
      
      {/* Ngày thanh toán */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#1e293b" }}>
          {formatDate(payment.PaymentDate)}
        </Typography>
      </Box>
      
      {/* Thông tin khóa học */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", mb: 1, lineHeight: 1.4 }}>
          {payment.CourseTitle || "Khóa học không xác định"}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: "#64748b", display: 'flex' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Lớp:</span>
            {payment.ClassName || "N/A"}
          </Typography>
          
          <Typography variant="caption" sx={{ color: "#64748b", display: 'flex' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Bắt đầu:</span>
            {formatDate(payment.OpendatePlan || payment.Opendate)}
          </Typography>
          
          <Typography variant="caption" sx={{ color: "#64748b", display: 'flex' }}>
            <span style={{ fontWeight: 500, minWidth: 70 }}>Kết thúc:</span>
            {formatDate(payment.EnddatePlan || payment.Enddate) || "Chưa xác định"}
          </Typography>
        </Box>
      </Box>
      
      {/* Số tiền */}
      <Box>
        <Typography variant="body2" sx={{ 
          fontWeight: 700, 
          color: "#059669",
          fontSize: '1rem'
        }}>
          {formatCurrency(payment.Amount || payment.Fee)}
        </Typography>
      </Box>
      
      {/* Trạng thái - Chỉ hiển thị trạng thái thanh toán */}
      <Box>
        <Chip
          label={statusInfo.text}
          size="medium"
          sx={{
            bgcolor: statusInfo.bgcolor,
            color: statusInfo.color,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 28,
            border: 'none',
            '& .MuiChip-label': {
              px: 2
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default PaymentTableRow;