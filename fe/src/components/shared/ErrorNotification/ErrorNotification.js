import React, { useState, useEffect } from "react";
import "./ErrorNotification.css";

// Error Notification Component để thay thế alert()
const ErrorNotification = ({
  error,
  type = "error",
  displayMethod = "toast",
  onClose,
  onRetry,
  onViewSchedule,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Auto-hide cho toast notifications
  useEffect(() => {
    if (displayMethod === "toast" && type !== "error") {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [displayMethod, type]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const handleRetry = () => {
    onRetry && onRetry();
    handleClose();
  };

  // Parse conflict error để lấy thông tin chi tiết
  const parseConflictError = (errorMessage) => {
    if (!errorMessage) return null;

    // Các pattern để parse thông tin từ error message
    const patterns = {
      // Pattern 1: "lớp A2 - Bài 1: Giới thiệu Python & Anaconda (2025-11-04 09:00:00-11:00:00)"
      fullPattern:
        /lớp\s+([^-\s]+)\s*-\s*([^(]+)\s*\((\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})-(\d{2}:\d{2}:\d{2})\)/i,

      // Pattern 2: "A2 - Bài 1: Giới thiệu Python & Anaconda (2025-11-04 09:00:00-11:00:00)"
      classFirstPattern:
        /([^-\s]+)\s*-\s*([^(]+)\s*\((\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})-(\d{2}:\d{2}:\d{2})\)/i,

      // Pattern 3: "Session: Bài 1: Giới thiệu Python & Anaconda"
      sessionPattern: /Session:\s*([^(]+)/i,

      // Pattern 4: "Lớp: A2"
      classPattern: /Lớp:\s*([^-\s,]+)/i,

      // Pattern 5: "A2" (standalone class name)
      standaloneClassPattern: /\b([A-Z]\d+)\b/,

      // Pattern 6: Time pattern
      timePattern:
        /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})-(\d{2}:\d{2}:\d{2})/,
    };

    let className = "Unknown";
    let sessionTitle = "Unknown Session";
    let date = "Unknown Date";
    let startTime = "Unknown Time";
    let endTime = "Unknown Time";

    // Thử parse với full pattern trước
    const fullMatch = errorMessage.match(patterns.fullPattern);
    if (fullMatch) {
      className = fullMatch[1];
      sessionTitle = fullMatch[2].trim();
      date = fullMatch[3];
      startTime = fullMatch[4];
      endTime = fullMatch[5];
    } else {
      // Thử parse với class first pattern
      const classFirstMatch = errorMessage.match(patterns.classFirstPattern);
      if (classFirstMatch) {
        className = classFirstMatch[1];
        sessionTitle = classFirstMatch[2].trim();
        date = classFirstMatch[3];
        startTime = classFirstMatch[4];
        endTime = classFirstMatch[5];
      } else {
        // Parse từng phần riêng lẻ
        const sessionMatch = errorMessage.match(patterns.sessionPattern);
        if (sessionMatch) {
          sessionTitle = sessionMatch[1].trim();
          // Nếu session title chứa thông tin thời gian, tách ra
          const timeInSession = sessionTitle.match(patterns.timePattern);
          if (timeInSession) {
            sessionTitle = sessionTitle
              .replace(patterns.timePattern, "")
              .trim()
              .replace(/,$/, "");
            date = timeInSession[1];
            startTime = timeInSession[2];
            endTime = timeInSession[3];
          }
        }

        const classMatch = errorMessage.match(patterns.classPattern);
        if (classMatch) {
          className = classMatch[1];
        } else {
          // Thử tìm standalone class name
          const standaloneMatch = errorMessage.match(
            patterns.standaloneClassPattern
          );
          if (standaloneMatch) {
            className = standaloneMatch[1];
          }
        }

        // Chỉ parse time nếu chưa có từ session
        if (date === "Unknown Date") {
          const timeMatch = errorMessage.match(patterns.timePattern);
          if (timeMatch) {
            date = timeMatch[1];
            startTime = timeMatch[2];
            endTime = timeMatch[3];
          }
        }
      }
    }

    return {
      className,
      sessionTitle,
      date,
      startTime,
      endTime,
    };
  };

  // Kiểm tra nếu là conflict error
  const isConflictError = (errorMessage) => {
    return errorMessage && errorMessage.includes("trùng thời gian");
  };

  if (!isVisible) return null;

  const conflictInfo = isConflictError(error)
    ? parseConflictError(error)
    : null;

  // Toast Notification
  if (displayMethod === "toast") {
    return (
      <div className={`error-toast ${type} ${isClosing ? "closing" : ""}`}>
        <div className="toast-content">
          <div className="toast-icon">
            {type === "error" ? (
              <i className="fas fa-times-circle"></i>
            ) : type === "warning" ? (
              <i className="fas fa-exclamation-triangle"></i>
            ) : (
              <i className="fas fa-check-circle"></i>
            )}
          </div>
          <div className="toast-message">
            {conflictInfo ? (
              <div className="conflict-error">
                <div className="conflict-title">Trùng Ca Học</div>
                <div className="conflict-details">
                  {conflictInfo.className !== "Unknown" ? (
                    <>
                      <div>Instructor đã bận vào ca học tại:</div>
                      <div>
                        • Lớp: <strong>{conflictInfo.className}</strong>
                      </div>
                      {conflictInfo.sessionTitle !== "Unknown Session" && (
                        <div>• Session: {conflictInfo.sessionTitle}</div>
                      )}
                      {conflictInfo.date !== "Unknown Date" && (
                        <div>
                          • Thời gian: {conflictInfo.date}{" "}
                          {conflictInfo.startTime}-{conflictInfo.endTime}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>Instructor đã bận vào ca học này</div>
                  )}
                </div>
                <div className="conflict-explanation">
                  {conflictInfo.className !== "Unknown" ? (
                    <>
                      Không thể tạo ca học mới vì instructor đã có lịch tại lớp
                      "<strong>{conflictInfo.className}</strong>".
                    </>
                  ) : (
                    "Không thể tạo ca học mới vì instructor đã bận vào thời gian này."
                  )}
                </div>
              </div>
            ) : (
              <div className="error-message">{error}</div>
            )}
          </div>
          <button className="toast-close" onClick={handleClose}>
            ×
          </button>
        </div>
        {conflictInfo && (
          <div className="toast-actions">
            <button className="btn-primary" onClick={handleRetry}>
              Chọn thời gian khác
            </button>
          </div>
        )}
      </div>
    );
  }

  // Modal Dialog
  if (displayMethod === "modal") {
    return (
      <div className="error-modal-overlay">
        <div className={`error-modal ${type} ${isClosing ? "closing" : ""}`}>
          <div className="modal-header">
            <div className="modal-icon">
              {type === "error" ? (
                <i className="fas fa-times-circle"></i>
              ) : type === "warning" ? (
                <i className="fas fa-exclamation-triangle"></i>
              ) : (
                <i className="fas fa-check-circle"></i>
              )}
            </div>
            <h3 className="modal-title">
              {conflictInfo ? <>Trùng Ca Học</> : "Lỗi khi lưu lịch"}
            </h3>
            <button className="modal-close" onClick={handleClose}>
              ×
            </button>
          </div>

          <div className="modal-content">
            {conflictInfo ? (
              <div className="conflict-error-details">
                <div className="conflict-message">
                  {conflictInfo.className !== "Unknown"
                    ? "Instructor đã bận vào ca học tại:"
                    : "Instructor đã bận vào ca học này"}
                </div>
                {conflictInfo.className !== "Unknown" && (
                  <div className="conflict-info">
                    <div className="info-item">
                      <span className="label">Lớp:</span>
                      <span className="value">{conflictInfo.className}</span>
                    </div>
                    {conflictInfo.sessionTitle !== "Unknown Session" && (
                      <div className="info-item">
                        <span className="label">Session:</span>
                        <span className="value">
                          {conflictInfo.sessionTitle}
                        </span>
                      </div>
                    )}
                    {conflictInfo.date !== "Unknown Date" && (
                      <div className="info-item">
                        <span className="label">Thời gian:</span>
                        <span className="value">
                          {conflictInfo.date} {conflictInfo.startTime}-
                          {conflictInfo.endTime}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="conflict-explanation">
                  {conflictInfo.className !== "Unknown" ? (
                    <>
                      Không thể tạo ca học mới vì instructor đã có lịch tại lớp
                      "<strong>{conflictInfo.className}</strong>". Vui lòng chọn
                      thời gian khác để tránh trùng lịch.
                    </>
                  ) : (
                    "Không thể tạo ca học mới vì instructor đã bận vào thời gian này. Vui lòng chọn thời gian khác."
                  )}
                </div>
              </div>
            ) : (
              <div className="error-message">{error}</div>
            )}
          </div>

          <div className="modal-actions">
            {conflictInfo ? (
              <>
                <button className="btn-primary" onClick={handleRetry}>
                  Chọn thời gian khác
                </button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={handleClose}>
                  Đóng
                </button>
                <button className="btn-primary" onClick={handleRetry}>
                  Thử lại
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Banner Notification
  if (displayMethod === "banner") {
    return (
      <div className={`error-banner ${type} ${isClosing ? "closing" : ""}`}>
        <div className="banner-content">
          <div className="banner-icon">
            {type === "error" ? (
              <i className="fas fa-times-circle"></i>
            ) : type === "warning" ? (
              <i className="fas fa-exclamation-triangle"></i>
            ) : (
              <i className="fas fa-check-circle"></i>
            )}
          </div>
          <div className="banner-message">
            {conflictInfo ? (
              <div>
                <strong>Trùng Ca Học:</strong>{" "}
                {conflictInfo.className !== "Unknown" ? (
                  <>
                    Instructor đã bận vào ca học tại lớp{" "}
                    <strong>{conflictInfo.className}</strong>. Vui lòng chọn
                    thời gian khác.
                  </>
                ) : (
                  "Instructor đã bận vào ca học này. Vui lòng chọn thời gian khác."
                )}
              </div>
            ) : (
              <div>{error}</div>
            )}
          </div>
          <div className="banner-actions">
            {conflictInfo}
            <button className="btn-link" onClick={handleRetry}>
              Thử lại
            </button>
            <button className="banner-close" onClick={handleClose}>
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline Error
  if (displayMethod === "inline") {
    return (
      <div className={`error-inline ${type} ${isClosing ? "closing" : ""}`}>
        <div className="inline-content">
          <div className="inline-icon">
            {type === "error" ? (
              <i className="fas fa-times-circle"></i>
            ) : type === "warning" ? (
              <i className="fas fa-exclamation-triangle"></i>
            ) : (
              <i className="fas fa-check-circle"></i>
            )}
          </div>
          <div className="inline-message">
            {conflictInfo ? (
              <div>
                <strong>Trùng ca học:</strong>{" "}
                {conflictInfo.className !== "Unknown" ? (
                  <>
                    Instructor đã bận vào ca học tại lớp{" "}
                    <strong>{conflictInfo.className}</strong>. Vui lòng chọn
                    thời gian khác.
                  </>
                ) : (
                  "Instructor đã bận vào ca học này. Vui lòng chọn thời gian khác."
                )}
              </div>
            ) : (
              <div>{error}</div>
            )}
          </div>
          <button className="inline-close" onClick={handleClose}>
            ×
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ErrorNotification;
