import React from "react";
import { Plus, X } from "lucide-react";
import "./style/QuestionForm.css";
import {
  useQuestionState,
  useQuestionOptions,
  useMatchingPairs,
  useQuestionSubmit,
} from "../../hooks/useQuestionForm";

export default function QuestionForm({ 
  onAdd, 
  onUpdate, 
  initialData, 
  busy, 
  onCancel 
}) {
  const isEditing = !!initialData;

  // Custom hooks
  const { question, setQuestion, error, setError } = useQuestionState(initialData);
  const optionsHandlers = useQuestionOptions(question, setQuestion);
  const matchingHandlers = useMatchingPairs(initialData);
  const { handleSubmit } = useQuestionSubmit(
    question,
    matchingHandlers.matchPairs,
    setError,
    isEditing,
    onAdd,
    onUpdate
  );

  // Handler cho việc thay đổi loại câu hỏi
  const handleTypeChange = (type) => {
    setQuestion((p) => ({
      ...p,
      Type: type,
      options:
        type === "multiple_choice"
          ? p.options?.length >= 2
            ? p.options
            : [
              { Content: "", IsCorrect: false },
              { Content: "", IsCorrect: false },
            ]
          : [],
      CorrectAnswer:
        type === "true_false"
          ? p.CorrectAnswer ?? "true"
          : type === "fill_in_blank"
            ? p.CorrectAnswer ?? ""
            : "",
    }));

    // Reset matching pairs khi chuyển sang matching
    if (type === "matching") {
      matchingHandlers.resetPairs();
    }
  };

  return (
    <div className="qf-container">
      <h3 className="qf-title">
        {isEditing ? "Sửa Câu Hỏi" : "Thêm Câu Hỏi Mới"}
      </h3>

      {error && <div className="qf-error">{error}</div>}

      <div className="qf-form-group">
        <label className="qf-label">Nội dung câu hỏi *</label>
        <textarea
          className="qf-textarea"
          value={question.Content}
          onChange={(e) =>
            setQuestion((p) => ({ ...p, Content: e.target.value }))
          }
          placeholder="Nhập câu hỏi..."
        />
      </div>

      <div className="qf-form-row">
        <div className="qf-form-group" style={{ flex: 1 }}>
          <label className="qf-label">Loại câu hỏi</label>
          <select
            className="qf-select"
            value={question.Type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="multiple_choice">Trắc nghiệm</option>
            <option value="true_false">Đúng/Sai</option>
            <option value="fill_in_blank">Điền vào chỗ trống</option>
            <option value="matching">Ghép cặp</option>
          </select>
        </div>

        <div className="qf-form-group" style={{ width: 160 }}>
          <label className="qf-label">Điểm</label>
          <input
            type="number"
            min="1"
            className="qf-input"
            value={question.Point}
            onChange={(e) =>
              setQuestion((p) => ({
                ...p,
                Point: Math.max(1, Number(e.target.value) || 1),
              }))
            }
          />
        </div>
      </div>

      {/* Multiple Choice Section */}
      {question.Type === "multiple_choice" && (
        <MultipleChoiceSection
          question={question}
          handlers={optionsHandlers}
        />
      )}

      {/* True/False & Fill in Blank Section */}
      {(question.Type === "true_false" || question.Type === "fill_in_blank") && (
        <AnswerSection
          question={question}
          setQuestion={setQuestion}
        />
      )}

      {/* Matching Section */}
      {question.Type === "matching" && (
        <MatchingSection handlers={matchingHandlers} />
      )}

      <div className="qf-actions">
        {onCancel && (
          <button onClick={onCancel} className="qf-cancel-btn">
            Hủy
          </button>
        )}
        <button 
          onClick={handleSubmit} 
          className="qf-submit-btn" 
          disabled={busy}
        >
          {busy ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm Câu Hỏi"}
        </button>
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function MultipleChoiceSection({ question, handlers }) {
  const {
    canAddMoreOptions,
    addOption,
    handleOptionChange,
    handleCorrectToggle,
    removeOption,
  } = handlers;

  return (
    <div className="qf-options-section">
      <div className="qf-options-header">
        <label className="qf-label">Lựa chọn *</label>
        <button
          onClick={addOption}
          className="qf-add-option-btn"
          disabled={!canAddMoreOptions}
        >
          <Plus size={16} /> Thêm
        </button>
      </div>

      {(question.options || []).map((opt, idx) => (
        <div key={idx} className="qf-opt-row">
          <div className="qf-opt-left">
            <input
              type="radio"
              name="correct"
              checked={!!opt.IsCorrect}
              onChange={() => handleCorrectToggle(idx)}
              className="qf-radio"
            />
            <span className="qf-opt-index">
              {String.fromCharCode(65 + idx)}.
            </span>
          </div>
          <input
            type="text"
            placeholder={`Lựa chọn ${idx + 1}`}
            className="qf-opt-input"
            value={opt.Content}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
          />
          {(question.options || []).length > 2 && (
            <button onClick={() => removeOption(idx)} className="qf-icon-btn">
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function AnswerSection({ question, setQuestion }) {
  return (
    <div className="qf-form-group">
      <label className="qf-label">Đáp án đúng *</label>
      {question.Type === "true_false" ? (
        <div className="qf-true-false">
          <label className="qf-radio-label">
            <input
              type="radio"
              checked={String(question.CorrectAnswer) === "true"}
              onChange={() =>
                setQuestion((p) => ({ ...p, CorrectAnswer: "true" }))
              }
            />
            Đúng
          </label>
          <label className="qf-radio-label">
            <input
              type="radio"
              checked={String(question.CorrectAnswer) === "false"}
              onChange={() =>
                setQuestion((p) => ({ ...p, CorrectAnswer: "false" }))
              }
            />
            Sai
          </label>
        </div>
      ) : (
        <input
          type="text"
          className="qf-input"
          value={question.CorrectAnswer || ""}
          onChange={(e) =>
            setQuestion((p) => ({ ...p, CorrectAnswer: e.target.value }))
          }
          placeholder="Nhập đáp án..."
        />
      )}
    </div>
  );
}

function MatchingSection({ handlers }) {
  const { matchPairs, addPair, removePair, updatePair } = handlers;

  return (
    <div className="qf-matching-box">
      <div className="qf-matching-header">
        <span>Cặp ghép đúng</span>
        <button type="button" onClick={addPair} className="qf-add-pair-btn">
          + Thêm cặp
        </button>
      </div>

      {matchPairs.map((row, idx) => (
        <div key={row.id} className="qf-pair-row">
          <div className="qf-pair-index">
            {String.fromCharCode(65 + idx)}.
          </div>

          <input
            className="qf-pair-input"
            placeholder="Vế trái (ví dụ: cat)"
            value={row.left}
            onChange={(e) => updatePair(row.id, "left", e.target.value)}
          />

          <div className="qf-arrow">↔</div>

          <input
            className="qf-pair-input"
            placeholder="Vế phải (ví dụ: mèo)"
            value={row.right}
            onChange={(e) => updatePair(row.id, "right", e.target.value)}
          />

          <button
            type="button"
            onClick={() => removePair(row.id)}
            className="qf-remove-pair-btn"
            title="Xóa cặp"
            disabled={matchPairs.length === 1}
          >
            ✕
          </button>
        </div>
      ))}

      <p className="qf-hint">
        Hãy nhập các cặp tương ứng ở hai bên.
      </p>
    </div>
  );
}