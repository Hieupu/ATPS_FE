import React from "react";
import ErrorNotification from "./ErrorNotification";

// Container component để hiển thị tất cả error notifications
const ErrorNotificationContainer = ({
  notifications,
  onRemoveNotification,
}) => {
  return (
    <>
      {notifications.map((notification) => (
        <ErrorNotification
          key={notification.id}
          error={notification.error}
          type={notification.type}
          displayMethod={notification.displayMethod}
          onClose={() => onRemoveNotification(notification.id)}
          onRetry={notification.onRetry}
          onViewSchedule={notification.onViewSchedule}
        />
      ))}
    </>
  );
};

export default ErrorNotificationContainer;
