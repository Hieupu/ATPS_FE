import React, { useState, useEffect } from "react";
import "./CourseForm.css";

const CourseForm = ({ courseData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    Title: courseData?.Title || "",
    Description: courseData?.Description || "",
    Duration: courseData?.Duration || 60,
    TuitionFee: courseData?.TuitionFee || 0,
    Status: courseData?.Status || "Draft",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (courseData) {
      setFormData({
        Title: courseData.Title || "",
        Description: courseData.Description || "",
        Duration: courseData.Duration || 60,
        TuitionFee: parseFloat(courseData.TuitionFee) || 0,
        Status: courseData.Status || "Draft",
      });
    }
  }, [courseData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "Duration"
          ? parseInt(value) || 0
          : name === "TuitionFee"
          ? parseFloat(value) || 0
          : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.Title || formData.Title.trim().length < 3) {
      newErrors.Title = "Tên khóa học phải có ít nhất 3 ký tự";
    }

    if (!formData.Description || formData.Description.trim().length < 10) {
      newErrors.Description = "Mô tả phải có ít nhất 10 ký tự";
    }

    if (!formData.Duration || formData.Duration <= 0) {
      newErrors.Duration = "Thời lượng phải lớn hơn 0 giờ";
    }

    if (!formData.TuitionFee || formData.TuitionFee <= 0) {
      newErrors.TuitionFee = "Học phí phải lớn hơn 0 VND";
    }

    if (!formData.Status) {
      newErrors.Status = "Trạng thái là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      console.log("📖 CourseForm submitting data:", formData);
      onSubmit(formData);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="course-form-overlay">
      <div className="course-form-container">
        <div className="form-header">
          <h2>{courseData ? "Sửa Khóa Học" : "Tạo Khóa Học Mới"}</h2>
          <button className="close-btn" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label htmlFor="Title">
              Tên khóa học <span className="required">*</span>
            </label>
            <input
              type="text"
              id="Title"
              name="Title"
              value={formData.Title}
              onChange={handleChange}
              placeholder="Nhập tên khóa học"
              className={errors.Title ? "error" : ""}
              required
            />
            {errors.Title && (
              <span className="error-message">{errors.Title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="Description">
              Mô tả <span className="required">*</span>
            </label>
            <textarea
              id="Description"
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              placeholder="Nhập mô tả khóa học"
              rows="4"
              className={errors.Description ? "error" : ""}
              required
            />
            {errors.Description && (
              <span className="error-message">{errors.Description}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Duration">
                Thời lượng (giờ) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="Duration"
                name="Duration"
                value={formData.Duration}
                onChange={handleChange}
                min="1"
                max="1000"
                className={errors.Duration ? "error" : ""}
                required
              />
              {errors.Duration && (
                <span className="error-message">{errors.Duration}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="TuitionFee">
                Học phí (VND) <span className="required">*</span>
              </label>
              <div className="currency-input">
                <input
                  type="number"
                  id="TuitionFee"
                  name="TuitionFee"
                  value={formData.TuitionFee}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className={errors.TuitionFee ? "error" : ""}
                  required
                />
                <span className="currency-display">
                  {formData.TuitionFee > 0 &&
                    formatCurrency(formData.TuitionFee)}
                </span>
              </div>
              {errors.TuitionFee && (
                <span className="error-message">{errors.TuitionFee}</span>
              )}
            </div>
          </div>

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
              required
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
            {errors.Status && (
              <span className="error-message">{errors.Status}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {courseData ? "Cập nhật" : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;






