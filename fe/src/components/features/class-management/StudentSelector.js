import React, { useState } from "react";
import "./StudentSelector.css";

const StudentSelector = ({ classData, allLearners, onClose, onUpdate }) => {
  const [selectedStudents, setSelectedStudents] = useState(
    classData.enrolledStudents || []
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc học viên theo từ khóa tìm kiếm
  const filteredLearners = allLearners.filter(
    (learner) =>
      learner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.phone.includes(searchTerm)
  );

  const isStudentEnrolled = (studentId) => {
    return selectedStudents.includes(studentId);
  };

  const handleToggleStudent = (studentId) => {
    if (isStudentEnrolled(studentId)) {
      // Xóa học viên
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    } else {
      // Thêm học viên
      if (selectedStudents.length >= classData.maxStudents) {
        alert(
          `⚠️ Lớp học đã đạt sĩ số tối đa (${classData.maxStudents} học viên)!`
        );
        return;
      }
      setSelectedStudents((prev) => [...prev, studentId]);
    }
  };

  const handleSave = () => {
    onUpdate(selectedStudents);
  };

  const enrolledLearners = allLearners.filter((l) =>
    selectedStudents.includes(l.id)
  );
  const availableLearners = filteredLearners.filter(
    (l) => !selectedStudents.includes(l.id)
  );

  return (
    <div className="student-selector-overlay">
      <div className="student-selector-container">
        <div className="selector-header">
          <div>
            <h2>👥 Quản lý học viên</h2>
            <p className="class-name">{classData.title}</p>
          </div>
          <button className="close-btn" onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>

        <div className="selector-body">
          <div className="student-stats">
            <div className="stat-item">
              <span className="stat-value">{selectedStudents.length}</span>
              <span className="stat-label">Đã ghi danh</span>
            </div>
            <div className="stat-divider">/</div>
            <div className="stat-item">
              <span className="stat-value">{classData.maxStudents}</span>
              <span className="stat-label">Sĩ số tối đa</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {classData.maxStudents - selectedStudents.length}
              </span>
              <span className="stat-label">Còn lại</span>
            </div>
          </div>

          <div className="search-section">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Tìm kiếm học viên (tên, email, số điện thoại)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="students-sections">
            {/* Học viên đã ghi danh */}
            <div className="students-section">
              <h3 className="section-title">
                ✅ Đã ghi danh ({enrolledLearners.length})
              </h3>
              {enrolledLearners.length > 0 ? (
                <div className="students-list">
                  {enrolledLearners.map((learner) => (
                    <div key={learner.id} className="student-card enrolled">
                      <div className="student-info">
                        <div className="student-avatar">
                          {learner.fullName.charAt(0)}
                        </div>
                        <div className="student-details">
                          <div className="student-name">{learner.fullName}</div>
                          <div className="student-contact">
                            📧 {learner.email}
                          </div>
                          <div className="student-contact">
                            📱 {learner.phone}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => handleToggleStudent(learner.id)}
                        title="Xóa khỏi lớp"
                      >
                        ➖ Xóa
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-section">
                  <p>Chưa có học viên nào ghi danh</p>
                </div>
              )}
            </div>

            {/* Học viên có sẵn */}
            <div className="students-section">
              <h3 className="section-title">
                ➕ Học viên có thể thêm ({availableLearners.length})
              </h3>
              {availableLearners.length > 0 ? (
                <div className="students-list">
                  {availableLearners.map((learner) => (
                    <div key={learner.id} className="student-card available">
                      <div className="student-info">
                        <div className="student-avatar">
                          {learner.fullName.charAt(0)}
                        </div>
                        <div className="student-details">
                          <div className="student-name">{learner.fullName}</div>
                          <div className="student-contact">
                            📧 {learner.email}
                          </div>
                          <div className="student-contact">
                            📱 {learner.phone}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn-add"
                        onClick={() => handleToggleStudent(learner.id)}
                        title="Thêm vào lớp"
                        disabled={
                          selectedStudents.length >= classData.maxStudents
                        }
                      >
                        ➕ Thêm
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-section">
                  <p>
                    {searchTerm
                      ? "Không tìm thấy học viên"
                      : "Không có học viên nào khả dụng"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="selector-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            ❌ Hủy
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            ✅ Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSelector;

