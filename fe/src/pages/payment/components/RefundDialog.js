import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem
} from "@mui/material";

const RefundDialog = ({
  open,
  payment,
  refundReason,
  onRefundReasonChange,
  onClose,
  onSubmit
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Yêu cầu hoàn tiền</DialogTitle>
      <DialogContent>
        <Box sx={{ 
          bgcolor: '#fff3e0', 
          p: 2, 
          borderRadius: 1, 
          mb: 3,
          border: '1px solid #ffe0b2'
        }}>
          <Typography variant="body2" sx={{ color: '#e65100' }}>
            ⚠️ Yêu cầu hoàn tiền được xử lý trong vòng 5-7 ngày làm việc
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            CHỌN THANH TOÁN
          </Typography>
          <TextField
            fullWidth
            size="small"
            disabled
            value={payment?.Enrollment?.Class?.Name || payment?.ClassName || ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f5f5f5'
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            LÝ DO
          </Typography>
          <TextField
            fullWidth
            size="small"
            select
            value={refundReason.includes('Tôi muốn') ? refundReason : ''}
            onChange={(e) => onRefundReasonChange(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f5f5f5',
                '& fieldset': { borderColor: '#e0e0e0' }
              }
            }}
          >
            <MenuItem value="">Chọn lý do...</MenuItem>
            <MenuItem value="Tôi muốn đổi sang khóa học khác">Tôi muốn đổi sang khóa học khác</MenuItem>
            <MenuItem value="Tôi không thể tham gia lớp học">Tôi không thể tham gia lớp học</MenuItem>
            <MenuItem value="Chất lượng khóa học không như mong đợi">Chất lượng khóa học không như mong đợi</MenuItem>
            <MenuItem value="Lý do khác">Lý do khác</MenuItem>
          </TextField>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            MÔ TẢ
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={refundReason.includes('Tôi muốn') ? '' : refundReason}
            onChange={(e) => onRefundReasonChange(e.target.value)}
            placeholder="Vui lòng cung cấp thêm chi tiết về yêu cầu hoàn tiền của bạn..."
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f5f5f5',
                '& fieldset': { borderColor: '#e0e0e0' }
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            textTransform: 'none',
            color: 'text.secondary'
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={onSubmit}
          variant="contained"
          disabled={!refundReason.trim()}
          sx={{ 
            textTransform: 'none',
            bgcolor: '#5570f1',
            '&:hover': {
              bgcolor: '#4461d9'
            },
            px: 3
          }}
        >
          Gửi yêu cầu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundDialog;