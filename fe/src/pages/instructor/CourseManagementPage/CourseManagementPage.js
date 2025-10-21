import React, { useState, useEffect, useCallback } from "react";
import CourseForm from "../../../components/instructor/CourseManagement/CourseForm";
import courseService from "../../../apiServices/courseService";
import ProgressIndicator from "../../../components/shared/ProgressIndicator/ProgressIndicator";
import "./style.css";

const CourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
  });

  const workflowSteps = [
    {
      title: "Tạo Khóa Học",
      description: "Tạo và thiết lập thông tin khóa học",
    },
    {
      title: "Gán Cho Lớp",
      description: "Gán khóa học cho lớp học",
    },
    {
      title: "Tạo Sessions",
      description: "Tạo các buổi học cho lớp",
    },
    {
      title: "Upload Materials",
      description: "Tải lên tài liệu và bài học",
    },
  ];

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      console.log("📖 Loading courses with filters:", filters);
      const params = {};
      if (filters.status !== "all") params.status = filters.status;

      const result = await courseService.getCourses(params);
      const coursesData = result.data || [];

      console.log("📖 Loaded courses:", coursesData);
      setCourses(coursesData);
    } catch (error) {
      console.error("❌ Error loading courses:", error);
      alert("Không thể tải danh sách khóa học. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleSubmitCourse = async (courseData) => {
    try {
      console.log("📖 Submitting course:", courseData);

      let result;
      if (editingCourse) {
        // Update existing course
        result = await courseService.updateCourse(
          editingCourse.CourseID,
          courseData
        );
        console.log("✅ Course updated successfully:", result);
      } else {
        // Create new course
        result = await courseService.createCourse(courseData);
        console.log("✅ Course created successfully:", result);
      }

      // Handle new response format
      if (result.success !== false) {
        setShowForm(false);
        setEditingCourse(null);
        loadCourses();
        alert(
          editingCourse
            ? "Cập nhật khóa học thành công!"
            : "Tạo khóa học thành công!"
        );
      } else {
        alert(`❌ ${result.message || "Lưu khóa học thất bại!"}`);
        return;
      }
    } catch (error) {
      console.error("❌ Error saving course:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể lưu khóa học";
      alert(`❌ ${errorMessage}. Vui lòng thử lại!`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
      return;
    }

    try {
      console.log("📖 Deleting course:", courseId);
      await courseService.deleteCourse(courseId);
      console.log("✅ Course deleted successfully");
      loadCourses();
      alert("Xóa khóa học thành công!");
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa khóa học";
      alert(`❌ ${errorMessage}. Vui lòng thử lại!`);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "#28a745";
      case "Draft":
        return "#ffc107";
      case "Archived":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (filters.status === "all") return true;
    return course.Status === filters.status;
  });

  if (loading && courses.length === 0) {
    return (
      <div className="course-management-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-management-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📖 Quản lý Khóa Học</h1>
          <p>Tạo và quản lý các khóa học của bạn</p>
        </div>
        <div className="header-actions">
          <button onClick={handleCreateCourse} className="btn-primary">
            <span className="btn-icon">➕</span>
            Tạo Khóa Học Mới
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Workflow Progress */}
        <div className="workflow-section">
          <h3>Quy trình làm việc</h3>
          <ProgressIndicator
            steps={workflowSteps}
            currentStep={0}
            completedSteps={[]}
          />
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="status">Trạng thái:</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="filter-actions">
              <button
                onClick={() => setFilters({ status: "all" })}
                className="btn-clear"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="courses-section">
          <div className="section-header">
            <h3>Danh sách khóa học ({filteredCourses.length})</h3>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <h3>Chưa có khóa học nào</h3>
              <p>Hãy tạo khóa học đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <div key={course.CourseID} className="course-card">
                  <div className="course-header">
                    <div className="course-title">
                      <h4>{course.Title}</h4>
                      <span
                        className="course-status"
                        style={{
                          backgroundColor: getStatusColor(course.Status),
                        }}
                      >
                        {course.Status}
                      </span>
                    </div>
                    <div className="course-actions">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="btn-edit"
                        title="Sửa khóa học"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.CourseID)}
                        className="btn-delete"
                        title="Xóa khóa học"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="course-description">
                    <p>{course.Description}</p>
                  </div>

                  <div className="course-details">
                    <div className="detail-row">
                      <span className="detail-label">⏱️ Thời lượng:</span>
                      <span className="detail-value">
                        {course.Duration} giờ
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">💰 Học phí:</span>
                      <span className="detail-value">
                        {formatCurrency(parseFloat(course.TuitionFee))}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📄 Tài liệu:</span>
                      <span className="detail-value">
                        {course.MaterialCount || 0} files
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📚 Units:</span>
                      <span className="detail-value">
                        {course.UnitCount || 0} units
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <CourseForm
          courseData={editingCourse}
          onSubmit={handleSubmitCourse}
          onCancel={() => {
            setShowForm(false);
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default CourseManagementPage;
