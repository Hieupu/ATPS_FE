import React, { useState, useEffect } from "react";
import classService from "../../../apiServices/classService";
import {
  ClassList,
  ClassForm,
} from "../../../components/features/class-management";
import { fixClassStatus } from "../../../utils/classStatusUtils";
import "./style.css";

const ClassManagementPage = () => {
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showClassForm, setShowClassForm] = useState(false);
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

      // Tự động cập nhật trạng thái lớp học theo ngày trước khi load (bỏ qua lỗi nếu có)
      try {
        await classService.autoUpdateClassStatus();
      } catch (updateError) {}

      // Sử dụng API mới để lấy danh sách lớp với thông tin thời gian
      const [classesResult, instructorsData, coursesData] = await Promise.all([
        classService.getClassTimeStats(), // Sử dụng time-stats thay vì with-time-info
        classService.getAllInstructors(),
        classService.getAllCourses(),
      ]);

      // Handle new response format: { success, data, message }
      const classesData = classesResult.data || [];
      setClasses(classesData);
      setInstructors(instructorsData.data || []);
      setCourses(coursesData.data || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      alert("Không thể tải dữ liệu. Vui lòng thử lại!");
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
      "Bạn có chắc chắn muốn xóa lớp học này?\nHành động này không thể hoàn tác!"
    );

    if (confirmed) {
      try {
        await classService.deleteClass(classId);
        await loadData();
        alert("Xóa lớp học thành công!");
      } catch (error) {
        alert("Không thể xóa lớp học. Vui lòng thử lại!");
      }
    }
  };

  const handleSubmitClassForm = async (formData) => {
    try {
      if (selectedClass) {
        // Update existing class
        const result = await classService.updateClass(
          selectedClass.ClassID,
          formData
        );

        // Handle new response format
        if (result.success !== false) {
          alert("Cập nhật lớp học thành công!");
        } else {
          alert(`${result.message || "Cập nhật lớp học thất bại!"}`);
          return;
        }
      } else {
        // Create new class
        const result = await classService.createClass(formData);

        // Handle new response format
        if (result.success !== false) {
          alert("Thêm lớp học mới thành công!");
        } else {
          alert(`${result.message || "Thêm lớp học thất bại!"}`);
          return;
        }
      }
      setShowClassForm(false);
      await loadData();
    } catch (error) {
      // Hiển thị error message chi tiết hơn
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể lưu lớp học";
      alert(`${errorMessage}. Vui lòng thử lại!`);
    }
  };

  // Filter classes - Sử dụng trạng thái đã được fix
  const filteredClasses = Array.isArray(classes)
    ? classes.filter((classItem) => {
        const fixedClass = fixClassStatus(classItem);

        const className = fixedClass.ClassName || "";
        const courseTitle =
          fixedClass.Course?.Title || fixedClass.courseTitle || "";
        const courseDescription = fixedClass.Course?.Description || "";
        const instructorName =
          fixedClass.Instructor?.FullName || fixedClass.instructorName || "";

        const matchesSearch =
          className.toLowerCase().includes(searchTerm.toLowerCase()) ||
          courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          courseDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructorName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || fixedClass.Status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Statistics - Sử dụng trạng thái đã được fix
  const stats = {
    total: Array.isArray(classes) ? classes.length : 0,
    active: Array.isArray(classes)
      ? classes.filter((c) => {
          const fixedClass = fixClassStatus(c);
          return fixedClass.Status === "Đang hoạt động";
        }).length
      : 0,
    upcoming: Array.isArray(classes)
      ? classes.filter((c) => {
          const fixedClass = fixClassStatus(c);
          return fixedClass.Status === "Sắp khai giảng";
        }).length
      : 0,
    completed: Array.isArray(classes)
      ? classes.filter((c) => {
          const fixedClass = fixClassStatus(c);
          return fixedClass.Status === "Đã kết thúc";
        }).length
      : 0,
    paused: Array.isArray(classes)
      ? classes.filter((c) => {
          const fixedClass = fixClassStatus(c);
          return fixedClass.Status === "Tạm dừng";
        }).length
      : 0,
  };

  return (
    <div className="class-management-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Quản Lý Lớp Học</h1>
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
          <div className="stat-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng số lớp</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon">
            <i className="fas fa-play-circle"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card stat-upcoming">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.upcoming}</div>
            <div className="stat-label">Sắp khai giảng</div>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Đã kết thúc</div>
          </div>
        </div>
        <div className="stat-card stat-paused">
          <div className="stat-icon">
            <i className="fas fa-pause-circle"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.paused}</div>
            <div className="stat-label">Tạm dừng</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm lớp học (tên lớp, khóa học, giảng viên)..."
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
          />
        </>
      )}

      {/* Modals */}
      {showClassForm && (
        <ClassForm
          classData={selectedClass}
          instructors={instructors}
          courses={courses}
          onSubmit={handleSubmitClassForm}
          onCancel={() => setShowClassForm(false)}
          userRole="admin"
        />
      )}
    </div>
  );
};

export default ClassManagementPage;
