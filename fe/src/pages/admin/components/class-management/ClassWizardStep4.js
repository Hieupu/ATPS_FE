import React from "react";
import dayjs from "dayjs";
import { formatDateForDisplay } from "./ClassWizard.constants";

const ClassWizardStep4 = ({
  formData,
  selectedInstructor,
  selectedCourse,
  previewSessions,
  timeslots,
  formatDateForDisplay: formatDate,
}) => {
  return (
    <div className="wizard-step-content">
      <div className="review-section">
        <h4>Thông tin lớp:</h4>
        <ul>
          <li>
            <strong>Tên:</strong> {formData.Name}
          </li>
          <li>
            <strong>Giảng viên:</strong>{" "}
            {selectedInstructor
              ? selectedInstructor.FullName || selectedInstructor.fullName
              : "Chưa chọn"}
          </li>
          <li>
            <strong>Khóa/Môn:</strong>{" "}
            {selectedCourse
              ? selectedCourse.Title || selectedCourse.title
              : "Chưa chọn"}
          </li>
          <li>
            <strong>Học phí:</strong>{" "}
            {formData.Fee && parseFloat(formData.Fee) > 0
              ? new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(formData.Fee)
              : "Không có"}
          </li>
          <li>
            <strong>Zoom ID:</strong> {formData.ZoomID || "Chưa có"}
          </li>
          <li>
            <strong>Mật khẩu Zoom:</strong> {formData.Zoompass || "Chưa có"}
          </li>
          <li>
            <strong>Sĩ số tối đa:</strong> {formData.Maxstudent || "Chưa có"}
          </li>
        </ul>

        <h4>Thông tin lịch học:</h4>
        <ul>
          <li>
            <strong>Ngày dự kiến bắt đầu:</strong>{" "}
            {formatDate(formData.schedule.OpendatePlan) || "Chưa có"}
          </li>
          <li>
            <strong>Ngày dự kiến kết thúc:</strong>{" "}
            {formatDate(formData.scheduleDetail.EnddatePlan) || "Chưa có"}
          </li>
          <li>
            <strong>Tổng số buổi học:</strong>{" "}
            {formData.schedule.Numofsession || "Chưa có"}
          </li>
        </ul>

        <h4>Danh sách buổi học:</h4>
        {formData.sessions && formData.sessions.length > 0 ? (
          <div
            style={{
              marginTop: "12px",
              maxHeight: "320px",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            {formData.sessions
              .filter((session) => {
                // Không hiển thị các buổi đã bị disable (đã được đổi lịch)
                return session.isDisabled !== true;
              })
              .map((session, index) => {
                // Normalize TimeslotID để so sánh (có thể là string hoặc number)
                const sessionTimeslotId =
                  session.TimeslotID || session.timeslotId;
                const normalizedSessionId =
                  typeof sessionTimeslotId === "string"
                    ? parseInt(sessionTimeslotId, 10)
                    : sessionTimeslotId;

                const timeslot = timeslots.find((t) => {
                  const tId = t.TimeslotID || t.id;
                  const normalizedTId =
                    typeof tId === "string" ? parseInt(tId, 10) : tId;
                  return normalizedTId === normalizedSessionId;
                });
                return (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      marginBottom: "8px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      Buổi {index + 1}: {session.Title}
                    </div>
                    <div style={{ fontSize: "14px", color: "#64748b" }}>
                      <div>Ngày: {formatDate(session.Date)}</div>
                      {timeslot && (
                        <div>
                          Ca học: {timeslot.StartTime || timeslot.startTime} -{" "}
                          {timeslot.EndTime || timeslot.endTime}
                        </div>
                      )}
                      {session.Description && (
                        <div>Mô tả: {session.Description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p style={{ color: "#64748b", fontStyle: "italic" }}>
            Chưa có buổi học nào
          </p>
        )}
      </div>
    </div>
  );
};

export default ClassWizardStep4;
