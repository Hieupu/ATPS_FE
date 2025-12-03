// PaymentTableRow.jsx - Phiên bản tối ưu
import React from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import { 
  formatCurrency, 
  formatDate, 
  getStatusDisplay,
  canRequestRefund,
  canCancelRefund
} from "./paymentUtils";

const PaymentTableRow = ({ 
  payment, 
  onRefundRequest, 
  onActionMenuOpen,
  isLast 
}) => {
  const statusDisplay = getStatusDisplay(payment);

  return (
    <Box 
      sx={{ 
        display: "grid",
        gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr 120px",
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
        <Typography variant="caption" sx={{ color: "#64748b", display: 'block', mt: 0.5 }}>
          {payment.PaymentMethod}
        </Typography>
      </Box>
      
      {/* Ngày thanh toán */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#1e293b" }}>
          {formatDate(payment.PaymentDate)}
        </Typography>
        {payment.RefundRequestDate && (
          <Typography variant="caption" sx={{ color: "#ef4444", display: 'block', mt: 0.5 }}>
            YC hoàn tiền: {formatDate(payment.RefundRequestDate)}
          </Typography>
        )}
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

          {payment.RefundReason && (
            <Typography variant="caption" sx={{ color: "#dc2626", display: 'flex', mt: 0.5 }}>
              <span style={{ fontWeight: 500, minWidth: 70 }}>Lý do:</span>
              {payment.RefundReason}
            </Typography>
          )}
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
      
      {/* Trạng thái */}
      <Box>
        <Chip
          label={statusDisplay.text}
          size="medium"
          sx={{
            bgcolor: statusDisplay.color.bgcolor,
            color: statusDisplay.color.color,
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
      
      {/* Thao tác */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
        {canRequestRefund(payment) && (
          <Button
            size="small"
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#dc2626',
              borderColor: '#dc2626',
              borderRadius: 1.5,
              px: 2,
              py: 0.5,
              minWidth: 'auto',
              '&:hover': {
                bgcolor: '#fef2f2',
                borderColor: '#b91c1c'
              }
            }}
            onClick={() => onRefundRequest({ 
              open: true, 
              payment: payment 
            })}
          >
            Yêu cầu hoàn tiền
          </Button>
        )}
        
        {canCancelRefund(payment) && (
          <Button
            size="small"
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#475569',
              borderColor: '#cbd5e1',
              borderRadius: 1.5,
              px: 2,
              py: 0.5,
              minWidth: 'auto',
              '&:hover': {
                bgcolor: '#f8fafc',
                borderColor: '#94a3b8'
              }
            }}
            onClick={(e) => onActionMenuOpen({ anchor: e.currentTarget, payment })}
          >
            Hủy yêu cầu
          </Button>
        )}

        {!canRequestRefund(payment) && !canCancelRefund(payment) && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#94a3b8", 
              fontStyle: 'italic',
              textAlign: 'center'
            }}
          >
            Không có thao tác
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PaymentTableRow;