// ATPS_FE/fe/src/pages/instructor/components/assignment/WizardStepperBar.js
import React from "react";

export default function WizardStepperBar({
  steps,
  activeStep,
  onPrev,
  onNext,
  onSkip,
  nextLabel = "Next Step",
  finish = false,
  disabled = false,
  variant = "fixed",
  showActions = true,
  centered = false,
}) {
  if (!Array.isArray(steps) || steps.length === 0) return null;
  const containerStyle =
    variant === "inline"
      ? { ...styles.containerInline, justifyContent: centered ? "center" : "space-between" }
      : styles.containerFixed; const renderActions = showActions && variant !== "inline"; 

  return (
    <div style={containerStyle}>
      <div style={styles.steps}>
        {steps.map((s, idx) => {
          const n = idx + 1;
          const active = n === activeStep;
          const done = n < activeStep;
          return (
            <div key={s} style={styles.stepItem}>
              <div
                style={{
                  ...styles.circle,
                  ...(done ? styles.circleDone : {}),
                  ...(active ? styles.circleActive : {}),
                }}
              >
                {n}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: active ? "#111827" : "#6B7280" }}>
                {s}
              </div>
              {n < steps.length && <div style={styles.connector} />}
            </div>
          );
        })}
      </div>

      {renderActions && (
        <div style={styles.actions}>
          <button
            style={styles.secondaryBtn}
            onClick={onPrev}
            disabled={disabled || activeStep === 1}
          >
            Previous
          </button>
          {onSkip && (
            <button style={styles.secondaryBtn} onClick={onSkip} disabled={disabled}>
              Skip
            </button>
          )}
          <button style={styles.primaryBtn} onClick={onNext} disabled={disabled}>
            {finish ? "Finish" : nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}

const baseContainer = {
  padding: "10px 16px",
  background: "#FFFFFF",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const styles = {
  containerFixed: {
    ...baseContainer,
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1100,
    backdropFilter: "saturate(1.2) blur(2px)",
  },
  containerInline: {
    ...baseContainer,
    borderRadius: 12,
    marginBottom: 8,
    border: "1px solid #949494ff"
  },
  steps: { display: "flex", alignItems: "center", gap: 16, overflowX: "auto", padding: "6px 0" },
  stepItem: { display: "flex", alignItems: "center", position: "relative" },
  circle: {
    width: 28, height: 28, borderRadius: 999, border: "2px solid #D1D5DB",
    color: "#6B7280", background: "#FFF", display: "flex",
    alignItems: "center", justifyContent: "center", fontWeight: 600
  },
  circleActive: { borderColor: "#111827", color: "#111827" },
  circleDone: { background: "#111827", color: "#FFF", borderColor: "#111827" },
  connector: { width: 40, height: 2, background: "#E5E7EB", marginLeft: 12, marginRight: 12 },
  actions: { display: "flex", alignItems: "center", gap: 8 },
  primaryBtn: { background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer" },
  secondaryBtn: { background: "#F3F4F6", color: "#111", border: "1px solid #E5E7EB", padding: "8px 14px", borderRadius: 8, cursor: "pointer" },
};
