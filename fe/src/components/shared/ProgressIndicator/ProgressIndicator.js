import React from "react";
import "./ProgressIndicator.css";

const ProgressIndicator = ({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
}) => {
  const getStepStatus = (stepIndex) => {
    if (completedSteps.includes(stepIndex)) {
      return "completed";
    }
    if (stepIndex === currentStep) {
      return "current";
    }
    if (stepIndex < currentStep) {
      return "completed";
    }
    return "pending";
  };

  const getStepIcon = (stepIndex, status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "current":
        return "🔄";
      default:
        return `${stepIndex + 1}`;
    }
  };

  return (
    <div className="progress-indicator">
      <div className="progress-steps">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable =
            onStepClick && (status === "completed" || status === "current");

          return (
            <React.Fragment key={index}>
              <div
                className={`step ${status} ${isClickable ? "clickable" : ""}`}
                onClick={isClickable ? () => onStepClick(index) : undefined}
                title={step.description}
              >
                <div className="step-icon">{getStepIcon(index, status)}</div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  {step.description && (
                    <div className="step-description">{step.description}</div>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`step-connector ${
                    status === "completed" ? "completed" : ""
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;






