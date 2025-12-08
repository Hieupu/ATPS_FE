import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { canRequestRefund, formatCurrency, formatDate, getStatusDisplay } from "./paymentUtils";
import RefundDialog from "./RefundDialog";
import ActionMenu from "./ActionMenu";
import { requestRefundApi, cancelRefundRequestApi } from "../../../apiServices/paymentService";

const RefundRequestTab = ({ 
  payments, 
  onRefundRequestSuccess,
  onCancelRefundSuccess,
  onError
}) => {
  const [refundDialog, setRefundDialog] = useState({
    open: false,
    payment: null,
  });
  const [refundReason, setRefundReason] = useState("");
  const [actionMenu, setActionMenu] = useState({ anchor: null, payment: null });

  // Tất cả thanh toán có liên quan đến hoàn tiền (đã yêu cầu hoặc có thể yêu cầu)
  const allRefundRelatedPayments = payments.filter(payment => {
    // Hiển thị nếu có thể yêu cầu hoàn tiền
    if (canRequestRefund(payment)) return true;
    
    // Hoặc có lịch sử refund (bao gồm cả cancelled)
    if (payment.RefundID) return true;
    
    return false;
  });

  const handleRefundRequest = async () => {
    try {
      if (!refundReason.trim()) {
        onError("Vui lòng nhập lý do hoàn tiền");
        return;
      }

      // Gọi API request refund
      await requestRefundApi(refundDialog.payment.Enrollment.EnrollmentID, refundReason);
      
      onRefundRequestSuccess("Yêu cầu hoàn tiền đã được gửi thành công");
      
      setRefundDialog({ open: false, payment: null });
      setRefundReason("");
    } catch (err) {
      console.error("Error requesting refund:", err);
      onError(err.message || "Không thể gửi yêu cầu hoàn tiền");
    }
  };

  const handleCancelRefund = async (refundId) => {
    try {
      await cancelRefundRequestApi(refundId);
      onCancelRefundSuccess("Đã hủy yêu cầu hoàn tiền thành công");
      setActionMenu({ anchor: null, payment: null });
    } catch (err) {
      console.error("Error canceling refund:", err);
      onError(err.message || "Không thể hủy yêu cầu hoàn tiền");
    }
  };

  return (
    <Box>
      {/* Thông báo */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          fontSize: '0.95rem'
        }}
      >
        Danh sách các thanh toán có thể yêu cầu hoàn tiền và lịch sử yêu cầu hoàn tiền.
      </Alert>

      {/* Bảng yêu cầu hoàn tiền */}
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
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: "#1e293b"
              }}
            >
              Quản lý yêu cầu hoàn tiền
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem', py: 2 }}>
                    KHÓA HỌC
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem', py: 2 }}>
                    NGÀY THANH TOÁN
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem', py: 2 }}>
                    SỐ TIỀN
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem', py: 2 }}>
                    TRẠNG THÁI
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: '0.875rem', py: 2, textAlign: 'center' }}>
                    THAO TÁC
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allRefundRelatedPayments.length > 0 ? (
                  allRefundRelatedPayments.map((payment) => {
                    const statusDisplay = getStatusDisplay(payment);
                    const canRequest = canRequestRefund(payment);
                    
                    return (
                      <TableRow 
                        key={payment.PaymentID}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {payment.CourseTitle}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              {payment.ClassName}
                            </Typography>
                            {payment.RefundReason && (
                              <Typography variant="caption" sx={{ 
                                color: "#dc2626", 
                                display: 'block',
                                mt: 0.5
                              }}>
                                Lý do: {payment.RefundReason}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography variant="body2">
                            {formatDate(payment.PaymentDate)}
                          </Typography>
                          {payment.RefundRequestDate && (
                            <Typography variant="caption" sx={{ 
                              color: "#ef4444", 
                              display: 'block',
                              mt: 0.5
                            }}>
                              YC: {formatDate(payment.RefundRequestDate)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#059669" }}>
                            {formatCurrency(payment.Amount || payment.Fee)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: statusDisplay.color.bgcolor,
                              color: statusDisplay.color.color,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            {statusDisplay.text}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2.5, textAlign: 'center' }}>
                          {canRequest && (
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
                                '&:hover': {
                                  bgcolor: '#fef2f2',
                                  borderColor: '#b91c1c'
                                }
                              }}
                              onClick={() => setRefundDialog({ 
                                open: true, 
                                payment: payment 
                              })}
                            >
                              Yêu cầu hoàn tiền
                            </Button>
                          )}
                          
                          {payment.RefundStatus === 'pending' && (
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
                                ml: canRequest ? 1 : 0,
                                '&:hover': {
                                  bgcolor: '#f8fafc',
                                  borderColor: '#94a3b8'
                                }
                              }}
                              onClick={(e) => setActionMenu({ 
                                anchor: e.currentTarget, 
                                payment: payment 
                              })}
                            >
                              Hủy yêu cầu
                            </Button>
                          )}

                          {!canRequest && !payment.RefundStatus && (
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontStyle: 'italic' }}>
                              Không khả dụng
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant="h6" color="#64748b" sx={{ fontWeight: 500, mb: 1 }}>
                        Chưa có thanh toán nào liên quan đến hoàn tiền
                      </Typography>
                      <Typography variant="body2" color="#94a3b8">
                        Các thanh toán đủ điều kiện hoàn tiền sẽ xuất hiện tại đây
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Footer */}
          {allRefundRelatedPayments.length > 0 && (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              px: 3,
              py: 2,
              borderTop: "1px solid #e2e8f0",
              bgcolor: "#f8fafc"
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Thông tin thêm */}
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            borderRadius: 2,
            flex: 1,
            minWidth: '300px'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Điều kiện hoàn tiền
          </Typography>
          <Typography variant="body2">
            • Chỉ áp dụng cho thanh toán thành công<br/>
            • Lớp học chưa bắt đầu<br/>
          </Typography>
        </Alert>

        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 2,
            flex: 1,
            minWidth: '300px'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Thời gian xử lý
          </Typography>
          <Typography variant="body2">
            • Yêu cầu hoàn tiền được xử lý trong 5-7 ngày làm việc<br/>
            • Có thể hủy yêu cầu khi trạng thái là "Đang chờ xử lý"
          </Typography>
        </Alert>
      </Box>

      {/* Dialog yêu cầu hoàn tiền */}
      <RefundDialog 
        open={refundDialog.open}
        payment={refundDialog.payment}
        refundReason={refundReason}
        onRefundReasonChange={setRefundReason}
        onClose={() => setRefundDialog({ open: false, payment: null })}
        onSubmit={handleRefundRequest}
      />

      {/* Menu hành động */}
      <ActionMenu 
        anchorEl={actionMenu.anchor}
        payment={actionMenu.payment}
        onClose={() => setActionMenu({ anchor: null, payment: null })}
        onCancelRefund={handleCancelRefund}
      />
    </Box>
  );
};

export default RefundRequestTab;