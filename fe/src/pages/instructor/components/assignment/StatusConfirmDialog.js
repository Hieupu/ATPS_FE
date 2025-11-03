import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import { CheckCircle, Delete } from "@mui/icons-material";

export default function StatusConfirmDialog({ open, onClose, next, onConfirm, busy }) {
  const isActive = next === "active";
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Xác nhận thay đổi</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Bạn có chắc muốn đổi trạng thái sang <b>{next}</b>?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button
          variant="contained"
          color={isActive ? "success" : "error"}
          startIcon={isActive ? <CheckCircle /> : <Delete />}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "Processing..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
