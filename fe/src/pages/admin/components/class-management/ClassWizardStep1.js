import React from "react";
const ClassWizardStep1 = ({
  formData,
  setFormData,
  errors,
  readonly,
  instructors,
  filteredInstructors,
  instructorSearchTerm,
  setInstructorSearchTerm,
  instructorDropdownOpen,
  setInstructorDropdownOpen,
  selectedInstructor,
  setSelectedInstructor,
  setInstructorType,
  setParttimeAvailableSlotKeys,
  setParttimeAvailableEntriesCount,
  setParttimeAvailabilityError,
  setBlockedDays,
  setSelectedTimeslotIds,
  setAlternativeStartDateSearch,
  availableCourses,
  filteredCourses,
  courseSearchTerm,
  setCourseSearchTerm,
  courseDropdownOpen,
  setCourseDropdownOpen,
  selectedCourse,
  setSelectedCourse,
  loadingInstructorData,
  lockBasicInfo = false, // Khi true: khóa Giảng viên & Khóa/Môn (chỉ cho đổi các phần khác)
}) => {
  return (
    <div className="wizard-step-content">
      <div className="form-group">
        <label htmlFor="Name">
          Tên lớp học <span className="required">*</span>
        </label>
        <input
          type="text"
          id="Name"
          value={formData.Name}
          onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
          placeholder="Nhập tên lớp học"
          className={errors.Name ? "error" : ""}
          disabled={readonly}
          readOnly={readonly}
        />
        {errors.Name && <span className="error-message">{errors.Name}</span>}
      </div>

      {/* Search Dropdown cho Giảng viên */}
      <div className="form-group">
        <label htmlFor="InstructorID">
          Giảng viên <span className="required">*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            id="InstructorID"
            value={
              instructorSearchTerm ||
              (selectedInstructor
                ? `${
                    selectedInstructor.FullName || selectedInstructor.fullName
                  } - ${selectedInstructor.Major || selectedInstructor.major}`
                : "")
            }
            onChange={(e) => {
              if (readonly || lockBasicInfo) return;
              setInstructorSearchTerm(e.target.value);
              setInstructorDropdownOpen(true);
              if (!e.target.value) {
                setFormData({ ...formData, InstructorID: null });
                setSelectedInstructor(null);
                setInstructorType(null);
                setParttimeAvailableSlotKeys([]);
                setParttimeAvailableEntriesCount(null);
                setParttimeAvailabilityError("");
              }
            }}
            onFocus={() => {
              if (!readonly && !lockBasicInfo) setInstructorDropdownOpen(true);
            }}
            onBlur={() => {
              // Delay để cho phép click vào dropdown item
              setTimeout(() => setInstructorDropdownOpen(false), 200);
            }}
            placeholder="Tìm kiếm giảng viên..."
            className={errors.InstructorID ? "error" : ""}
            disabled={readonly || lockBasicInfo}
            readOnly={readonly || lockBasicInfo}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          {instructorDropdownOpen && filteredInstructors.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                marginTop: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              {filteredInstructors.map((instructor) => (
                <div
                  key={instructor.InstructorID || instructor.id}
                  onClick={() => {
                    // Đảm bảo lấy đúng InstructorID, không phải AccID
                    const value = instructor.InstructorID;
                    const fallbackValue = instructor.id;
                    const finalValue =
                      value ||
                      (fallbackValue && fallbackValue !== instructor.AccID
                        ? fallbackValue
                        : null);

                    if (!finalValue) {
                      alert(
                        "Lỗi: Không tìm thấy InstructorID. Vui lòng thử lại."
                      );
                      return;
                    }

                    if (instructor.AccID && finalValue === instructor.AccID) {
                      alert(
                        "Lỗi: Đã chọn nhầm AccID thay vì InstructorID. Vui lòng thử lại."
                      );
                      return;
                    }

                    setFormData({
                      ...formData,
                      InstructorID: finalValue,
                      // Reset ca học và ngày học khi chọn lại giảng viên
                      scheduleDetail: {
                        ...formData.scheduleDetail,
                        DaysOfWeek: [],
                        TimeslotsByDay: {},
                      },
                    });
                    setSelectedInstructor(instructor);
                    setInstructorType(
                      instructor.Type || instructor.type || null
                    );
                    setParttimeAvailableSlotKeys([]);
                    setParttimeAvailableEntriesCount(null);
                    setParttimeAvailabilityError("");
                    setInstructorSearchTerm("");
                    setInstructorDropdownOpen(false);
                    setBlockedDays({});
                    // Reset selectedTimeslotIds khi chọn lại giảng viên
                    setSelectedTimeslotIds(new Set());
                    // Reset chế độ tìm kiếm
                    setAlternativeStartDateSearch({
                      loading: false,
                      suggestions: [],
                      error: null,
                      showResults: false,
                    });
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#fff";
                  }}
                >
                  {instructor.FullName || instructor.fullName} -{" "}
                  {instructor.Major || instructor.major}
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.InstructorID && (
          <span className="error-message">{errors.InstructorID}</span>
        )}
      </div>

      {/* Search Dropdown cho Khóa/Môn */}
      <div className="form-group">
        <label htmlFor="CourseID">
          Khóa/Môn <span className="required">*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            id="CourseID"
            value={
              courseSearchTerm ||
              (selectedCourse
                ? selectedCourse.Title || selectedCourse.title || ""
                : "")
            }
            onChange={(e) => {
              if (readonly || lockBasicInfo) return;
              setCourseSearchTerm(e.target.value);
              setCourseDropdownOpen(true);
              if (!e.target.value) {
                setFormData({ ...formData, CourseID: null });
                setSelectedCourse(null);
              }
            }}
            onFocus={() => {
              if (!readonly && !lockBasicInfo && formData.InstructorID) {
                setCourseDropdownOpen(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setCourseDropdownOpen(false), 200);
            }}
            placeholder={
              formData.InstructorID
                ? "Tìm kiếm khóa học..."
                : "Vui lòng chọn giảng viên trước"
            }
            disabled={readonly || lockBasicInfo || !formData.InstructorID}
            readOnly={readonly || lockBasicInfo}
            className={errors.CourseID ? "error" : ""}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: formData.InstructorID ? "#fff" : "#f8fafc",
              cursor: formData.InstructorID ? "text" : "not-allowed",
            }}
          />
          {courseDropdownOpen &&
            formData.InstructorID &&
            (filteredCourses.length > 0 || loadingInstructorData) && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  marginTop: "4px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                {loadingInstructorData ? (
                  <div
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    Đang tải khóa học...
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    Không có khóa học nào (PUBLISHED) cho giảng viên này
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <div
                      key={course.CourseID || course.id}
                      onClick={() => {
                        const value = course.CourseID || course.id;
                        setFormData({ ...formData, CourseID: value });
                        setSelectedCourse(course);
                        setCourseSearchTerm("");
                        setCourseDropdownOpen(false);
                      }}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#fff";
                      }}
                    >
                      {course.Title || course.title || course.CourseTitle}
                      {(course.Description || course.CourseDescription) && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginTop: "2px",
                          }}
                        >
                          {course.Description || course.CourseDescription}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
        </div>
        {errors.CourseID && (
          <span className="error-message">{errors.CourseID}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="Fee">
          Học phí (VND)
          <span className="optional">(Tùy chọn)</span>
        </label>
        <input
          type="number"
          id="Fee"
          value={formData.Fee}
          onChange={(e) => setFormData({ ...formData, Fee: e.target.value })}
          placeholder="Nhập học phí (để trống nếu miễn phí)"
          min="0"
          className={errors.Fee ? "error" : ""}
          disabled={readonly}
          readOnly={readonly}
        />
        {errors.Fee && <span className="error-message">{errors.Fee}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="Maxstudent">
          Sĩ số tối đa <span className="required">*</span>
        </label>
        <input
          type="number"
          id="Maxstudent"
          value={formData.Maxstudent}
          onChange={(e) =>
            setFormData({ ...formData, Maxstudent: e.target.value })
          }
          placeholder="Nhập sĩ số tối đa"
          min="1"
          className={errors.Maxstudent ? "error" : ""}
          disabled={readonly}
          readOnly={readonly}
        />
        {errors.Maxstudent && (
          <span className="error-message">{errors.Maxstudent}</span>
        )}
      </div>
    </div>
  );
};

export default ClassWizardStep1;
