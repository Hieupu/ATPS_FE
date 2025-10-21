import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Tabs, Tab, Box } from "@mui/material";
import "./ClassForm.css";

const AdminClassForm = ({
  classData,
  instructors,
  courses,
  onSubmit,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    // Class Information (Admin tạo)
    ClassID: "",
    ZoomURL: "",
    Status: "Chưa phân giảng viên",
    CourseID: "", // BẮT BUỘC: Liên kết với khóa học có sẵn
    InstructorID: "", // Admin gán instructor
    // StartDate/EndDate sẽ được tính từ session timeslots
  });

  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classData) {
      setFormData({
        ClassID: classData.ClassID || "",
        ZoomURL: classData.ZoomURL || "",
        Status: classData.Status || "Chưa phân giảng viên",
        CourseID: classData.CourseID || "",
        InstructorID: classData.InstructorID || "",
        // MaxStudents được quản lý trong frontend
        // StartDate/EndDate sẽ được tính từ session timeslots
      });

      // Set selected instructor
      if (classData.InstructorID) {
        const instructor = instructors.find(
          (i) => i.InstructorID === classData.InstructorID
        );
        if (instructor) {
          setSelectedInstructor(instructor);
        }
      }

      // Set selected course
      if (classData.CourseID) {
        const course = courses.find((c) => c.CourseID === classData.CourseID);
        if (course) {
          setSelectedCourse(course);
        }
      }
    }
  }, [classData, instructors, courses]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user inputs
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleInstructorChange = (event, newValue) => {
    setSelectedInstructor(newValue);
    const newStatus = newValue ? "Sắp khai giảng" : "Chưa phân giảng viên";
    setFormData((prev) => ({
      ...prev,
      InstructorID: newValue ? newValue.InstructorID : "",
      Status: newStatus,
    }));
  };

  const handleCourseChange = (event, newValue) => {
    setSelectedCourse(newValue);
    setFormData((prev) => ({
      ...prev,
      CourseID: newValue ? newValue.CourseID : "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Class validation
    if (!formData.CourseID) {
      newErrors.CourseID = "Vui lòng chọn khóa học (bắt buộc)";
    }

    if (!formData.InstructorID) {
      newErrors.InstructorID = "Vui lòng gán giảng viên cho lớp học";
    }

    // StartDate/EndDate sẽ được tính từ session timeslots nên không cần validate ở đây

    if (formData.Status === "Đang hoạt động" && !formData.InstructorID) {
      newErrors.Status =
        "Lớp học không thể đang hoạt động khi chưa có giảng viên";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="class-form-overlay">
      <div className="class-form-container admin-form">
        <div className="form-header">
          <h2>{classData ? "✏️ Chỉnh sửa lớp học" : "➕ Thêm lớp học mới"}</h2>
          <button className="close-btn" onClick={onCancel} title="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="class-form">
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="🏫 Thông tin lớp học" />
              <Tab label="📅 Cài đặt nâng cao" />
            </Tabs>
          </Box>

          {/* Class Information Tab */}
          {activeTab === 0 && (
            <div className="form-section">
              <h3>🏫 Thông tin lớp học (Admin tạo)</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="CourseID">
                    Khóa học <span className="required">*</span>
                  </label>
                  <Autocomplete
                    id="CourseID"
                    options={courses}
                    getOptionLabel={(option) =>
                      `${option.Title} - ${
                        option.InstructorID
                          ? instructors.find(
                              (i) => i.InstructorID === option.InstructorID
                            )?.FullName
                          : "Chưa có instructor"
                      }`
                    }
                    value={selectedCourse}
                    onChange={handleCourseChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Chọn khóa học..."
                        error={!!errors.CourseID}
                        helperText={errors.CourseID}
                        size="small"
                      />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.CourseID === value.CourseID
                    }
                    noOptionsText="Không có khóa học nào"
                    disabled={!!classData} // Không cho sửa khóa học khi edit
                  />
                  {errors.CourseID && (
                    <span className="error-message">{errors.CourseID}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="InstructorID">
                    Giảng viên <span className="required">*</span>
                  </label>
                  <Autocomplete
                    id="InstructorID"
                    options={instructors}
                    getOptionLabel={(option) =>
                      `${option.FullName} - ${option.Major}`
                    }
                    value={selectedInstructor}
                    onChange={handleInstructorChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Gán giảng viên cho lớp..."
                        error={!!errors.InstructorID}
                        helperText={errors.InstructorID}
                        size="small"
                      />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.InstructorID === value.InstructorID
                    }
                    noOptionsText="Không tìm thấy giảng viên"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Status">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    id="Status"
                    name="Status"
                    value={formData.Status}
                    onChange={handleChange}
                    className={errors.Status ? "error" : ""}
                  >
                    <option value="Chưa phân giảng viên">
                      Chưa phân giảng viên
                    </option>
                    <option value="Sắp khai giảng">Sắp khai giảng</option>
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Đã kết thúc">Đã kết thúc</option>
                    <option value="Tạm dừng">Tạm dừng</option>
                  </select>
                  {errors.Status && (
                    <span className="error-message">{errors.Status}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="info-note">
                    <strong>📅 Ngày bắt đầu/kết thúc:</strong> Sẽ được tự động
                    tính từ ngày bắt đầu và kết thúc của các session mà giảng
                    viên tạo cho lớp học này.
                  </div>
                </div>
              </div>

              <div className="info-note">
                <strong>👨‍💼 Vai trò Admin:</strong> Bạn đang tạo lớp học và gán
                cho giảng viên. Giảng viên sẽ tự quản lý nội dung khóa học và
                tài liệu.
              </div>
            </div>
          )}

          {/* Advanced Settings Tab */}
          {activeTab === 1 && (
            <div className="form-section">
              <h3>📅 Cài đặt nâng cao</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ZoomURL">
                    Zoom URL <span className="optional">(Tùy chọn)</span>
                  </label>
                  <input
                    type="url"
                    id="ZoomURL"
                    name="ZoomURL"
                    value={formData.ZoomURL}
                    onChange={handleChange}
                    placeholder="https://zoom.us/j/..."
                  />
                  <small className="form-hint">
                    💡 Link Zoom sẽ được sử dụng cho tất cả buổi học của lớp
                  </small>
                </div>
              </div>

              <div className="info-note auto-status-note">
                <strong>🔄 Trạng thái tự động:</strong>
                <ul>
                  <li>
                    Lớp "Sắp khai giảng" sẽ tự động chuyển thành "Đang hoạt
                    động" khi đến ngày bắt đầu session đầu tiên (nếu có giảng
                    viên)
                  </li>
                  <li>
                    Lớp "Đang hoạt động" sẽ tự động chuyển thành "Đã kết thúc"
                    khi qua ngày kết thúc session cuối cùng
                  </li>
                </ul>
              </div>

              <div className="info-note">
                <strong>📚 Quản lý Session:</strong>
                <ul>
                  <li>Giảng viên sẽ tạo các session cho lớp học này</li>
                  <li>Mỗi session có thể có nhiều timeslot (lịch học)</li>
                  <li>
                    Ngày bắt đầu/kết thúc của lớp sẽ được tính từ session
                    timeslots
                  </li>
                </ul>
              </div>

              <div className="info-note">
                <strong>💰 Thông tin học phí & Enrollment:</strong>
                <ul>
                  <li>Học phí được lấy từ khóa học (Course) được chọn</li>
                  <li>Học viên sẽ enroll trực tiếp vào lớp học</li>
                  <li>Thanh toán được thực hiện theo enrollment</li>
                  <li>Không có giới hạn sĩ số trong database</li>
                </ul>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              ❌ Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              ✅ {classData ? "Cập nhật" : "Tạo lớp học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminClassForm;
