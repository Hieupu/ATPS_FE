import apiClient from "./apiClient";

// ==================== EXAM CRUD ====================

export const getExamsApi = async (filters = {}) => {
  try {
    const params = {};
    if (filters.status) params.status = filters.status;
    
    const response = await apiClient.get("/instructor/exams", { params });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get exams error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài thi" };
  }
};

export const getExamByIdApi = async (examId) => {
  try {
    const response = await apiClient.get(`/instructor/exams/${examId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get exam detail error:", error);
    throw error.response?.data || { message: "Không thể tải chi tiết bài thi" };
  }
};

// Backwards-compatible alias: some pages import `getExamDetailApi`
export const getExamDetailApi = getExamByIdApi;

export const createExamApi = async (examData) => {
  try {
    const response = await apiClient.post("/instructor/exams", examData);
    return response.data;
  } catch (error) {
    console.error("Create exam error:", error);
    throw error.response?.data || { message: "Không thể tạo bài thi" };
  }
};

export const updateExamApi = async (examId, examData) => {
  try {
    const response = await apiClient.put(`/instructor/exams/${examId}`, examData);
    return response.data;
  } catch (error) {
    console.error("Update exam error:", error);
    throw error.response?.data || { message: "Không thể cập nhật bài thi" };
  }
};

export const deleteExamApi = async (examId) => {
  try {
    const response = await apiClient.delete(`/instructor/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error("Delete exam error:", error);
    throw error.response?.data || { message: "Không thể xóa bài thi" };
  }
};

export const cloneExamApi = async (examId, newTitle) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/clone`, { newTitle });
    return response.data;
  } catch (error) {
    console.error("Clone exam error:", error);
    throw error.response?.data || { message: "Không thể nhân bản bài thi" };
  }
};

export const publishExamApi = async (examId) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/publish`);
    return response.data;
  } catch (error) {
    console.error("Publish exam error:", error);
    throw error.response?.data || { message: "Không thể publish bài thi" };
  }
};

export const archiveExamApi = async (examId) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/archive`);
    return response.data;
  } catch (error) {
    console.error("Archive exam error:", error);
    throw error.response?.data || { message: "Không thể lưu trữ bài thi" };
  }
};

export const unarchiveExamApi = async (examId) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/unarchive`);
    return response.data;
  } catch (error) {
    console.error("Unarchive exam error:", error);
    throw error.response?.data || { message: "Không thể khôi phục bài thi" };
  }
};

export const getArchivedExamsApi = async () => {
  try {
    const response = await apiClient.get("/instructor/exams/archived");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get archived exams error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài thi đã lưu trữ" };
  }
};

// ==================== SECTION MANAGEMENT ====================

export const getSectionsApi = async (examId, hierarchical = true) => {
  try {
    const params = { hierarchical };
    const response = await apiClient.get(`/instructor/exams/${examId}/sections`, { params });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get sections error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách phần thi" };
  }
};

export const getSectionDetailApi = async (examId, sectionId) => {
  try {
    const response = await apiClient.get(`/instructor/exams/${examId}/sections/${sectionId}`);
    return response.data.data || response.data || {};
  } catch (error) {
    console.error("Get section detail error:", error);
    throw error.response?.data || { message: "Không thể tải chi tiết phần thi" };
  }
};

export const getClassesByCourseApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/instructor/course/${courseId}/classes`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get classes by course error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách lớp học" };
  }
};

export const createSectionApi = async (examId, sectionData) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/sections`, sectionData);
    return response.data;
  } catch (error) {
    console.error("Create section error:", error);
    throw error.response?.data || { message: "Không thể tạo phần thi" };
  }
};

export const updateSectionApi = async (examId, sectionId, sectionData) => {
  try {
    const response = await apiClient.put(`/instructor/exams/${examId}/sections/${sectionId}`, sectionData);
    return response.data;
  } catch (error) {
    console.error("Update section error:", error);
    throw error.response?.data || { message: "Không thể cập nhật phần thi" };
  }
};

export const deleteSectionApi = async (examId, sectionId) => {
  try {
    const response = await apiClient.delete(`/instructor/exams/${examId}/sections/${sectionId}`);
    return response.data;
  } catch (error) {
    console.error("Delete section error:", error);
    throw error.response?.data || { message: "Không thể xóa phần thi" };
  }
};

