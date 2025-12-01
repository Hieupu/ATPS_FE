import React from "react";
import { Snackbar, Alert } from "@mui/material";

const NotificationSnackbar = ({ snackbar, onClose }) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={onClose}
    >
      <Alert 
        severity={snackbar.severity} 
        onClose={onClose}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;