import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import {
  CLASS_STATUS,
  normalizeStatus,
  isEndStatus,
} from "../../../../constants/classStatus";
import "./ClassForm.css";

const ClassForm = ({ classData, instructors, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    tuitionFee: "",
    status: "DRAFT",
    instructorId: "",
    instructorName: "",
    maxStudents: "",
    opendatePlan: "", // Thay thế startDate
    enddatePlan: "", // Mới
    numofsession: "", // Thay thế expectedSessions
    zoomID: "", // Mới
    zoompass: "", // Mới
  });

  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const [errors, setErrors] = useState({});

  // Kiểm tra xem class có phải đã kết thúc không (chỉ view)
  // Normalize status trước khi kiểm tra
  const normalizedStatus = classData
    ? normalizeStatus(classData.Status || classData.status)
    : null;

  // Chỉ CLOSE (Đã kết thúc) mới không được sửa
  // CANCEL (Đã hủy) vẫn được phép chỉnh sửa giống như ON_GOING
  const isClosed = normalizedStatus === CLASS_STATUS.CLOSE;
  const isOnGoing = normalizedStatus === CLASS_STATUS.ON_GOING;


  useEffect(() => {
    if (classData) {
      // Map dữ liệu theo dbver5 - chỉ dùng trường mới, không chấp nhận trường cũ
      const mappedData = {
        title: classData.Name || "",
        tuitionFee: classData.Fee || "",
        status: classData.Status || "DRAFT",
        instructorId: classData.InstructorID || "",
        instructorName: classData.Instructor?.FullName || "",
        maxStudents: classData.Maxstudent || "",
        opendatePlan: classData.OpendatePlan || "",
        enddatePlan: classData.EnddatePlan || "",
        numofsession: classData.Numofsession || "",
        zoomID: classData.ZoomID || "",
        zoompass: classData.Zoompass || "",
      };
      setFormData(mappedData);

      // Set selected instructor for Autocomplete
      const instructorId = classData.InstructorID;
      if (instructorId) {
        const instructor = instructors.find(
          (i) => i.InstructorID === instructorId
        );
        if (instructor) {
          setSelectedInstructor(instructor);
        }
      }
    } else {
      // Reset form khi không có classData (tạo mới)
      setFormData({
        title: "",
        tuitionFee: "",
        status: "DRAFT",
        instructorId: "",
        instructorName: "",
        maxStudents: "",
        opendatePlan: "",
        enddatePlan: "",
        numofsession: "",
        zoomID: "",
        zoompass: "",
      });
      setSelectedInstructor(null);
    }
  }, [classData, instructors]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
    setFormData((prev) => ({
      ...prev,
      instructorId: newValue ? newValue.InstructorID : "",
      instructorName: newValue ? newValue.FullName : "",
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

    // Học phí là optional, nhưng nếu có thì phải >= 0
    if (formData.tuitionFee && parseFloat(formData.tuitionFee) < 0) {
      newErrors.tuitionFee = "Học phí không thể nhỏ hơn 0";
    }

    if (!formData.maxStudents || formData.maxStudents <= 0) {
      newErrors.maxStudents = "Sĩ số tối đa phải lớn hơn 0";
    }

    if (!formData.opendatePlan) {
      newErrors.opendatePlan = "Vui lòng chọn ngày dự kiến bắt đầu";
    } else {
      // Kiểm tra ngày bắt đầu không được là ngày đã qua (trừ khi đang chỉnh sửa lớp cũ)
      const today = new Date();
      const startDate = new Date(formData.opendatePlan);
      today.setHours(0, 0, 0, 0); // Reset time để chỉ so sánh ngày
      startDate.setHours(0, 0, 0, 0);

      if (startDate < today && !classData) {
        newErrors.opendatePlan =
          "Không thể tạo lớp học với ngày bắt đầu đã qua";
      }
    }

    if (!formData.enddatePlan) {
      newErrors.enddatePlan = "Vui lòng chọn ngày dự kiến kết thúc";
    } else if (formData.opendatePlan && formData.enddatePlan) {
      const startDate = new Date(formData.opendatePlan);
      const endDate = new Date(formData.enddatePlan);
      if (endDate <= startDate) {
        newErrors.enddatePlan = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (!formData.numofsession || parseInt(formData.numofsession) <= 0) {
      newErrors.numofsession = "Tổng số buổi dự kiến phải lớn hơn 0";
    }

    if (!formData.zoomID || formData.zoomID.trim().length === 0) {
      newErrors.zoomID = "Vui lòng nhập Zoom ID";
    } else if (formData.zoomID.trim().length > 11) {
      newErrors.zoomID = "Zoom ID không được quá 11 ký tự";
    }

    if (!formData.zoompass || formData.zoompass.trim().length === 0) {
      newErrors.zoompass = "Vui lòng nhập mật khẩu Zoom";
    } else if (formData.zoompass.trim().length > 6) {
      newErrors.zoompass = "Mật khẩu Zoom không được quá 6 ký tự";
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
          <h2>{classData ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}</h2>
          <button className="close-btn" onClick={onCancel} title="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="class-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>

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
                  disabled={isClosed}
                  className={errors.title ? "error" : ""}
                />
                {errors.title && (
                  <span className="error-message">{errors.title}</span>
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
                    `${option.FullName || option.fullName || ""} - ${
                      option.Major || option.major || ""
                    }`
                  }
                  value={selectedInstructor}
                  onChange={handleInstructorChange}
                  disabled={isClosed}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Tìm và chọn giảng viên..."
                      error={!!errors.instructorId}
                      helperText={errors.instructorId}
                      size="small"
                      disabled={isClosed}
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.InstructorID === value?.InstructorID
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
                  value={normalizeStatus(formData.status) || formData.status}
                  onChange={handleChange}
                  disabled={isClosed}
                  className={errors.status ? "error" : ""}
                >
                  <option value={CLASS_STATUS.DRAFT}>Nháp</option>
                  <option value={CLASS_STATUS.WAITING}>Chờ giảng viên</option>
                  <option value={CLASS_STATUS.PENDING}>Chờ duyệt</option>
                  <option value={CLASS_STATUS.APPROVED}>Đã duyệt</option>
                  <option value={CLASS_STATUS.ACTIVE}>Đang tuyển sinh</option>
                  <option value={CLASS_STATUS.ON_GOING}>Đang diễn ra</option>
                  <option value={CLASS_STATUS.CLOSE}>Đã kết thúc</option>
                  <option value={CLASS_STATUS.CANCEL}>Đã hủy</option>
                </select>
                {errors.status && (
                  <span className="error-message">{errors.status}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tuitionFee">
                  Học phí (VNĐ)
                  <span className="optional">(Tùy chọn)</span>
                </label>
                <input
                  type="number"
                  id="tuitionFee"
                  name="tuitionFee"
                  value={formData.tuitionFee}
                  onChange={handleChange}
                  placeholder="Nhập học phí (để trống nếu miễn phí)"
                  min="0"
                  disabled={isClosed}
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
                  disabled={isClosed}
                  className={errors.maxStudents ? "error" : ""}
                />
                {errors.maxStudents && (
                  <span className="error-message">{errors.maxStudents}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="opendatePlan">
                  Ngày dự kiến bắt đầu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="opendatePlan"
                  name="opendatePlan"
                  value={formData.opendatePlan}
                  onChange={handleChange}
                  disabled={isClosed || isOnGoing}
                  className={errors.opendatePlan ? "error" : ""}
                />
                {errors.opendatePlan && (
                  <span className="error-message">{errors.opendatePlan}</span>
                )}
                <small
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Ngày dự kiến bắt đầu lớp học
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="enddatePlan">
                  Ngày dự kiến kết thúc <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="enddatePlan"
                  name="enddatePlan"
                  value={formData.enddatePlan}
                  onChange={handleChange}
                  min={formData.opendatePlan}
                  disabled={true}
                  readOnly={true}
                  className={errors.enddatePlan ? "error" : ""}
                />
                {errors.enddatePlan && (
                  <span className="error-message">{errors.enddatePlan}</span>
                )}
                <small
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Ngày dự kiến kết thúc lớp học
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numofsession">
                  Số buổi học <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="numofsession"
                  name="numofsession"
                  value={formData.numofsession}
                  onChange={handleChange}
                  placeholder="Nhập số buổi học dự kiến"
                  min="1"
                  disabled={isClosed}
                  className={errors.numofsession ? "error" : ""}
                />
                {errors.numofsession && (
                  <span className="error-message">{errors.numofsession}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zoomID">
                  Zoom ID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="zoomID"
                  name="zoomID"
                  value={formData.zoomID}
                  onChange={handleChange}
                  placeholder="12345678901"
                  maxLength="11"
                  disabled={isClosed}
                  className={errors.zoomID ? "error" : ""}
                />
                {errors.zoomID && (
                  <span className="error-message">{errors.zoomID}</span>
                )}
                <small
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  ID phòng Zoom (tối đa 11 ký tự)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="zoompass">
                  Mật khẩu Zoom <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="zoompass"
                  name="zoompass"
                  value={formData.zoompass}
                  onChange={handleChange}
                  placeholder="123456"
                  maxLength="6"
                  disabled={isClosed}
                  className={errors.zoompass ? "error" : ""}
                />
                {errors.zoompass && (
                  <span className="error-message">{errors.zoompass}</span>
                )}
                <small
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Mật khẩu phòng Zoom (tối đa 6 ký tự)
                </small>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              {isClosed ? "Đóng" : "Hủy"}
            </button>
            {!isClosed && (
              <button type="submit" className="btn btn-primary">
                {classData ? "Cập nhật" : "Tạo mới"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
