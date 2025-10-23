import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Tabs, Tab, Box } from "@mui/material";
import "./ClassForm.css";

const OptimizedClassForm = ({
  classData,
  instructors,
  courses,
  onSubmit,
  onCancel,
  userRole = "admin",
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    // Class Information (phù hợp với database schema)
    ClassID: "",
    ClassName: "", // BẮT BUỘC: Tên lớp học
    ZoomURL: "",
    Status: "Sắp khai giảng", // Mặc định là "Sắp khai giảng" vì phải gán instructor
    CourseID: "", // CHỈ INSTRUCTOR có thể thêm course
    InstructorID: "", // Admin gán instructor - BẮT BUỘC
    // StartDate/EndDate sẽ được tính từ session timeslots
  });

  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classData) {
      setFormData({
        ClassID: classData.ClassID || "",
        ClassName: classData.ClassName || "",
        ZoomURL: classData.ZoomURL || "",
        Status: classData.Status || "Sắp khai giảng",
        CourseID: classData.CourseID || "",
        InstructorID: classData.InstructorID || "",
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
    // Luôn đặt status là "Sắp khai giảng" khi có instructor
    const newStatus = newValue ? "Sắp khai giảng" : "Sắp khai giảng";
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

    // Class validation (chỉ validate các trường có trong database)
    if (!formData.ClassName.trim()) {
      newErrors.ClassName = "Tên lớp học là bắt buộc";
    }

    // CHỈ INSTRUCTOR mới validate CourseID
    if (userRole === "instructor" && !formData.CourseID) {
      newErrors.CourseID = "Vui lòng chọn khóa học (bắt buộc)";
    }

    // Admin BẮT BUỘC phải gán instructor
    if (!formData.InstructorID) {
      newErrors.InstructorID = "Vui lòng gán giảng viên cho lớp học";
    }

    // Status validation
    if (formData.Status === "Đang hoạt động" && !formData.InstructorID) {
      newErrors.Status =
        "Lớp học không thể đang hoạt động khi chưa có giảng viên";
    }

    // StartDate/EndDate sẽ được tính từ session timeslots nên không cần validate ở đây

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Loại bỏ ClassID khỏi request body khi update
      const submitData = {
        ClassName: formData.ClassName,
        Status: formData.Status,
        InstructorID: parseInt(formData.InstructorID),
      };

      // CHỈ INSTRUCTOR mới gửi CourseID
      if (userRole === "instructor" && formData.CourseID) {
        submitData.CourseID = parseInt(formData.CourseID);
      }

      // Chỉ gửi ZoomURL nếu có giá trị hợp lệ
      if (formData.ZoomURL && formData.ZoomURL.trim() !== "") {
        submitData.ZoomURL = formData.ZoomURL;
      }

      onSubmit(submitData);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="class-form-overlay">
      <div className="class-form-container optimized-form">
        <div className="form-header">
          <h2>{classData ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}</h2>
          <button className="close-btn" onClick={onCancel} title="Đóng">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="class-form">
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Thông tin lớp học" />
              <Tab label="Cài đặt nâng cao" />
            </Tabs>
          </Box>

          {/* Class Information Tab */}
          {activeTab === 0 && (
            <div className="form-section">
              <h3>Thông tin lớp học</h3>

              {/* Tên lớp học */}
              <div className="form-group">
                <label htmlFor="ClassName">
                  Tên lớp học <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="ClassName"
                  name="ClassName"
                  value={formData.ClassName}
                  onChange={handleChange}
                  className={errors.ClassName ? "error" : ""}
                  placeholder="Nhập tên lớp học (ví dụ: Lớp Lập trình Web 01)"
                  required
                />
                {errors.ClassName && (
                  <span className="error-message">{errors.ClassName}</span>
                )}
              </div>

              {/* CHỈ INSTRUCTOR mới hiển thị Course selection */}
              {userRole === "instructor" && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="CourseID">
                      Khóa học <span className="required">*</span>
                    </label>
                    <Autocomplete
                      id="CourseID"
                      options={courses}
                      getOptionLabel={(option) => option.Title}
                      value={selectedCourse}
                      onChange={handleCourseChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Tìm và chọn khóa học..."
                          error={!!errors.CourseID}
                          helperText={errors.CourseID}
                          size="small"
                        />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.CourseID === value.CourseID
                      }
                      noOptionsText="Không tìm thấy khóa học"
                    />
                  </div>
                </div>
              )}

              <div className="form-row">
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
                        placeholder="Tìm và chọn giảng viên..."
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
                    <strong>Ngày bắt đầu/kết thúc:</strong> Sẽ được tự động tính
                    từ ngày bắt đầu và kết thúc của các session mà giảng viên
                    tạo cho lớp học này.
                  </div>
                </div>
              </div>

              <div className="info-note">
                <strong>
                  Vai trò {userRole === "admin" ? "Admin" : "Instructor"}:
                </strong>
                {userRole === "admin" ? (
                  <>
                    Bạn đang tạo lớp học và gán cho giảng viên. Giảng viên sẽ tự
                    thêm khóa học và quản lý nội dung, tài liệu.
                  </>
                ) : (
                  <>
                    Bạn đang tạo lớp học và gán khóa học. Sau khi tạo lớp, bạn
                    có thể thêm sessions và materials.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Advanced Settings Tab */}
          {activeTab === 1 && (
            <div className="form-section">
              <h3>Cài đặt nâng cao</h3>

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
                    Link Zoom sẽ được sử dụng cho tất cả buổi học của lớp
                  </small>
                </div>
              </div>

              <div className="info-note auto-status-note">
                <strong>Trạng thái tự động:</strong>
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
                <strong>Quản lý Session:</strong>
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
                <strong>Thông tin học phí & Enrollment:</strong>
                <ul>
                  <li>Học phí được lấy từ khóa học (Course) được chọn</li>
                  <li>Học viên sẽ enroll trực tiếp vào lớp học</li>
                  <li>Thanh toán được thực hiện theo enrollment</li>
                  <li>Không có giới hạn sĩ số trong database</li>
                  {userRole === "admin" && (
                    <li>
                      Admin chỉ tạo lớp và gán instructor. Instructor sẽ thêm
                      khóa học sau.
                    </li>
                  )}
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
              <i className="fas fa-times"></i> Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-check"></i>{" "}
              {classData ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OptimizedClassForm;