// Backwards-compatible aliases for section endpoints used across the UI
export const createExamSectionApi = async (examId, sectionData) => {
  return await createSectionApi(examId, sectionData);
};

export const updateExamSectionApi = async (examId, sectionId, sectionData) => {
  return await updateSectionApi(examId, sectionId, sectionData);
};

export const deleteExamSectionApi = async (examId, sectionId) => {
  return await deleteSectionApi(examId, sectionId);
};

export const reorderSectionsApi = async (examId, reorderData) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/sections/reorder`, { reorderData });
    return response.data;
  } catch (error) {
    console.error("Reorder sections error:", error);
    throw error.response?.data || { message: "Không thể sắp xếp lại phần thi" };
  }
};

// ==================== QUESTION BANK ====================

export const getQuestionsApi = async (filters = {}) => {
  try {
    const params = {};
    if (filters.topic) params.topic = filters.topic;
    if (filters.level) params.level = filters.level;
    if (filters.type) params.type = filters.type;
    
    const response = await apiClient.get("/instructor/questions", { params });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get questions error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách câu hỏi" };
  }
};

export const createQuestionApi = async (questionData) => {
  try {
    const response = await apiClient.post("/instructor/questions", questionData);
    return response.data;
  } catch (error) {
    console.error("Create question error:", error);
    throw error.response?.data || { message: "Không thể tạo câu hỏi" };
  }
};

export const updateQuestionApi = async (questionId, questionData) => {
  try {
    const response = await apiClient.put(`/instructor/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error("Update question error:", error);
    throw error.response?.data || { message: "Không thể cập nhật câu hỏi" };
  }
};

