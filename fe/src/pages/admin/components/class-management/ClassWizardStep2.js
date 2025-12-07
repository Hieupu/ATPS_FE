import React from "react";
import dayjs from "dayjs";

/**
 * ClassWizardStep2 - Component cho Step 2: Lịch học
 */
const ClassWizardStep2 = ({
  formData,
  setFormData,
  errors,
  readonly,
  instructorType,
  parttimeAvailabilityError,
  isEditMode,
  impactedSessionMessages,
}) => {
  return (
    <div className="wizard-step-content">
      <div className="schedule-section">
        <div className="form-group">
          <label htmlFor="OpendatePlan">
            Ngày dự kiến bắt đầu <span className="required">*</span>
          </label>
          <input
            type="date"
            id="OpendatePlan"
            value={
              formData.schedule.OpendatePlan
                ? formData.schedule.OpendatePlan
                : ""
            }
            min={dayjs().add(1, "day").format("YYYY-MM-DD")} // Mặc định: Ngày mai
            onChange={(e) => {
              const dateValue = e.target.value;
              setFormData((prev) => ({
                ...prev,
                schedule: {
                  ...prev.schedule,
                  OpendatePlan: dateValue,
                },
                scheduleDetail: {
                  ...prev.scheduleDetail,
                  OpendatePlan: dateValue,
                },
              }));
            }}
            className={errors.OpendatePlan ? "error" : ""}
            disabled={readonly}
            readOnly={readonly}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          {errors.OpendatePlan && (
            <span className="error-message">{errors.OpendatePlan}</span>
          )}
          <small
            style={{
              color: "#64748b",
              fontSize: "12px",
              marginTop: "4px",
              display: "block",
            }}
          >
            Mặc định: Ngày mai
          </small>
          {instructorType === "parttime" &&
            parttimeAvailabilityError && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  fontSize: "13px",
                }}
              >
                {parttimeAvailabilityError}
              </div>
            )}
          {isEditMode &&
            !readonly &&
            impactedSessionMessages.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#fff7ed",
                  border: "1px solid #fdba74",
                  color: "#9a3412",
                  fontSize: "13px",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Do thay đổi ngày bắt đầu dự kiến các ca sau sẽ phải
                  chọn lại:
                </div>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {impactedSessionMessages.map((msg, idx) => (
                    <li key={`impact-step2-${idx}`}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        <div className="form-group">
          <label htmlFor="Numofsession">
            Tổng số buổi học <span className="required">*</span>
          </label>
          <input
            type="number"
            id="Numofsession"
            value={formData.schedule.Numofsession}
            onChange={(e) =>
              setFormData({
                ...formData,
                schedule: {
                  ...formData.schedule,
                  Numofsession: e.target.value,
                },
              })
            }
            placeholder="Nhập số buổi học dự kiến"
            min="1"
            className={errors.Numofsession ? "error" : ""}
            disabled={readonly}
            readOnly={readonly}
          />
          {errors.Numofsession && (
            <span className="error-message">{errors.Numofsession}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassWizardStep2;

