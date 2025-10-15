import React from "react";
import { useNavigate } from "react-router-dom";
import "./ClassList.css";

const ClassList = ({ classes, onEdit, onDelete, onManageStudents }) => {
  const navigate = useNavigate();
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Đang hoạt động":
        return "status-active";
      case "Sắp khai giảng":
        return "status-upcoming";
      case "Đã kết thúc":
        return "status-completed";
      case "Chưa phân giảng viên":
        return "status-no-instructor";
      default:
        return "status-inactive";
    }
  };

  return (
    <div className="class-list-container">
      {classes.length === 0 ? (
        <div className="empty-state">
          <p>📚 Chưa có lớp học nào. Hãy thêm lớp học mới!</p>
        </div>
      ) : (
        <div className="class-grid">
          {classes.map((classItem) => (
            <div key={classItem.id} className="class-card">
              <div className="class-header">
                <h3 className="class-title">{classItem.title}</h3>
                <span
                  className={`status-badge ${getStatusClass(classItem.status)}`}
                >
                  {classItem.status}
                </span>
              </div>

              <div className="class-body">
                <p className="class-description">{classItem.description}</p>

                <div className="class-info">
                  <div className="info-row">
                    <span className="info-label">🧑‍🏫 Giảng viên:</span>
                    <span className="info-value">
                      {classItem.instructorName || "Chưa phân công"}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">⏱️ Thời lượng:</span>
                    <span className="info-value">{classItem.duration} giờ</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">💰 Học phí:</span>
                    <span className="info-value">
                      {formatCurrency(classItem.tuitionFee)}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">👥 Học viên:</span>
                    <span className="info-value">
                      {classItem.enrolledStudents.length}/
                      {classItem.maxStudents}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">📅 Thời gian:</span>
                    <span className="info-value">
                      {classItem.startDate} - {classItem.endDate}
                    </span>
                  </div>

                  <div className="info-note">
                    <span className="info-label">💡 Lưu ý:</span>
                    <span className="info-value">
                      Click nút "📅 Lịch" để quản lý lịch học chi tiết
                    </span>
                  </div>

                  {classItem.status === "Sắp khai giảng" &&
                    classItem.instructorId && (
                      <div className="info-note auto-update-note">
                        <span className="info-label">🔄 Tự động:</span>
                        <span className="info-value">
                          Sẽ chuyển thành "Đang hoạt động" khi đến ngày{" "}
                          {classItem.startDate}
                        </span>
                      </div>
                    )}

                  {classItem.status === "Đang hoạt động" && (
                    <div className="info-note auto-update-note">
                      <span className="info-label">🔄 Tự động:</span>
                      <span className="info-value">
                        Sẽ chuyển thành "Đã kết thúc" khi qua ngày{" "}
                        {classItem.endDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="class-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onEdit(classItem)}
                  title="Chỉnh sửa"
                >
                  ✏️ Sửa
                </button>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() =>
                    navigate(`/admin/classes/${classItem.id}/schedule`)
                  }
                  title="Quản lý lịch học"
                >
                  📅 Lịch
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => onManageStudents(classItem)}
                  title="Quản lý học viên"
                >
                  👥 HV
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(classItem.id)}
                  title="Xóa"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassList;
