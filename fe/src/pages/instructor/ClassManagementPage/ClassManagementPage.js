import React, { useState, useEffect } from "react";
import classService from "../../../apiServices/classService";
import { ClassList } from "../../../components/features/class-management";
import { InstructorClassForm } from "../../../components/instructor/ClassManagement";
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

  // Current instructor (mock data for now)
  const currentInstructor = {
    InstructorID: 1,
    FullName: "Nguyễn Văn A",
    Major: "Công nghệ thông tin",
    Email: "nguyenvana@example.com",
  };

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("📊 Instructor loading data...");

      // Tự động cập nhật trạng thái lớp học theo ngày trước khi load
      await classService.autoUpdateClassStatus();

      const [classesResult, instructorsData, coursesData] = await Promise.all([
        classService.getAllClassesWithDetails(),
        classService.getAllInstructors(),
        classService.getAllCourses(),
      ]);

      console.log("📊 Classes result:", classesResult);
      console.log("📊 Instructors data:", instructorsData);
      console.log("📊 Courses data:", coursesData);

      // Handle new response format: { data, pagination }
      const classesData = classesResult.data || classesResult;
      setClasses(classesData);
      setInstructors(instructorsData);
      setCourses(coursesData);
    } catch (error) {
      console.error("❌ Lỗi khi tải dữ liệu:", error);
      alert("Không thể tải dữ liệu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    setSelectedClass(null);
    setShowClassForm(true);
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setShowClassForm(true);
  };

  const handleSubmitClassForm = async (formData) => {
    try {
      console.log("📝 Submitting class form data:", formData);
      console.log("📝 Selected class:", selectedClass);

      if (selectedClass) {
        // Update existing class
        const updatedClass = await classService.updateClass(
          selectedClass.ClassID,
          formData
        );
        console.log("✅ Class updated successfully:", updatedClass);
      } else {
        // Create new class
        const newClass = await classService.createClass(formData);
        console.log("✅ Class created successfully:", newClass);
      }

      // Reload data
      await loadData();
      setShowClassForm(false);
      setSelectedClass(null);
      alert("✅ Lớp học đã được lưu thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi lưu lớp học:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        formData: formData, // Added for debugging
        selectedClass: selectedClass, // Added for debugging
      });

      // Hiển thị error message chi tiết hơn
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể lưu lớp học";
      alert(`❌ ${errorMessage}. Vui lòng thử lại!`);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      try {
        await classService.deleteClass(classId);
        await loadData();
        alert("✅ Lớp học đã được xóa thành công!");
      } catch (error) {
        console.error("❌ Lỗi khi xóa lớp học:", error);
        alert("❌ Không thể xóa lớp học. Vui lòng thử lại!");
      }
    }
  };

  // Filter classes
  const filteredClasses = Array.isArray(classes)
    ? classes.filter((classItem) => {
        const className = classItem.ClassName || "";
        const courseTitle = classItem.Course?.Title || "";
        const courseDescription = classItem.Course?.Description || "";
        const instructorName = classItem.Instructor?.FullName || "";

        const matchesSearch =
          className.toLowerCase().includes(searchTerm.toLowerCase()) ||
          courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          courseDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructorName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || classItem.Status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Calculate statistics
  const stats = {
    total: Array.isArray(classes) ? classes.length : 0,
    active: Array.isArray(classes)
      ? classes.filter((c) => c.Status === "Đang hoạt động").length
      : 0,
    upcoming: Array.isArray(classes)
      ? classes.filter((c) => c.Status === "Sắp khai giảng").length
      : 0,
    completed: Array.isArray(classes)
      ? classes.filter((c) => c.Status === "Đã kết thúc").length
      : 0,
    paused: Array.isArray(classes)
      ? classes.filter((c) => c.Status === "Tạm dừng").length
      : 0,
  };

  return (
    <div className="class-management-page instructor-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">🏫 Quản lý Lớp Học</h1>
          <p className="page-subtitle">
            Tạo và quản lý các lớp học của bạn với khóa học
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleCreateClass} className="btn-add">
            <span className="btn-icon">➕</span>
            Tạo Lớp Học Mới
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card stat-total">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng lớp học</div>
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
        <div className="stat-card stat-paused">
          <div className="stat-icon">⏸️</div>
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
            placeholder="🔍 Tìm kiếm lớp học (tên lớp, khóa học, giảng viên)..."
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
        <InstructorClassForm
          classData={selectedClass}
          instructors={instructors}
          courses={courses}
          onSubmit={handleSubmitClassForm}
          onCancel={() => setShowClassForm(false)}
          currentInstructor={currentInstructor}
        />
      )}
    </div>
  );
};

export default ClassManagementPage;
