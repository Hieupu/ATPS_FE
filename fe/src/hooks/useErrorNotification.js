import { useState, useCallback } from "react";

// Custom hook để quản lý error notifications
const useErrorNotification = () => {
  const [notifications, setNotifications] = useState([]);

  // Thêm notification mới
  const addNotification = useCallback((error, options = {}) => {
    const {
      type = "error",
      displayMethod = "toast",
      duration = type === "error" ? 8000 : 5000,
      onClose,
      onRetry,
      onViewSchedule,
    } = options;

    const notification = {
      id: Date.now() + Math.random(),
      error,
      type,
      displayMethod,
      duration,
      onClose,
      onRetry,
      onViewSchedule,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remove notification sau duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    }

    return notification.id;
  }, []);

  // Xóa notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // Xóa tất cả notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Enhanced error handling với các phương pháp hiển thị khác nhau
  const showError = useCallback(
    (error, options = {}) => {
      const {
        displayMethod = "toast",
        showGuidance = true,
        ...otherOptions
      } = options;

      let errorMessage = error;
      let userGuidance = "";

      // Enhanced error message với hướng dẫn
      if (showGuidance && typeof error === "object" && error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || "";

        if (status === 500) {
          if (serverMessage.includes("Lỗi khi tạo session")) {
            errorMessage = `Lỗi server (500): ${serverMessage}`;
            userGuidance = `
🔧 Hướng dẫn khắc phục:
• Kiểm tra tất cả thông tin đã điền đầy đủ
• Đảm bảo ngày không phải ngày đã qua
• Kiểm tra định dạng thời gian (HH:MM:SS)
• Thử tạo session với thời gian khác
• Liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn`;
          } else if (serverMessage.includes("Database")) {
            errorMessage = `Lỗi server (500): ${serverMessage}`;
            userGuidance = `
🔧 Hướng dẫn khắc phục:
• Lỗi cơ sở dữ liệu tạm thời
• Vui lòng thử lại sau vài phút
• Liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn`;
          } else if (
            serverMessage.includes("constraint") ||
            serverMessage.includes("foreign key")
          ) {
            errorMessage = `Lỗi server (500): ${serverMessage}`;
            userGuidance = `
🔧 Hướng dẫn khắc phục:
• Kiểm tra lớp học có tồn tại và đang hoạt động
• Đảm bảo giảng viên được gán cho lớp
• Thử tạo session với thông tin khác`;
          } else {
            errorMessage = `Lỗi server (500): ${serverMessage}`;
            userGuidance = `
🔧 Hướng dẫn khắc phục:
• Vui lòng thử lại sau vài phút
• Kiểm tra kết nối mạng
• Liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn`;
          }
        } else if (status === 400) {
          errorMessage = `Lỗi dữ liệu (400): ${serverMessage}`;
          userGuidance = `
🔧 Hướng dẫn khắc phục:
• Kiểm tra thông tin đã điền
• Đảm bảo định dạng dữ liệu đúng
• Thử lại với thông tin khác`;
        } else if (status === 404) {
          errorMessage = `Không tìm thấy (404): ${serverMessage}`;
          userGuidance = `
🔧 Hướng dẫn khắc phục:
• Kiểm tra lớp học có tồn tại
• Tải lại trang và thử lại
• Liên hệ hỗ trợ nếu cần thiết`;
        } else if (status) {
          errorMessage = `Lỗi ${status}: ${serverMessage}`;
          userGuidance = `
🔧 Hướng dẫn khắc phục:
• Vui lòng thử lại
• Liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn`;
        }
      }

      // Combine error message và guidance
      const fullMessage = userGuidance
        ? `${errorMessage}${userGuidance}`
        : errorMessage;

      return addNotification(fullMessage, {
        type: "error",
        displayMethod,
        ...otherOptions,
      });
    },
    [addNotification]
  );

  // Show conflict error với thông tin chi tiết
  const showConflictError = useCallback(
    (errorMessage, options = {}) => {
      const { displayMethod = "modal", ...otherOptions } = options;

      return addNotification(errorMessage, {
        type: "warning",
        displayMethod,
        ...otherOptions,
      });
    },
    [addNotification]
  );

  // Show success message
  const showSuccess = useCallback(
    (message, options = {}) => {
      const {
        displayMethod = "toast",
        duration = 3000,
        ...otherOptions
      } = options;

      return addNotification(message, {
        type: "success",
        displayMethod,
        duration,
        ...otherOptions,
      });
    },
    [addNotification]
  );

  // Show warning message
  const showWarning = useCallback(
    (message, options = {}) => {
      const {
        displayMethod = "banner",
        duration = 5000,
        ...otherOptions
      } = options;

      return addNotification(message, {
        type: "warning",
        displayMethod,
        duration,
        ...otherOptions,
      });
    },
    [addNotification]
  );

  // Show info message
  const showInfo = useCallback(
    (message, options = {}) => {
      const {
        displayMethod = "toast",
        duration = 4000,
        ...otherOptions
      } = options;

      return addNotification(message, {
        type: "info",
        displayMethod,
        duration,
        ...otherOptions,
      });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showError,
    showConflictError,
    showSuccess,
    showWarning,
    showInfo,
  };
};

export default useErrorNotification;
