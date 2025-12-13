import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from "@mui/material";
import {
  MoreVert
} from "@mui/icons-material";
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

  // Tất cả thanh toán có liên quan đến hoàn tiền
  const allRefundRelatedPayments = payments.filter(payment => {
    if (canRequestRefund(payment)) return true;
    if (payment.RefundID) return true;
    return false;
  });

  const handleRefundRequest = async () => {
    try {
      if (!refundReason.trim()) {
        onError("Vui lòng nhập lý do hoàn tiền");
        return;
      }

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return { bgcolor: '#e8f5e9', color: '#2e7d32' };
      case 'pending':
        return { bgcolor: '#fff3e0', color: '#ef6c00' };
      case 'cancelled':
        return { bgcolor: '#ffebee', color: '#c62828' };
      default:
        return { bgcolor: '#f5f5f5', color: '#616161' };
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>

      {/* Main Table */}
      <Card sx={{ 
        borderRadius: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          {/* Table Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: '#fafafa'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
              Danh sách yêu cầu hoàn tiền
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              {allRefundRelatedPayments.length} mục
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#424242', 
                    py: 2,
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Khóa học
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#424242', 
                    py: 2,
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Thanh toán
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#424242', 
                    py: 2,
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Thông tin hoàn tiền
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#424242', 
                    py: 2,
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Ngày yêu cầu
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#424242', 
                    py: 2,
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Trạng thái
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#424242', 
                    py: 2,
                    borderBottom: '2px solid #e0e0e0'
                  }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allRefundRelatedPayments.length > 0 ? (
                  allRefundRelatedPayments.map((payment) => {
                    const statusDisplay = getStatusDisplay(payment);
                    const canRequest = canRequestRefund(payment);
                    const hasRefundRequest = payment.RefundID;
                    
                    return (
                      <TableRow 
                        key={payment.PaymentID}
                        sx={{ 
                          '&:hover': { bgcolor: '#fafafa' },
                          '&:last-child td': { borderBottom: 0 }
                        }}
                      >
                        {/* Course Column */}
                        <TableCell sx={{ py: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              color: '#212121',
                              mb: 0.5
                            }}>
                              {payment.CourseTitle}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#757575' }}>
                              {payment.ClassName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9e9e9e', display: 'block', mt: 0.5 }}>
                              Thanh toán: {formatDate(payment.PaymentDate)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Payment Column */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                            {formatCurrency(payment.Amount || payment.Fee)}
                          </Typography>
                        </TableCell>

                       {/* Refund Information Column */}
<TableCell sx={{ py: 1, maxWidth: 300 }}>
  {hasRefundRequest ? (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {payment.RefundReason && (
        <Typography 
  variant="body2" 
  sx={{ 
    color: '#424242',
    whiteSpace: 'pre-wrap'
  }}
>
  {payment.RefundReason}
</Typography>
      )}
    </Box>
  ) : (
    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
      Chưa có yêu cầu hoàn tiền
    </Typography>
  )}
</TableCell>

                        {/* Request Date Column */}
                        <TableCell sx={{ py: 2 }}>
                          {payment.RefundRequestDate ? (
                            <Typography variant="body2" sx={{ color: '#424242' }}>
                              {formatDate(payment.RefundRequestDate)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                              -
                            </Typography>
                          )}
                        </TableCell>

                        {/* Status Column */}
                        <TableCell sx={{ py: 2 }}>
                          {hasRefundRequest ? (
                            <Chip
                              label={statusDisplay.text}
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                ...getStatusColor(payment.RefundStatus)
                              }}
                            />
                          ) : (
                            <Chip
                              label="Có thể hoàn tiền"
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                bgcolor: '#e3f2fd',
                                color: '#1565c0'
                              }}
                            />
                          )}
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {canRequest && (
                              <Button
                                size="small"
                                variant="contained"
                                sx={{ 
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  bgcolor: '#d32f2f',
                                  '&:hover': {
                                    bgcolor: '#c62828'
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
                              <IconButton
                                size="small"
                                onClick={(e) => setActionMenu({ 
                                  anchor: e.currentTarget, 
                                  payment: payment 
                                })}
                                sx={{ 
                                  border: '1px solid #e0e0e0',
                                  color: '#757575'
                                }}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography variant="h6" sx={{ color: '#bdbdbd', fontWeight: 500 }}>
                          Không có yêu cầu hoàn tiền
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                          Các thanh toán đủ điều kiện hoàn tiền sẽ xuất hiện tại đây
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        <Card sx={{ borderRadius: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1a237e' }}>
              Điều kiện hoàn tiền
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '2px', 
                  bgcolor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1565c0' }}>
                    1
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Thanh toán thành công và lớp học chưa bắt đầu
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '2px', 
                  bgcolor: '#e3f2fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1565c0' }}>
                    2
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Yêu cầu phải được gửi trước khi lớp học bắt đầu
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1a237e' }}>
              Thời gian xử lý
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '2px', 
                  bgcolor: '#fff3e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#ef6c00' }}>
                    !
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Xử lý trong 5-7 ngày làm việc
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '2px', 
                  bgcolor: '#ffebee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                    X
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Có thể hủy khi trạng thái là "Đang chờ xử lý"
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Refund Dialog */}
      <RefundDialog 
        open={refundDialog.open}
        payment={refundDialog.payment}
        refundReason={refundReason}
        onRefundReasonChange={setRefundReason}
        onClose={() => setRefundDialog({ open: false, payment: null })}
        onSubmit={handleRefundRequest}
      />

      {/* Action Menu */}
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