import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import "./ClassForm.css";

const ClassForm = ({ classData, instructors, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    duration: "",
    tuitionFee: "",
    status: "Chưa phân giảng viên",
    instructorId: "",
    instructorName: "",
    maxStudents: "",
    startDate: "",
    endDate: "",
  });

  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classData) {
      setFormData(classData);
      // Set selected instructor for Autocomplete
      if (classData.instructorId) {
        const instructor = instructors.find(
          (i) => i.id === classData.instructorId
        );
        if (instructor) {
          setSelectedInstructor(instructor);
        }
      }
    }
  }, [classData, instructors]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Xử lý logic đặc biệt khi thay đổi trạng thái
    if (name === "status") {
      // Nếu chọn "Đang hoạt động" mà chưa có giảng viên, tự động chuyển về "Sắp khai giảng"
      if (value === "Đang hoạt động" && !formData.instructorId) {
        setFormData((prev) => ({
          ...prev,
          [name]: "Sắp khai giảng", // Chuyển về trạng thái có thể chấp nhận
        }));
        // Hiển thị thông báo cho người dùng
        setTimeout(() => {
          alert(
            "⚠️ Lớp học cần có giảng viên để có thể đang hoạt động. Trạng thái đã được chuyển về 'Sắp khai giảng'."
          );
        }, 100);
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Xóa lỗi khi người dùng nhập lại
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
      instructorId: newValue ? newValue.id : "",
      instructorName: newValue ? newValue.fullName : "",
      status: newStatus,
    }));
    // Clear error when user selects
    if (newValue && errors.instructorId) {
      setErrors((prev) => ({
        ...prev,
        instructorId: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tên lớp học";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả";
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Thời lượng phải lớn hơn 0";
    }

    if (!formData.tuitionFee || formData.tuitionFee < 0) {
      newErrors.tuitionFee = "Học phí không hợp lệ";
    }

    // Không bắt buộc chọn giảng viên khi tạo lớp
    // Instructor sẽ được validate trong logic xử lý trạng thái

    if (!formData.maxStudents || formData.maxStudents <= 0) {
      newErrors.maxStudents = "Số lượng học viên phải lớn hơn 0";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    } else {
      // Kiểm tra ngày bắt đầu không được là ngày đã qua (trừ khi đang chỉnh sửa lớp cũ)
      const today = new Date();
      const startDate = new Date(formData.startDate);
      today.setHours(0, 0, 0, 0); // Reset time để chỉ so sánh ngày
      startDate.setHours(0, 0, 0, 0);

      if (startDate < today && !classData) {
        newErrors.startDate = "Không thể tạo lớp học với ngày bắt đầu đã qua";
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Validation cho trạng thái
    if (formData.status === "Đang hoạt động" && !formData.instructorId) {
      newErrors.status =
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

  return (
    <div className="class-form-overlay">
      <div className="class-form-container">
        <div className="form-header">
          <h2>{classData ? "✏️ Chỉnh sửa lớp học" : "➕ Thêm lớp học mới"}</h2>
          <button className="close-btn" onClick={onCancel} title="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="class-form">
          <div className="form-section">
            <h3>📚 Thông tin cơ bản</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">
                  Tên lớp học <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tên lớp học"
                  className={errors.title ? "error" : ""}
                />
                {errors.title && (
                  <span className="error-message">{errors.title}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">
                  Mô tả <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả về lớp học"
                  rows="3"
                  className={errors.description ? "error" : ""}
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="instructorId">
                  Giảng viên <span className="optional">(Tùy chọn)</span>
                </label>
                <Autocomplete
                  id="instructorId"
                  options={instructors}
                  getOptionLabel={(option) =>
                    `${option.fullName} - ${option.major}`
                  }
                  value={selectedInstructor}
                  onChange={handleInstructorChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Tìm và chọn giảng viên..."
                      error={!!errors.instructorId}
                      helperText={errors.instructorId}
                      size="small"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  noOptionsText="Không tìm thấy giảng viên"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Trạng thái <span className="required">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={errors.status ? "error" : ""}
                >
                  <option value="Chưa phân giảng viên">
                    Chưa phân giảng viên
                  </option>
                  <option value="Sắp khai giảng">Sắp khai giảng</option>
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Đã kết thúc">Đã kết thúc</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                </select>
                {errors.status && (
                  <span className="error-message">{errors.status}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">
                  Thời lượng (giờ) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Nhập thời lượng"
                  min="1"
                  className={errors.duration ? "error" : ""}
                />
                {errors.duration && (
                  <span className="error-message">{errors.duration}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="tuitionFee">
                  Học phí (VNĐ) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="tuitionFee"
                  name="tuitionFee"
                  value={formData.tuitionFee}
                  onChange={handleChange}
                  placeholder="Nhập học phí"
                  min="0"
                  className={errors.tuitionFee ? "error" : ""}
                />
                {errors.tuitionFee && (
                  <span className="error-message">{errors.tuitionFee}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="maxStudents">
                  Sĩ số tối đa <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="maxStudents"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleChange}
                  placeholder="Số học viên"
                  min="1"
                  className={errors.maxStudents ? "error" : ""}
                />
                {errors.maxStudents && (
                  <span className="error-message">{errors.maxStudents}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">
                  Ngày bắt đầu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? "error" : ""}
                />
                {errors.startDate && (
                  <span className="error-message">{errors.startDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  Ngày kết thúc <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? "error" : ""}
                />
                {errors.endDate && (
                  <span className="error-message">{errors.endDate}</span>
                )}
              </div>
            </div>

            <div className="info-note">
              <strong>📅 Lưu ý:</strong> Sau khi tạo/cập nhật lớp học, bạn có
              thể quản lý lịch học chi tiết từ danh sách lớp học.
            </div>

            <div className="info-note auto-status-note">
              <strong>🔄 Trạng thái tự động:</strong>
              <ul>
                <li>
                  Lớp "Sắp khai giảng" sẽ tự động chuyển thành "Đang hoạt động"
                  khi đến ngày bắt đầu (nếu có giảng viên)
                </li>
                <li>
                  Lớp "Đang hoạt động" sẽ tự động chuyển thành "Đã kết thúc" khi
                  qua ngày kết thúc
                </li>
                <li>Không thể tạo lớp học với ngày bắt đầu đã qua</li>
              </ul>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              ❌ Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              ✅ {classData ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
