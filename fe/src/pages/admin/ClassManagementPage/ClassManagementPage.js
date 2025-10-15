import React, { useState, useEffect } from "react";
import classService from "../../../apiServices/classService";
import {
  ClassList,
  ClassForm,
  StudentSelector,
} from "../../../components/features/class-management";
import "./style.css";

const ClassManagementPage = () => {
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showClassForm, setShowClassForm] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Filter and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Tự động cập nhật trạng thái lớp học theo ngày trước khi load
      await classService.autoUpdateClassStatus();

      const [classesData, instructorsData, learnersData] = await Promise.all([
        classService.getAllClasses(),
        classService.getAllInstructors(),
        classService.getAllLearners(),
      ]);
      setClasses(classesData);
      setInstructors(instructorsData);
      setLearners(learnersData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      alert("❌ Không thể tải dữ liệu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddClass = () => {
    setSelectedClass(null);
    setShowClassForm(true);
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setShowClassForm(true);
  };

  const handleDeleteClass = async (classId) => {
    const confirmed = window.confirm(
      "⚠️ Bạn có chắc chắn muốn xóa lớp học này?\nHành động này không thể hoàn tác!"
    );

    if (confirmed) {
      try {
        await classService.deleteClass(classId);
        await loadData();
        alert("✅ Xóa lớp học thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa lớp học:", error);
        alert("❌ Không thể xóa lớp học. Vui lòng thử lại!");
      }
    }
  };

  const handleManageStudents = (classItem) => {
    setSelectedClass(classItem);
    setShowStudentSelector(true);
  };

  const handleSubmitClassForm = async (formData) => {
    try {
      if (selectedClass) {
        // Update existing class
        await classService.updateClass(selectedClass.id, formData);
        alert("✅ Cập nhật lớp học thành công!");
      } else {
        // Create new class
        await classService.createClass(formData);
        alert("✅ Thêm lớp học mới thành công!");
      }
      setShowClassForm(false);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi lưu lớp học:", error);
      alert("❌ Không thể lưu lớp học. Vui lòng thử lại!");
    }
  };

  const handleUpdateStudents = async (selectedStudents) => {
    try {
      await classService.updateClass(selectedClass.id, {
        enrolledStudents: selectedStudents,
      });
      alert("✅ Cập nhật danh sách học viên thành công!");
      setShowStudentSelector(false);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi cập nhật học viên:", error);
      alert("❌ Không thể cập nhật học viên. Vui lòng thử lại!");
    }
  };

  // Filter classes
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.instructorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || classItem.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: classes.length,
    active: classes.filter((c) => c.status === "Đang hoạt động").length,
    upcoming: classes.filter((c) => c.status === "Sắp khai giảng").length,
    completed: classes.filter((c) => c.status === "Đã kết thúc").length,
    noInstructor: classes.filter((c) => c.status === "Chưa phân giảng viên")
      .length,
  };

  return (
    <div className="class-management-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">📚 Quản Lý Lớp Học</h1>
          <p className="page-subtitle">
            Quản lý thông tin lớp học, lịch học và học viên
          </p>
        </div>
        <button className="btn btn-add" onClick={handleAddClass}>
          ➕ Thêm lớp học mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng số lớp</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card stat-upcoming">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-value">{stats.upcoming}</div>
            <div className="stat-label">Sắp khai giảng</div>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Đã kết thúc</div>
          </div>
        </div>
        <div className="stat-card stat-no-instructor">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.noInstructor}</div>
            <div className="stat-label">Chưa phân giảng viên</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Tìm kiếm lớp học (tên, mô tả, giảng viên)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Sắp khai giảng">Sắp khai giảng</option>
            <option value="Đã kết thúc">Đã kết thúc</option>
            <option value="Chưa phân giảng viên">Chưa phân giảng viên</option>
            <option value="Tạm dừng">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Class List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="results-info">
            Hiển thị <strong>{filteredClasses.length}</strong> /{" "}
            {classes.length} lớp học
          </div>
          <ClassList
            classes={filteredClasses}
            onEdit={handleEditClass}
            onDelete={handleDeleteClass}
            onManageStudents={handleManageStudents}
          />
        </>
      )}

      {/* Modals */}
      {showClassForm && (
        <ClassForm
          classData={selectedClass}
          instructors={instructors}
          onSubmit={handleSubmitClassForm}
          onCancel={() => setShowClassForm(false)}
        />
      )}

      {showStudentSelector && selectedClass && (
        <StudentSelector
          classData={selectedClass}
          allLearners={learners}
          onClose={() => setShowStudentSelector(false)}
          onUpdate={handleUpdateStudents}
        />
      )}
    </div>
  );
};

export default ClassManagementPage;
