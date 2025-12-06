import React from "react";
import QuizForm from "./QuizForm";
import WizardStepperBar from "./WizardStepperBar";
import "./style/AssignmentFormDialog.css";

export default function AssignmentFormDialog({
  show,
  onClose,
  form,
  setField,
  courses,
  units,
  onCourseChange,
  onUploadFile,
  busy,
  wizardProps,
}) {
  if (!show) return null;

  const canGoPrev = !!wizardProps && wizardProps.activeStep > 1;

  return (
    <div className="afd-overlay">
      <div className="afd-modal">
        {wizardProps && (
          <div className="afd-stepper-container">
            <WizardStepperBar
              variant="inline"
              showActions={false}
              centered
              {...wizardProps}
            />
          </div>
        )}
        
        {/* Body */}
        <div className="afd-body">
          <div className="afd-form-card">
            <div className="afd-card-header">
              <h2>Nhập thông tin bài tập</h2>
            </div>
            <div className="afd-card-body">
              <QuizForm
                form={form}
                setField={setField}
                courses={courses}
                units={units}
                onCourseChange={onCourseChange}
                onUploadFile={onUploadFile}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="afd-footer">
          <button className="afd-secondary-btn" onClick={onClose}>
            Hủy
          </button>
          <div className="afd-footer-right">
            <button
              className="afd-primary-btn"
              onClick={wizardProps?.onNext}
              disabled={busy}
            >
              {wizardProps?.finish
                ? "Hoàn thành"
                : wizardProps?.nextLabel || "Tiếp theo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}