export const deleteQuestionApi = async (questionId) => {
  try {
    const response = await apiClient.delete(`/instructor/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Delete question error:", error);
    throw error.response?.data || { message: "Không thể xóa câu hỏi" };
  }
};

// ==================== SECTION-QUESTION MANAGEMENT ====================

export const getQuestionsBySectionApi = async (sectionId) => {
  try {
    const response = await apiClient.get(`/instructor/sections/${sectionId}/questions`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get questions by section error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách câu hỏi" };
  }
};

export const addQuestionToSectionApi = async (sectionId, questionId) => {
  try {
    const response = await apiClient.post(`/instructor/sections/${sectionId}/questions`, { questionId });
    return response.data;
  } catch (error) {
    console.error("Add question to section error:", error);
    throw error.response?.data || { message: "Không thể thêm câu hỏi vào phần thi" };
  }
};

// Flexible: addQuestionsToSectionApi(examId, sectionId, questionIds[]) or addQuestionsToSectionApi(sectionId, questionId)
export const addQuestionsToSectionApi = async (...args) => {
  try {
    if (args.length === 3) {
      const [examId, sectionId, questionIds] = args;
      const response = await apiClient.post(
        `/instructor/exams/${examId}/sections/${sectionId}/questions`,
        { questionIds }
      );
      return response.data;
    } else if (args.length === 2) {
      const [sectionId, questionId] = args;
      return await addQuestionToSectionApi(sectionId, questionId);
    } else {
      throw new Error("Invalid arguments for addQuestionsToSectionApi");
    }
  } catch (error) {
    console.error("Add questions to section error:", error);
    throw error.response?.data || { message: "Không thể thêm câu hỏi vào phần thi" };
  }
};

// Flexible: removeQuestionFromSectionApi(examId, sectionId, questionId) or removeQuestionFromSectionApi(sectionId, examQuestionId)
export const removeQuestionFromSectionApi = async (...args) => {
  try {
    if (args.length === 3) {
      const [examId, sectionId, questionId] = args;
      const response = await apiClient.delete(
        `/instructor/exams/${examId}/sections/${sectionId}/questions/${questionId}`
      );
      return response.data;
    } else if (args.length === 2) {
      const [sectionId, examQuestionId] = args;
      const response = await apiClient.delete(
        `/instructor/sections/${sectionId}/questions/${examQuestionId}`
      );
      return response.data;
    } else {
      throw new Error("Invalid arguments for removeQuestionFromSectionApi");
    }
  } catch (error) {
    console.error("Remove question from section error:", error);
    throw error.response?.data || { message: "Không thể xóa câu hỏi khỏi phần thi" };
  }
};

export const reorderQuestionsApi = async (sectionId, reorderData) => {
  try {
    const response = await apiClient.post(
      `/instructor/sections/${sectionId}/questions/reorder`,
      { reorderData }
    );
    return response.data;
  } catch (error) {
    console.error("Reorder questions error:", error);
    throw error.response?.data || { message: "Không thể sắp xếp lại câu hỏi" };
  }
};

// ==================== EXCEL IMPORT ====================

export const importQuestionsFromExcelApi = async (examId, sectionId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `/instructor/exams/${examId}/sections/${sectionId}/questions/import`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (error) {
    console.error("Import Excel error:", error);
    throw error.response?.data || { message: "Không thể import câu hỏi từ Excel" };
  }
};

// Lấy danh sách instance của 1 exam
export const getExamInstancesApi = async (examId) => {
  try {
    const response = await apiClient.get(`/instructor/exams/${examId}/instances`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get exam instances error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài gắn" };
  }
};

// Tạo exam instance (Assignment / Exam)
export const createExamInstanceApi = async (examId, instanceData) => {
  try {
    const response = await apiClient.post(
      `/instructor/exams/${examId}/instances`,
      instanceData
    );
    return response.data;
  } catch (error) {
    console.error("Create exam instance error:", error);
    throw error.response?.data || { message: "Không thể gắn bài cho lớp / unit" };
  }
};

// Cập nhật exam instance
export const updateExamInstanceApi = async (examId, instanceId, instanceData) => {
  try {
    // ✅ LOG TRƯỚC KHI GỬI
    console.log("📤 UPDATE EXAM INSTANCE REQUEST:");
    console.log("  - URL:", `/instructor/exams/${examId}/instances/${instanceId}`);
    console.log("  - Payload BEFORE stringify:", instanceData);
    console.log("  - classId type:", typeof instanceData.classId);
    console.log("  - classId isArray:", Array.isArray(instanceData.classId));
    console.log("  - classId value:", instanceData.classId);
    
    // ✅ ĐẢNG BẢO KHÔNG BỊ STRINGIFY 2 LẦN
    const response = await apiClient.put(
      `/instructor/exams/${examId}/instances/${instanceId}`,
      instanceData  // ← KHÔNG stringify ở đây, để axios tự xử lý
    );
    
    console.log("✅ Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Update exam instance error:", error);
    console.error("  - Request data:", error.config?.data);
    throw error.response?.data || { message: "Không thể cập nhật phiên thi" };
  }
};


// Xóa exam instance
export const deleteExamInstanceApi = async (examId, instanceId) => {
  try {
    const response = await apiClient.delete(
      `/instructor/exams/${examId}/instances/${instanceId}`
    );
    return response.data;
  } catch (error) {
    console.error("Delete exam instance error:", error);
    throw error.response?.data || { message: "Không thể xoá bài gắn" };
  }
};

// Lấy danh sách khoá học của giảng viên
export const getInstructorCoursesApi = async () => {
  try {
    const res = await apiClient.get("/instructor/courses");

    // Backend trả raw array → res.data chính là mảng
    const list = Array.isArray(res.data)
      ? res.data
      : res.data?.data || [];

    console.log("📌 Parsed course list:", list);

    return list.map(c => ({
      value: c.CourseID,
      label: c.Title
    }));

  } catch (err) {
    console.error("❌ getInstructorCoursesApi error:", err);
    return [];
  }
};

// Lấy danh sách unit theo khoá học
export const getUnitByCourseApi = async (courseId) => {
  try {
    const res = await apiClient.get(`/instructor/course/${courseId}/units`);
    return res.data.units || [];
  } catch (err) {
    console.error("getUnitByCourseApi error:", err?.response?.data || err.message);
    return [];
  }
};
export const createFullExamApi = async (fullExamData) => {
  try {
    const response = await apiClient.post("/instructor/exams/full", fullExamData);
    return response.data;
  } catch (error) {
    console.error("Create Full Exam API error:", error);
    throw error.response?.data || { message: "Không thể tạo full exam" };
  }
};

// ==================== VALIDATION HELPERS ====================

export const validateExamData = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "Tiêu đề là bắt buộc";
  }

  if (!data.description?.trim()) {
    errors.description = "Mô tả là bắt buộc";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSectionData = (data) => {
  const errors = {};

  const validSectionTypes = ["Listening", "Speaking", "Reading", "Writing"];

  if (!data.type) {
    errors.type = "Loại section là bắt buộc";
  } else if (!validSectionTypes.includes(data.type)) {
    errors.type = `Loại section không hợp lệ. Cho phép: ${validSectionTypes.join(", ")}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateQuestionData = (data) => {
  const errors = {};

  if (!data.content?.trim()) {
    errors.content = "Nội dung câu hỏi là bắt buộc";
  }

  if (!data.type) {
    errors.type = "Loại câu hỏi là bắt buộc";
  }

  const validTypes = [
    "multiple_choice",
    "true_false",
    "fill_in_blank",
    "matching",
    "essay",
    "speaking",
  ];
  if (data.type && !validTypes.includes(data.type)) {
    errors.type = "Loại câu hỏi không hợp lệ";
  }

  const validLevels = ["Easy", "Medium", "Hard"];
  if (data.level && !validLevels.includes(data.level)) {
    errors.level = "Độ khó không hợp lệ";
  }

  if (data.point && (data.point < 0 || data.point > 100)) {
    errors.point = "Điểm phải từ 0 đến 100";
  }

  switch (data.type) {
    case "multiple_choice":
      if (!Array.isArray(data.options) || data.options.length < 2) {
        errors.options = "Cần ít nhất 2 lựa chọn";
      } else {
        const hasCorrect = data.options.some((o) => o.isCorrect === true);
        if (!hasCorrect) {
          errors.options = "Phải có ít nhất 1 đáp án đúng";
        }
      }
      break;
    case "true_false":
      if (
        !["true", "false"].includes(String(data.correctAnswer).toLowerCase())
      ) {
        errors.correctAnswer = "Đáp án đúng phải là 'true' hoặc 'false'";
      }
      break;
    case "fill_in_blank":
      if (!data.correctAnswer?.trim()) {
        errors.correctAnswer = "Đáp án đúng là bắt buộc";
      }
      break;
    default:
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==================== HELPER FUNCTIONS ====================

export const flattenSections = (sections) => {
  const result = [];

  const flatten = (sectionList, parentId = null) => {
    for (const section of sectionList) {
      result.push({
        ...section,
        ParentSectionId: parentId,
      });

      if (section.childSections && section.childSections.length > 0) {
        flatten(section.childSections, section.SectionId);
      }
    }
  };

  flatten(sections);
  return result;
};

export const buildSectionHierarchy = (flatSections) => {
  const sectionMap = new Map();
  const rootSections = [];

  flatSections.forEach((section) => {
    sectionMap.set(section.SectionId, {
      ...section,
      childSections: [],
    });
  });

  flatSections.forEach((section) => {
    const sectionNode = sectionMap.get(section.SectionId);

    if (
      section.ParentSectionId === null ||
      section.ParentSectionId === undefined
    ) {
      rootSections.push(sectionNode);
    } else {
      const parent = sectionMap.get(section.ParentSectionId);
      if (parent) {
        parent.childSections.push(sectionNode);
      }
    }
  });

  return rootSections;
};

export const getAllQuestionIds = (sections) => {
  const questionIds = [];

  const extractIds = (sectionList) => {
    for (const section of sectionList) {
      if (section.directQuestions && section.directQuestions.length > 0) {
        section.directQuestions.forEach((q) =>
          questionIds.push(q.QuestionID)
        );
      }

      if (section.childSections && section.childSections.length > 0) {
        section.childSections.forEach((child) => {
          if (child.questions && child.questions.length > 0) {
            child.questions.forEach((q) => questionIds.push(q.QuestionID));
          }
        });
      }

      if (section.childSections && section.childSections.length > 0) {
        extractIds(section.childSections);
      }
    }
  };

  extractIds(sections);
  return [...new Set(questionIds)];
};

export const getTotalQuestions = (sections) => {
  return getAllQuestionIds(sections).length;
};

// ==================== CONSTANTS ====================

export const SECTION_TYPES = [
  { value: "Listening", label: "Listening" },
  { value: "Speaking", label: "Speaking" },
  { value: "Reading", label: "Reading" },
  { value: "Writing", label: "Writing" },
];

export const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True/False" },
  { value: "fill_in_blank", label: "Fill in the Blank" },
  { value: "matching", label: "Matching" },
  { value: "essay", label: "Essay" },
  { value: "speaking", label: "Speaking" },
];

export const QUESTION_LEVELS = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

export const EXAM_STATUSES = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Archived", label: "Archived" },
];
