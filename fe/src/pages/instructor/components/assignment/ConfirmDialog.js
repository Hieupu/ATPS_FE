import React from "react";
import "./style/ConfirmDialog.css"; // hoặc import từ file CSS global của bạn

const ConfirmDialog = ({
  open,
  title = "Xác nhận",
  message,
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <h3 className="confirm-title">{title}</h3>
        {message && <p className="confirm-message">{message}</p>}

        <div className="confirm-actions">
          <button className="confirm-btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-btn-primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
