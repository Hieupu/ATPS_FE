import React from "react";
import "./style/QuestionList.css";

export default function QuestionList({
  questions = [],
  onDelete = () => { },
  onEdit = () => { },
  loading = false,
}) {
  if (loading) return <div className="question-list-loading">Đang tải...</div>;
  if (!questions.length) return null;

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  function parseMatchingAnswer(ans) {
    try {
      if (!ans) return [];
      const obj = typeof ans === "string" ? JSON.parse(ans) : ans;
      if (!obj || typeof obj !== "object") return [];
      return Object.entries(obj).map(([left, right]) => ({
        left: String(left ?? ""),
        right: String(right ?? ""),
      }));
    } catch {
      // Nếu parse lỗi thì không hiển thị gì (tránh đổ JSON thô)
      return [];
    }
  }

  function mapTypeLabel(t) {
    switch ((t || "").toLowerCase()) {
      case "multiple_choice":
        return "Trắc nghiệm";
      case "true_false":
        return "Đúng/Sai";
      case "fill_in_blank":
        return "Điền vào chỗ trống";
      case "matching":
        return "Ghép cặp";
      default:
        return t;
    }
  }

  return (
    <div>
      <h3 className="question-list-title">Danh Sách Câu Hỏi ({questions.length})</h3>

      {questions.map((q, idx) => {
        const opts = Array.isArray(q.options) ? q.options : [];
        const type = (q.Type || q.type || "multiple_choice");
        const isMC = type === "multiple_choice";
        const isMatching = type === "matching";

        return (
          <div key={q.QuestionID || q.uid || idx} className="question-card">
            {/* Header */}
            <div className="question-card-head">
              <div className="question-card-head-left">
                <div className="question-index">Câu {idx + 1}:</div>
                <div className="question-type">
                  [{mapTypeLabel(type)}]
                </div>
              </div>

              <div className="question-card-head-right">
                <span className="point-badge">{q.Point ?? 1} điểm</span>
                <button
                  className="edit-btn"
                  onClick={() => onEdit(q, idx)}
                  title="Chỉnh sửa câu hỏi"
                >
                  Sửa
                </button>
                <button
                  className="del-btn"
                  onClick={() => onDelete(q.QuestionID || q.tempId || q.uid)}
                  title="Xóa câu hỏi"
                >
                  Xóa
                </button>
              </div>
            </div>

            {/* Nội dung câu hỏi */}
            {q.Content ? <div className="question-content">{q.Content}</div> : null}

            {/* Lựa chọn trắc nghiệm */}
            {isMC && !!opts.length && (
              <ul className="option-list">
                {opts.map((op, i) => {
                  const correct = !!(op.IsCorrect || op.isCorrect);
                  return (
                    <li key={op.uid || i} className="option-item">
                      <span className="option-letter">{letters[i] || ""}.</span>
                      <span className={correct ? "option-text-correct" : "option-text"}>
                        {op.Content || op.content || ""}
                      </span>
                      {correct && <span className="option-tick">✓</span>}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Đáp án cho các dạng khác */}
            {!isMC && (q.CorrectAnswer || q.correctAnswer) && (
              <>
                {/* Matching: Ghép cặp */}
                {isMatching ? (
                  <div className="matching-answer-box">
                    <span className="answer-label">Cặp ghép đúng:</span>
                    <div className="matching-list">
                      {parseMatchingAnswer(q.CorrectAnswer || q.correctAnswer).map(
                        (pair, i) => (
                          <div key={i} className="match-row">
                            <span className="match-left">{pair.left}</span>
                            <span className="match-arrow">↔</span>
                            <span className="match-right">{pair.right}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  // Đ/S + Điền chỗ trống hiển thị như cũ
                  <div className="answer-box">
                    <span className="answer-label">Đáp án: </span>
                    <span className="answer-value">
                      {String(q.CorrectAnswer ?? q.correctAnswer)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}