import React from "react";
import { useNavigate } from "react-router-dom";
import { getClassTimeDisplay } from "../../../utils/timeUtils";
import { fixClassStatus } from "../../../utils/classStatusUtils";
import "./ClassList.css";

const ClassList = ({ classes, onEdit, onDelete }) => {
  const navigate = useNavigate();

  // Debug logs removed for production

  const getStatusClass = (status) => {
    switch (status) {
      case "Đang hoạt động":
        return "status-active";
      case "Sắp khai giảng":
        return "status-upcoming";
      case "Đã kết thúc":
        return "status-completed";
      case "Tạm dừng":
        return "status-paused";
      default:
        return "status-inactive";
    }
  };

  return (
    <div className="class-list-container">
      {classes.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có lớp học nào. Hãy thêm lớp học mới!</p>
        </div>
      ) : (
        <div className="class-grid">
          {classes.map((classItem) => {
            // Sửa trạng thái class nếu cần
            const fixedClassItem = fixClassStatus(classItem);

            return (
              <div key={fixedClassItem.ClassID} className="class-card">
                <div className="class-header">
                  <h3 className="class-title">
                    {fixedClassItem.ClassName ||
                      fixedClassItem.Course?.Title ||
                      "Lớp học chưa có tên"}
                  </h3>
                  <span
                    className={`status-badge ${getStatusClass(
                      fixedClassItem.Status
                    )}`}
                  >
                    {fixedClassItem.Status}
                    {fixedClassItem._statusFixed && (
                      <span
                        className="status-fixed-indicator"
                        title="Trạng thái đã được sửa tự động"
                      >
                        {" "}
                        🔧
                      </span>
                    )}
                  </span>
                </div>

                <div className="class-course">
                  <strong>Khóa học:</strong>{" "}
                  {fixedClassItem.Course?.Title || "Chưa có khóa học"}
                </div>

                <div className="class-body">
                  <p className="class-description">
                    {fixedClassItem.Course?.Description || "Không có mô tả"}
                  </p>

                  <div className="class-info">
                    <div className="info-row">
                      <span className="info-label">Giảng viên:</span>
                      <span className="info-value">
                        {fixedClassItem.Instructor?.FullName ||
                          "Chưa phân công"}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Khóa học:</span>
                      <span className="info-value">
                        {fixedClassItem.Course?.Title || "Chưa chọn khóa học"}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Học viên:</span>
                      <span className="info-value">
                        {fixedClassItem.EnrolledStudents?.length ||
                          fixedClassItem._original?.enrolledCount ||
                          0}{" "}
                        học viên (tự đăng ký)
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Thời gian:</span>
                      <span className="info-value">
                        {getClassTimeDisplay(fixedClassItem)}
                      </span>
                    </div>

                    {fixedClassItem.ZoomURL && (
                      <div className="info-row">
                        <span className="info-label">Zoom:</span>
                        <span className="info-value">
                          <a
                            href={fixedClassItem.ZoomURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="zoom-link"
                          >
                            Tham gia Zoom
                          </a>
                        </span>
                      </div>
                    )}

                    <div className="info-note">
                      <span className="info-label">Lưu ý:</span>
                      <span className="info-value">
                        Học viên tự đăng ký vào lớp. Click "Session" để quản lý
                        lịch học
                      </span>
                    </div>

                    {fixedClassItem.Status === "Sắp khai giảng" &&
                      fixedClassItem.InstructorID && (
                        <div className="info-note auto-update-note">
                          <span className="info-label">Tự động:</span>
                          <span className="info-value">
                            Sẽ chuyển thành "Đang hoạt động" khi đến ngày bắt
                            đầu session đầu tiên
                          </span>
                        </div>
                      )}

                    {fixedClassItem.Status === "Đang hoạt động" && (
                      <div className="info-note auto-update-note">
                        <span className="info-label">Tự động:</span>
                        <span className="info-value">
                          Sẽ chuyển thành "Đã kết thúc" khi qua ngày kết thúc
                          session cuối cùng
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="class-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onEdit(fixedClassItem)}
                    title="Chỉnh sửa"
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() =>
                      navigate(
                        `/admin/classes/${fixedClassItem.ClassID}/schedule`
                      )
                    }
                    title="Quản lý session và lịch học"
                  >
                    Session
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(fixedClassItem.ClassID)}
                    title="Xóa"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassList;
