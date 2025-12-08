// utils/paymentUtils.js
export const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericAmount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return "Chưa xác định";
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("vi-VN");
  } catch (error) {
    return "Invalid Date";
  }
};

export const getStatusDisplay = (payment) => {
  if (payment.RefundID && payment.RefundStatus) {
    return {
      text: getRefundStatusText(payment.RefundStatus),
      color: getRefundStatusColor(payment.RefundStatus),
      type: 'refund'
    };
  }

  // Nếu không có gì thì hiện "..."
  return {
    text: "...",
    color: "default",
    type: "none"
  };
};


export const getPaymentStatusText = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case "success": 
      return "Thành công";
    case "pending": return "Đang chờ";
    case "failed": return "Thất bại";
    case "completed": return "Hoàn thành";
    default: return status || "Không xác định";
  }
};

export const getRefundStatusText = (status) => {
  if (!status) return "Không có";
  
  switch (status.toLowerCase()) {
    case 'pending': return 'Đang chờ xử lý';
    case 'approved': return 'Đã hoàn tiền';
    case 'cancelled': return 'Đã hủy yêu cầu';
    default: return status;
  }
};

export const getRefundStatusColor = (status) => {
  if (!status) return { bgcolor: '#f5f5f5', color: '#757575' };
  
  switch (status.toLowerCase()) {
    case 'pending': 
      return { bgcolor: '#fff3e0', color: '#ed6c02' };
    case 'approved': 
      return { bgcolor: '#e8f5e9', color: '#2e7d32' };
    case 'cancelled': 
      return { bgcolor: '#ffebee', color: '#d32f2f' };
    default: 
      return { bgcolor: '#f5f5f5', color: '#757575' };
  }
};

export const getPaymentStatusColor = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case "success": 
    case "completed":
      return { bgcolor: '#e8f5e9', color: '#2e7d32' };
    case "pending": 
      return { bgcolor: '#fff3e0', color: '#ed6c02' };
    case "failed": 
      return { bgcolor: '#ffebee', color: '#d32f2f' };
    default: 
      return { bgcolor: '#f5f5f5', color: '#757575' };
  }
};

export const canRequestRefund = (payment) => {
  // Kiểm tra nếu có yêu cầu hoàn tiền ĐANG HOẠT ĐỘNG (pending hoặc approved)
  if (payment.RefundID && ['pending', 'approved'].includes(payment.RefundStatus?.toLowerCase())) {
    return false;
  }

  // Chỉ cho phép hoàn tiền nếu thanh toán thành công
  const paymentStatus = payment.PaymentStatus || payment.Status;
  if (paymentStatus !== "success") {
    return false;
  }

  const currentDate = new Date();
  const startDate = new Date(payment.Opendate || payment.OpendatePlan);
  
  // Chỉ cho phép hoàn tiền nếu lớp chưa bắt đầu
  return startDate > currentDate;
};

export const canCancelRefund = (payment) => {
  // Chỉ có thể hủy yêu cầu hoàn tiền nếu trạng thái là pending
  return payment.RefundStatus === 'pending';
};

export const hasActiveRefund = (payment) => {
  return payment.RefundID && payment.RefundStatus === 'pending';
};