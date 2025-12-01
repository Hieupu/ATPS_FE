import React from "react";
import { Menu, MenuItem, ListItemText } from "@mui/material";

const ActionMenu = ({ anchorEl, payment, onClose, onCancelRefund }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: { 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          borderRadius: 1
        }
      }}
    >
      {payment?.RefundStatus === 'pending' && (
        <MenuItem 
          onClick={() => {
            onCancelRefund(payment.RefundID);
            onClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemText sx={{ color: 'error.main' }}>
            Hủy yêu cầu hoàn tiền
          </ListItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default ActionMenu;