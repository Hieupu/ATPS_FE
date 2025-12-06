import { useEffect, useCallback, useState } from "react";
import { useAssignmentData } from "./useAssignmentData";
import { useAssignmentFilter } from "./useAssignmentFilter";
import { useAssignmentForm } from "./useAssignmentForm";
import { useAssignmentModals } from "./useAssignmentModals";
import {
  createAssignmentApi,
  updateAssignmentApi,
  getAssignmentByIdApi,
  getAssignmentQuestionsApi,
  parseAssignmentFromApi,
} from "../../../apiServices/assignmentService";

export default function useAssignment() {
  const dataHook = useAssignmentData();
  const filterHook = useAssignmentFilter(dataHook.assignments);
  const formHook = useAssignmentForm();
  const modalHook = useAssignmentModals();

  const [step, setStep] = useState(1);

  useEffect(() => {
    dataHook.loadAssignments();
  }, [dataHook.loadAssignments]);

  // ====== OPEN FLOW (TẠO MỚI) ======
  const openCreateNew = useCallback(async () => {
    formHook.resetForm();
    await dataHook.loadCourses();
    setStep(1);
    modalHook.openTypeModal();
  }, [formHook, dataHook, modalHook]);

  // Chọn loại bài tập (quiz/audio/video/document)
  const handleSelectType = useCallback(
    (type) => {
      formHook.setFormType(type);
      formHook.setField("type", type);
      modalHook.closeTypeModal();
      modalHook.openCreateForm();
    },
    [formHook, modalHook]
  );

  const onCourseChange = useCallback(
    async (courseId) => {
      const cid = courseId ? Number(courseId) : null;
      formHook.setField("courseId", cid);
      formHook.setField("unitId", null);
      await dataHook.loadUnitsByCourse(cid);
    },
    [formHook, dataHook]
  );

  // ====== OPEN FLOW (CHỈNH SỬA) ======
  const openEdit = useCallback(
    async (assignmentId) => {
      if (!assignmentId) return;
      try {
        dataHook.setError("");
        await dataHook.loadCourses();

        // 1. Lấy chi tiết bài tập
        const detailRes = await getAssignmentByIdApi(assignmentId);
        const detail = detailRes.assignment || detailRes;
        const parsed = parseAssignmentFromApi(detail);

        // 2. Lấy danh sách câu hỏi
        let qs = [];
        try {
          const qRes = await getAssignmentQuestionsApi(assignmentId);
          qs = qRes.questions || qRes || [];
        } catch (e) {
          console.error("Load assignment questions error: ", e);
        }

        // Convert deadline từ API -> value cho input datetime-local
        const toInputDateTime = (d) => {
          if (!d) return "";
          try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return d;
            const pad = (n) => (n < 10 ? "0" + n : n);
            const date = `${dt.getFullYear()}-${pad(
              dt.getMonth() + 1
            )}-${pad(dt.getDate())}`;
            const time = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
            return `${date}T${time}`;
          } catch {
            return d;
          }
        };

        // Chuẩn hóa questions về format của QuestionBuilder
        const normalizedQuestions = (qs || []).map((q) => {
          const t = (q.Type || q.type || "multiple_choice").toLowerCase();
          let correctAnswer = q.CorrectAnswer ?? q.correctAnswer ?? null;

          if (t === "matching" && typeof correctAnswer === "string") {
            try {
              correctAnswer = JSON.parse(correctAnswer);
            } catch {
              // nếu parse lỗi thì giữ nguyên string
            }
          }

          return {
            QuestionID: q.QuestionID || q.questionId, // ✅ GIỮ QuestionID để phân biệt câu cũ/mới
            Content: q.Content || q.content || "",
            Type: t,
            Point: q.Point ?? q.point ?? 1,
            options: (q.Options || q.options || []).map((o) => ({
              Content: o.Content || o.content || "",
              IsCorrect: o.IsCorrect ?? o.isCorrect ?? false,
            })),
            CorrectAnswer: correctAnswer,
          };
        });

        // 3. Fill vào form
        formHook.resetForm();
        formHook.setFormType(parsed.type);

        formHook.updateForm({
          assignmentId: parsed.assignmentId,
          title: parsed.title || "",
          description: parsed.description || "",
          type: parsed.type || "quiz",
          courseId: parsed.courseId || null,
          unitId: parsed.unitId || null,
          deadline: toInputDateTime(parsed.deadline),
          fileURL: parsed.fileURL || "",
          mediaURL: parsed.mediaURL || "",
          maxDuration: parsed.maxDuration || null,
          showAnswersAfter: parsed.showAnswersAfter || "after_submission",
          localQuestions: normalizedQuestions, // ✅ Câu hỏi cũ có QuestionID
          courseTitle: parsed.courseTitle,
          unitTitle: parsed.unitTitle,
        });

        if (parsed.courseId) {
          await dataHook.loadUnitsByCourse(parsed.courseId);
        }

        setStep(1);
        modalHook.openCreateForm();
      } catch (err) {
        console.error("Open edit error:", err);
        dataHook.setError(
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải dữ liệu bài tập để chỉnh sửa"
        );
      }
    },
    [dataHook, formHook, modalHook]
  );

  // ====== STEP 1 -> STEP 2 (không gọi API) ======
  const goFormNext = useCallback(() => {
    const { isValid, errors } =
      formHook.validateForm?.() ?? { isValid: true, errors: {} };
    if (!isValid) {
      dataHook.setError(
        Object.values(errors)[0] || "Vui lòng điền đầy đủ thông tin."
      );
      return;
    }
    setStep(2);
    dataHook.setSuccess("Đã lưu thông tin tạm thời");
  }, [formHook, dataHook]);

  // STEP 2 -> PREVIEW  ======
  const proceedToPreview = useCallback(
    (questions) => {
      try {
        const normalized = (questions || [])
          .map((q) => {
            const t = (q.Type || q.type || "multiple_choice").toLowerCase();
            return {
              Content: (q.Content || q.content || "").trim(),
              Type: t,
              Point: Number(q.Point ?? q.point ?? 1) || 1,
              options: Array.isArray(q.options)
                ? q.options.map((o) => ({
                  Content: (o.Content || o.content || "").trim(),
                  IsCorrect: !!(o.IsCorrect ?? o.isCorrect),
                }))
                : [],
              CorrectAnswer: q.CorrectAnswer ?? q.correctAnswer ?? null,
            };
          })
          .filter((q) => q.Content);
        formHook.setField("localQuestions", normalized);
        setStep(3);
      } catch {
        dataHook.setError("Lỗi dữ liệu câu hỏi");
      }
    },
    [formHook, dataHook]
  );

  // STEP 3 -> GỌI API (TẠO MỚI / CẬP NHẬT)
  const finalizeAndFinish = useCallback(async () => {
    try {
      const { payload, questions, isQuiz } = formHook.preparePayload();
      const currentType = (formHook.form?.type || "").toLowerCase();
      const requiresQuestions = ['quiz', 'video', 'document'].includes(currentType);

      if (requiresQuestions && (!questions || questions.length === 0)) {
        dataHook.setError("Vui lòng thêm ít nhất 1 câu hỏi");
        return;
      }

      const assignmentId = formHook.form?.assignmentId;

      // ✅ PHÂN BIỆT: Tạo mới vs Update
      if (assignmentId) {
        // UPDATE: Chỉ gửi câu hỏi MỚI (không có QuestionID)
        const newQuestions = questions.filter(q =>
          !q.QuestionID && !q.questionId
        );

        const body = {
          ...payload,
          questions: newQuestions,  // ← CHỈ GỬI CÂU MỚI
        };

        await updateAssignmentApi(assignmentId, body);
        dataHook.setSuccess("Cập nhật bài tập thành công!");
      } else {
        // CREATE: Gửi tất cả câu hỏi
        const body = {
          ...payload,
          questions: questions,
        };

        await createAssignmentApi(body);
        dataHook.setSuccess("Tạo bài tập thành công!");
      }

      await dataHook.loadAssignments();
      formHook.resetForm();
      setStep(1);
      modalHook.closeCreateForm();
    } catch (err) {
      console.error("Finalize error: ", err);
      dataHook.setError(
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi tạo/cập nhật bài tập"
      );
    }
  }, [formHook, dataHook, modalHook]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await dataHook.deleteAssignment(id);
        dataHook.setSuccess("Xóa thành công!");
      } catch (err) {
        dataHook.setError(err?.response?.data?.message || "Lỗi xóa");
      }
    },
    [dataHook]
  );


  return {
    // data
    assignments: dataHook.assignments,
    courses: dataHook.courses,
    units: dataHook.units,
    loading: dataHook.loading,
    busy: dataHook.busy,
    error: dataHook.error,
    success: dataHook.success,
    setError: dataHook.setError,
    setSuccess: dataHook.setSuccess,
    loadAssignments: dataHook.loadAssignments,
    uploadFile: dataHook.uploadFile,

    // filter
    filtered: filterHook.filtered,
    searchQuery: filterHook.searchQuery,
    setSearchQuery: filterHook.setSearchQuery,
    filters: filterHook.filters,
    setFilters: filterHook.setFilters,
    stats: filterHook.stats,

    // form
    form: formHook.form,
    setField: formHook.setField,
    formType: formHook.formType,
    activeTab: formHook.activeTab,
    setActiveTab: formHook.setActiveTab,
    formatDate: formHook.formatDate,
    onCourseChange,

    // modals
    showTypeModal: modalHook.showTypeModal,
    openTypeModal: modalHook.openTypeModal,
    closeTypeModal: modalHook.closeTypeModal,
    showCreateForm: modalHook.showCreateForm,
    openCreateForm: modalHook.openCreateForm,
    closeCreateForm: modalHook.closeCreateForm,

    // actions
    openCreateNew,
    handleSelectType,
    openEdit,
    goFormNext,
    proceedToPreview,
    finalizeAndFinish,
    handleDelete,

    // stepper
    step,
    setStep,
  };
}
