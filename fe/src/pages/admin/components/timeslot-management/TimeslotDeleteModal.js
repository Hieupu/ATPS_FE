import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const TimeslotDeleteModal = ({
  open,
  label = "",
  onClose,
  onConfirm,
  submitting = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Bạn có chắc chắn muốn xóa ca học {label || ""}? Hành động này không
          thể hoàn tác.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ textTransform: "none", color: "#64748b" }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={submitting}
          sx={{ textTransform: "none" }}
        >
          {submitting ? "Đang xóa..." : "Xóa ca học"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeslotDeleteModal;

