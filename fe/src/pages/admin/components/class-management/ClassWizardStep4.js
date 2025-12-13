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
              ? selectedInstructor.FullName ||
                selectedInstructor.fullName
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
            <strong>Mật khẩu Zoom:</strong>{" "}
            {formData.Zoompass || "Chưa có"}
          </li>
          <li>
            <strong>Sĩ số tối đa:</strong>{" "}
            {formData.Maxstudent || "Chưa có"}
          </li>
        </ul>

        <h4>Thông tin lịch học:</h4>
        <ul>
          <li>
            <strong>Ngày dự kiến bắt đầu:</strong>{" "}
            {formatDate(formData.schedule.OpendatePlan) ||
              "Chưa có"}
          </li>
          <li>
            <strong>Ngày dự kiến kết thúc:</strong>{" "}
            {formatDate(
              formData.scheduleDetail.EnddatePlan
            ) || "Chưa có"}
          </li>
          <li>
            <strong>Tổng số buổi học:</strong>{" "}
            {formData.schedule.Numofsession || "Chưa có"}
          </li>
        </ul>

        {/* Thông báo quan trọng về số buổi trùng lịch */}
        {(() => {
          const skippedSessions = previewSessions.filter(
            (s) => s.type === "SKIPPED"
          );
          const extendedSessions = previewSessions.filter(
            (s) => s.type === "EXTENDED"
          );

          if (skippedSessions.length > 0) {
            // Tính số ngày trễ hơn dự kiến
            const originalEndDate = formData.scheduleDetail.EnddatePlan
              ? dayjs(formData.scheduleDetail.EnddatePlan)
              : null;
            const actualEndDate =
              extendedSessions.length > 0
                ? dayjs(
                    extendedSessions[extendedSessions.length - 1].date
                  )
                : originalEndDate;

            const daysDelayed =
              originalEndDate && actualEndDate
                ? actualEndDate.diff(originalEndDate, "day")
                : 0;

            return (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffc107",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "16px",
                    marginBottom: "8px",
                    color: "#856404",
                  }}
                >
                  ⚠️ Thông báo quan trọng
                </div>
                <div style={{ fontSize: "14px", color: "#856404" }}>
                  Lớp học sẽ kết thúc trễ hơn dự kiến{" "}
                  <strong>{daysDelayed} ngày</strong> do có{" "}
                  <strong>{skippedSessions.length} buổi</strong> trùng
                  lịch giảng viên (Status='Other' hoặc 'Holiday').
                  {extendedSessions.length > 0 && (
                    <span>
                      {" "}
                      Các buổi thêm lại ca học (
                      {extendedSessions.length} buổi) sẽ được thêm vào
                      cuối lịch học.
                    </span>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}

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
            {formData.sessions.map((session, index) => {
              const timeslot = timeslots.find(
                (t) => (t.TimeslotID || t.id) === session.TimeslotID
              );
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
                    <div>
                      Ngày: {formatDate(session.Date)}
                    </div>
                    {timeslot && (
                      <div>
                        Ca học:{" "}
                        {timeslot.StartTime || timeslot.startTime} -{" "}
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

