import { useState, useEffect, useMemo } from "react";

/**
 * Hook quản lý state của question
 */
export function useQuestionState(initialData) {
  const [question, setQuestion] = useState(() => makeDefault(initialData));
  const [error, setError] = useState("");

  // Sync dữ liệu khi initialData thay đổi (mở Sửa)
  useEffect(() => {
    setQuestion(makeDefault(initialData));
    setError("");
  }, [initialData]);

  return { question, setQuestion, error, setError };
}

/**
 * Hook quản lý options cho multiple choice
 */
export function useQuestionOptions(question, setQuestion) {
  const canAddMoreOptions = useMemo(
    () => (question.options || []).length < 5,
    [question.options]
  );

  const addOption = () => {
    if (!canAddMoreOptions) return;
    setQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), { Content: "", IsCorrect: false }],
    }));
  };

  const handleOptionChange = (idx, value) => {
    const next = [...(question.options || [])];
    next[idx] = { ...(next[idx] || {}), Content: value };
    setQuestion((prev) => ({ ...prev, options: next }));
  };

  const handleCorrectToggle = (idx) => {
    const next = (question.options || []).map((o, i) => ({
      ...o,
      IsCorrect: i === idx,
    }));
    setQuestion((prev) => ({ ...prev, options: next }));
  };

  const removeOption = (idx) => {
    const next = [...(question.options || [])];
    next.splice(idx, 1);
    setQuestion((prev) => ({ ...prev, options: next }));
  };

  return {
    canAddMoreOptions,
    addOption,
    handleOptionChange,
    handleCorrectToggle,
    removeOption,
  };
}

/**
 * Hook quản lý matching pairs
 */
export function useMatchingPairs(initialData) {
  const pairsInit =
    initialData?.Type === "matching"
      ? parsePairsFromJSON(initialData?.CorrectAnswer)
      : [{ id: crypto.randomUUID(), left: "", right: "" }];

  const [matchPairs, setMatchPairs] = useState(pairsInit);

  const addPair = () =>
    setMatchPairs((p) => [...p, { id: crypto.randomUUID(), left: "", right: "" }]);

  const removePair = (id) =>
    setMatchPairs((p) => (p.length > 1 ? p.filter((x) => x.id !== id) : p));

  const updatePair = (id, field, value) =>
    setMatchPairs((p) =>
      p.map((x) => (x.id === id ? { ...x, [field]: value } : x))
    );

  const resetPairs = () => {
    setMatchPairs([{ id: crypto.randomUUID(), left: "", right: "" }]);
  };

  return {
    matchPairs,
    setMatchPairs,
    addPair,
    removePair,
    updatePair,
    resetPairs,
  };
}

/**
 * Hook xử lý validation và submit
 */
export function useQuestionSubmit(
  question,
  matchPairs,
  setError,
  isEditing,
  onAdd,
  onUpdate
) {
  const validateQuestion = () => {
    // Validate nội dung
    if (!question.Content?.trim()) {
      setError("Vui lòng nhập nội dung câu hỏi.");
      return false;
    }

    // Validate multiple choice
    if (question.Type === "multiple_choice") {
      const filled = (question.options || []).filter((o) => o.Content?.trim());
      if (filled.length < 2) {
        setError("Trắc nghiệm cần ít nhất 2 lựa chọn.");
        return false;
      }
      const hasCorrect = (question.options || []).some((o) => o.IsCorrect);
      if (!hasCorrect) {
        setError("Vui lòng chọn một đáp án đúng.");
        return false;
      }
    }

    // Validate fill in blank
    if (question.Type === "fill_in_blank" && !question.CorrectAnswer?.trim()) {
      setError("Vui lòng nhập đáp án cho kiểu điền vào chỗ trống.");
      return false;
    }

    // Validate true/false
    if (question.Type === "true_false" && !["true", "false"].includes(String(question.CorrectAnswer))) {
      setError("Vui lòng chọn Đúng hoặc Sai.");
      return false;
    }

    // Validate matching
    if (question.Type === "matching") {
      const valid = matchPairs.filter(
        (p) => String(p.left).trim() !== "" && String(p.right).trim() !== ""
      );
      if (valid.length === 0) {
        setError("Vui lòng thêm ít nhất 1 cặp ghép hợp lệ.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateQuestion()) return;

    let tmp = { ...question };

    // Xử lý matching pairs
    if (tmp.Type === "matching") {
      const valid = matchPairs.filter(
        (p) => String(p.left).trim() !== "" && String(p.right).trim() !== ""
      );
      const obj = {};
      valid.forEach(({ left, right }) => {
        obj[String(left).trim()] = String(right).trim();
      });
      tmp.CorrectAnswer = JSON.stringify(obj);
    }

    setError("");
    const payload = normalize(tmp);

    if (isEditing && onUpdate) onUpdate(payload);
    else onAdd?.(payload);
  };

  return { handleSubmit };
}

// ==================== HELPER FUNCTIONS ====================

function makeDefault(data) {
  if (!data) {
    return {
      Content: "",
      Type: "multiple_choice",
      Point: 1,
      options: [
        { Content: "", IsCorrect: false },
        { Content: "", IsCorrect: false },
      ],
      CorrectAnswer: "",
    };
  }
  const t = (data.Type || data.type || "multiple_choice").toLowerCase();
  return {
    Content: data.Content || data.content || "",
    Type: t,
    Point: Number(data.Point ?? data.point ?? 1) || 1,
    options:
      t === "multiple_choice"
        ? (data.options || []).map((o) => ({
          Content: o.Content ?? o.content ?? "",
          IsCorrect: !!(o.IsCorrect ?? o.isCorrect),
        }))
        : [],
    CorrectAnswer:
      t === "multiple_choice"
        ? ""
        : data.CorrectAnswer ?? data.correctAnswer ?? "",
  };
}

function normalize(q) {
  const t = q.Type || "multiple_choice";
  return {
    Content: q.Content?.trim(),
    Type: t,
    Point: Number(q.Point) || 1,
    options:
      t === "multiple_choice"
        ? (q.options || []).map((o) => ({
          Content: o.Content?.trim(),
          IsCorrect: !!o.IsCorrect,
        }))
        : [],
    CorrectAnswer: t === "multiple_choice" ? null : q.CorrectAnswer ?? "",
  };
}

function parsePairsFromJSON(jsonStr) {
  try {
    if (!jsonStr) return [{ id: crypto.randomUUID(), left: "", right: "" }];
    const obj = JSON.parse(jsonStr);
    return Object.entries(obj).map(([l, r]) => ({
      id: crypto.randomUUID(),
      left: String(l ?? ""),
      right: String(r ?? ""),
    }));
  } catch {
    return [{ id: crypto.randomUUID(), left: "", right: "" }];
  }
}