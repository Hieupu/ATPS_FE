import React from "react";
import WizardStepperBar from "./WizardStepperBar";
import "./style/AssignmentPreviewDialog.css";

export default function AssignmentPreviewDialog({
  show,
  onClose,
  form,
  questions = [],
  onConfirm,
  busy,
  wizardProps,
  courses = [],
  units = [],
  viewMode = false,
}) {
  if (!show) return null;

  const prettyDate = (d) => {
    if (!d) return "—";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      const pad = (n) => (n < 10 ? "0" + n : n);
      const day = pad(dt.getDate());
      const month = pad(dt.getMonth() + 1);
      const year = dt.getFullYear();
      const hour = pad(dt.getHours());
      const minute = pad(dt.getMinutes());
      return `${hour}:${minute} ${day}/${month}/${year}`;
    } catch {
      return d;
    }
  };

  // 👉 mapping showAnswersAfter -> label tiếng Việt
  const showAnswersLabel = (val) => {
    switch (val) {
      case "after_submission":
        return "Sau khi nộp";
      case "after_deadline":
        return "Sau deadline";
      case "never":
        return "Không hiển thị";
      default:
        return "—";
    }
  };

  const canGoPrev = !!wizardProps && wizardProps.activeStep > 1;

  const handlePrev = () => {
    if (wizardProps?.onPrev) wizardProps.onPrev();
  };

  const handleFinish = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (wizardProps?.onNext) {
      wizardProps.onNext();
    }
  };

  const courseLabel = (() => {
    if (form.courseTitle || form.courseName) {
      return form.courseTitle || form.courseName;
    }
    if (form.courseId) {
      const found = courses.find(
        (c) =>
          (c.CourseID || c.courseId || c.value) === Number(form.courseId)
      );
      return (
        found?.Title ||
        found?.title ||
        found?.label ||
        `Course ${form.courseId}`
      );
    }
    return "—";
  })();

  const unitLabel = (() => {
    if (form.unitTitle || form.unitName) {
      return form.unitTitle || form.unitName;
    }
    if (form.unitId) {
      const found = units.find(
        (u) => (u.UnitID || u.unitId || u.value) === Number(form.unitId)
      );
      return (
        found?.Title ||
        found?.title ||
        found?.label ||
        `Unit ${form.unitId}`
      );
    }
    return "—";
  })();

  function labelType(x = "") {
    const t = String(x).toLowerCase();
    if (t === "multiple_choice") return "Trắc nghiệm";
    if (t === "true_false") return "Đúng/Sai";
    if (t === "fill_in_blank") return "Điền chỗ trống";
    if (t === "matching") return "Ghép cặp";
    if (t === "essay") return "Tự luận";
    if (t === "speaking") return "Nói";
    return t || "—";
  }

  function renderAnswer(q, t) {
    const raw = q.CorrectAnswer ?? q.correctAnswer;
    if (!raw) return null;
    if (t === "matching") {
      let obj = null;
      if (typeof raw === "string") {
        try {
          obj = JSON.parse(raw);
        } catch {
          return (
            <div className="apd-answer-box">
              <span className="apd-answer-label">Đáp án:</span>
              <span className="apd-answer-value">{raw}</span>
            </div>
          );
        }
      } else if (typeof raw === "object" && raw !== null) {
        obj = raw;
      }
      if (!obj || Object.keys(obj).length === 0) return null;
      return (
        <div className="apd-answer-box">
          <span className="apd-answer-label">Đáp án:</span>
          <ul className="apd-matching-list">
            {Object.entries(obj).map(([left, right], idx) => (
              <li key={idx} className="apd-matching-item">
                <span className="apd-matching-left">{left}</span>
                <span className="apd-matching-arrow">↔</span>
                <span className="apd-matching-right">{right}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <div className="apd-answer-box">
        <span className="apd-answer-label">Đáp án:</span>
        <span className="apd-answer-value">{String(raw)}</span>
      </div>
    );
  }

  return (
    <div className="apd-overlay">
      <div className="apd-modal">
        {wizardProps && (
          <div className="apd-stepper-container">
            <WizardStepperBar
              variant="inline"
              showActions={false}
              centered
              {...wizardProps}
            />
          </div>
        )}

        <div className="apd-card">
          <div className="apd-header">
            <h2>Tổng quan bài tập</h2>
            <p className="apd-subtitle">
              Kiểm tra lại toàn bộ thông tin và câu hỏi trước khi xác nhận.
            </p>
          </div>

          <div className="apd-body">
            <aside className="apd-left-column">
              <h3 className="apd-sidebar-title">Thông tin bài tập</h3>

              <div className="apd-sidebar-section">
                <div className="apd-sidebar-label">Tên bài tập</div>
                <div className="apd-sidebar-value">{form.title || "—"}</div>
              </div>

              <div className="apd-sidebar-section">
                <div className="apd-sidebar-label">Mô tả</div>
                <div className="apd-sidebar-value">
                  {form.description || "—"}
                </div>
              </div>

              <div className="apd-sidebar-section">
                <div className="apd-sidebar-label">Khóa học</div>
                <div className="apd-sidebar-value">{courseLabel}</div>
              </div>

              <div className="apd-sidebar-section">
                <div className="apd-sidebar-label">Chương học</div>
                <div className="apd-sidebar-value">{unitLabel}</div>
              </div>

              <div className="apd-sidebar-section">
                <div className="apd-sidebar-label">Hạn nộp</div>
                <div className="apd-sidebar-value">
                  {form.deadline ? prettyDate(form.deadline) : "—"}
                </div>
              </div>

              <div className="apd-sidebar-section">
                <div className="apd-sidebar-label">Loại bài tập</div>
                <div className="apd-sidebar-value">
                  {(form.type && form.type.toUpperCase()) || "TRẮC NGHIỆM"}
                </div>
              </div>

              {/* 👉 THÊM PHẦN HIỂN THỊ ĐÁP ÁN SAU */}
              <div className="apd-sidebar-section">
                <div className="apd-sidebar-label">Hiển thị đáp án sau</div>
                <div className="apd-sidebar-value">
                  {showAnswersLabel(form?.showAnswersAfter)}
                </div>
              </div>

              {form.maxDuration && (
                <div className="apd-sidebar-section">
                  <div className="apd-sidebar-label">Thời lượng</div>
                  <div className="apd-sidebar-value">
                    {form.maxDuration} phút
                  </div>
                </div>
              )}

              {form.fileURL && (
                <div className="apd-sidebar-section">
                  <div className="apd-sidebar-label">File đính kèm</div>
                  <div className="apd-sidebar-value">{form.fileURL}</div>
                </div>
              )}

              {form.mediaURL && (
                <div className="apd-sidebar-section">
                  <div className="apd-sidebar-label">Media</div>
                  <div className="apd-sidebar-value">{form.mediaURL}</div>
                </div>
              )}
            </aside>

            <section className="apd-right-column">
              <div className="apd-question-header">
                <h3 className="apd-question-title">Câu hỏi</h3>
                <span className="apd-question-count">
                  {questions.length} câu hỏi
                </span>
              </div>
              {questions.length === 0 ? (
                <div className="apd-empty">Chưa có câu hỏi.</div>
              ) : (
                <div className="apd-q-list-box">
                  {questions.map((q, idx) => {
                    const t = (q.Type || q.type || "").toLowerCase();
                    const point = q.Point ?? q.point ?? 1;

                    return (
                      <div key={idx} className="apd-q-card">
                        <div className="apd-q-header">
                          <div className="apd-q-header-left">
                            <span className="apd-q-number">
                              Câu {idx + 1}
                            </span>
                            <span className="apd-q-type">
                              {labelType(t)}
                            </span>
                            <span className="apd-q-point">
                              {point} điểm
                            </span>
                          </div>
                        </div>
                        <div className="apd-q-content">
                          {q.Content || q.content || "—"}
                        </div>
                        {t === "multiple_choice" &&
                          Array.isArray(q.options) &&
                          q.options.length > 0 && (
                            <ul className="apd-opt-list">
                              {q.options.map((o, i) => {
                                const correct = o.IsCorrect || o.isCorrect;
                                return (
                                  <li
                                    key={i}
                                    className={
                                      correct
                                        ? "apd-opt-item-correct"
                                        : "apd-opt-item"
                                    }
                                  >
                                    <span className="apd-opt-icon">
                                      {correct ? "✓" : "○"}
                                    </span>
                                    <span className="apd-opt-text">
                                      {o.Content || o.content}
                                    </span>
                                    {correct && (
                                      <span className="apd-opt-correct-label">
                                        Đáp án đúng
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        {t !== "multiple_choice" && renderAnswer(q, t)}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {viewMode ? (
          // chế độ chỉ xem chi tiết
          <div className="apd-footer">
            <button className="apd-secondary-btn" onClick={onClose}>
              Đóng
            </button>
          </div>
        ) : (
          // chế độ wizard tạo bài tập (giữ nguyên)
          <div className="apd-footer">
            <button className="apd-secondary-btn" onClick={onClose}>
              Hủy
            </button>
            <div className="apd-footer-right">
              <button
                className="apd-secondary-btn"
                onClick={handlePrev}
                disabled={!canGoPrev || busy}
              >
                Quay lại
              </button>
              <button
                className="apd-primary-btn"
                onClick={handleFinish}
                disabled={busy}
              >
                {busy ? "Đang tạo..." : "Xác nhận hoàn thành"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
