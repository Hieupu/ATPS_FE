import { useState, useCallback } from "react";

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "quiz",
  deadline: "",
  courseId: null,
  unitId: null,
  fileURL: "",
  mediaURL: "",
  maxDuration: null,
  showAnswersAfter: "after_submission",
  localQuestions: [],
};

export function useAssignmentForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formType, setFormType] = useState("");
  const [activeTab, setActiveTab] = useState("manual");

  // format kiểu dd/MM/yyyy -> yyyy-MM-dd (dùng cho trường hợp nhập tay cũ)
  const formatDate = useCallback((dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map((p) => p.trim());
    if (!d || !m || !y) return null;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // chuẩn hoá deadline gửi lên API (giữ cả giờ nếu có)
  const normalizeDeadlineForApi = useCallback(
    (raw) => {
      if (!raw) return null;

      // kiểu datetime-local: 2025-11-28T20:19
      if (typeof raw === "string" && raw.includes("T")) {
        return raw;
      }

      // kiểu dd/MM/yyyy
      if (typeof raw === "string" && raw.includes("/")) {
        const f = formatDate(raw); // yyyy-MM-dd
        return f || raw;
      }

      // fallback: trả nguyên
      return raw;
    },
    [formatDate]
  );

const preparePayload = useCallback(() => {
  const questions = (form.localQuestions || []).map((q) => ({
    QuestionID: q.QuestionID || q.questionId || undefined,
    questionId: q.QuestionID || q.questionId || undefined,
    
    content: q.Content?.trim(),
    type: q.Type,
    point: Number(q.Point) || 1,
    options: (q.options || [])
      .filter((opt) => opt.Content?.trim())
      .map((opt) => ({
        content: opt.Content.trim(),
        isCorrect: !!opt.IsCorrect,
      })),
    correctAnswer:
      q.Type === "matching" && typeof q.CorrectAnswer === "object"
        ? JSON.stringify(q.CorrectAnswer)
        : q.CorrectAnswer,
  }));

  const deadlineForApi = normalizeDeadlineForApi(form.deadline);

  // ✅ FIX: Giữ nguyên status hiện tại khi update, mặc định "active" khi tạo mới
  const isEditing = !!form.assignmentId;
  const statusValue = isEditing 
    ? (form.status || form.Status || "active")  // Giữ nguyên status cũ
    : "active";  // Tạo mới = active

  const payload = {
    Title: form.title.trim(),
    Description: form.description.trim(),
    Type: form.type,
    CourseID: form.courseId ? Number(form.courseId) : null,
    UnitID: form.unitId ? Number(form.unitId) : null,
    Deadline: deadlineForApi,
    FileURL: form.fileURL || null,
    MediaURL: form.mediaURL || null,
    MaxDuration: form.maxDuration ? Number(form.maxDuration) : null,
    ShowAnswersAfter: form.showAnswersAfter,
    Status: statusValue,  // ✅ Dùng statusValue động

    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    courseId: form.courseId ? Number(form.courseId) : null,
    unitId: form.unitId ? Number(form.unitId) : null,
    deadline: deadlineForApi,
    fileURL: form.fileURL || null,
    mediaURL: form.mediaURL || null,
    maxDuration: form.maxDuration ? Number(form.maxDuration) : null,
    showAnswersAfter: form.showAnswersAfter,
    status: statusValue,  // ✅ Dùng statusValue động
  };

  return {
    payload,
    questions,
    isQuiz: payload.Type === "quiz",
  };
}, [form, normalizeDeadlineForApi]);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setFormType("");
    setActiveTab("manual");
  }, []);

  const updateForm = useCallback((updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!form.title?.trim()) {
      errors.title = "Tiêu đề là bắt buộc";
    }

    if (!form.description?.trim()) {
      errors.description = "Mô tả là bắt buộc";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [form]);

  return {
    form,
    setForm,
    formType,
    setFormType,
    activeTab,
    setActiveTab,
    resetForm,
    updateForm,
    setField,
    validateForm,
    preparePayload,
    formatDate,
  };
}
