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
    ClassName: "", // BẮT BUỘC: Tên lớp học
    ZoomURL: "",
    Status: "Chưa phân giảng viên",
    CourseID: "", // Tùy chọn: Liên kết với khóa học có sẵn
    InstructorID: "", // Admin gán instructor
    // StartDate/EndDate sẽ được tính từ session timeslots
  });

  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classData && instructors && courses) {
      // Tìm instructorId và courseId trước
      const instructorId =
        classData.InstructorID || classData.Instructor?.InstructorID;
      const courseId = classData.CourseID || classData.Course?.CourseID;

      setFormData({
        ClassID: classData.ClassID || "",
        ClassName: classData.ClassName || "",
        ZoomURL: classData.ZoomURL || "",
        Status: classData.Status || "Chưa phân giảng viên",
        CourseID: courseId || "",
        InstructorID: instructorId || "",
        // StartDate/EndDate sẽ được tính từ session timeslots
      });

      // Set selected instructor
      if (instructorId && instructors.length > 0) {
        const instructor = instructors.find(
          (i) => i.InstructorID === instructorId
        );
        if (instructor) {
          setSelectedInstructor(instructor);
        } else {
          // Fallback: Tìm instructor theo tên nếu không tìm thấy bằng ID
          if (classData.Instructor?.FullName) {
            const instructorByName = instructors.find(
              (i) => i.FullName === classData.Instructor.FullName
            );
            if (instructorByName) {
              setSelectedInstructor(instructorByName);
            }
          }
        }
      } else if (classData.Instructor?.FullName && instructors.length > 0) {
        // Fallback: Tìm instructor theo tên nếu không có ID
        const instructor = instructors.find(
          (i) => i.FullName === classData.Instructor.FullName
        );
        if (instructor) {
          setSelectedInstructor(instructor);
        }
      } else if (classData.instructorName && instructors.length > 0) {
        // Fallback: Tìm instructor theo instructorName từ API
        const instructor = instructors.find(
          (i) => i.FullName === classData.instructorName
        );
        if (instructor) {
          setSelectedInstructor(instructor);
        }
      }

      // Set selected course
      if (courseId && courses.length > 0) {
        const course = courses.find((c) => c.CourseID === courseId);
        if (course) {
          setSelectedCourse(course);
        } else {
          // Fallback: Tìm course theo title nếu không tìm thấy bằng ID
          if (classData.Course?.Title) {
            const courseByTitle = courses.find(
              (c) => c.Title === classData.Course.Title
            );
            if (courseByTitle) {
              setSelectedCourse(courseByTitle);
            }
          }
        }
      } else if (classData.Course?.Title && courses.length > 0) {
        // Fallback: Tìm course theo title nếu không có ID
        const course = courses.find((c) => c.Title === classData.Course.Title);
        if (course) {
          setSelectedCourse(course);
        }
      } else if (classData.courseTitle && courses.length > 0) {
        // Fallback: Tìm course theo courseTitle từ API
        const course = courses.find((c) => c.Title === classData.courseTitle);
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
    if (!formData.ClassName.trim()) {
      newErrors.ClassName = "Tên lớp học là bắt buộc";
    }

    // CourseID tùy chọn cho admin
    // Admin có thể tạo lớp học mà không cần gán course ngay

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
      // Chỉ gửi CourseID khi có giá trị
      const submitData = {
        ClassName: formData.ClassName,
        Status: formData.Status,
        InstructorID: parseInt(formData.InstructorID),
      };

      // Chỉ thêm CourseID nếu có giá trị
      if (formData.CourseID) {
        submitData.CourseID = parseInt(formData.CourseID);
      }

      // Thêm ZoomURL nếu có
      if (formData.ZoomURL) {
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
      <div className="class-form-container admin-form">
        <div className="form-header">
          <h2>{classData ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}</h2>
          <button className="close-btn" onClick={onCancel} title="Đóng">
            ✕
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
              <h3>Thông tin lớp học (Admin tạo)</h3>

              <div className="form-row">
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
                    placeholder="Nhập tên lớp học"
                  />
                  {errors.ClassName && (
                    <span className="error-message">{errors.ClassName}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="CourseID">
                    Khóa học <span className="optional">(tùy chọn)</span>
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
              {classData ? "Cập nhật" : "Tạo lớp học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminClassForm;
