import apiClient from "./apiClient";

// ==================== EXAM CRUD ====================

// Lấy danh sách exams
export const getExamsApi = async (filters = {}) => {
  try {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.courseId) params.courseId = filters.courseId;
    
    const response = await apiClient.get("/instructor/exams", { params });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get exams error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài thi" };
  }
};

// Lấy chi tiết exam (UPDATED: getExamByIdApi)
export const getExamByIdApi = async (examId) => {
  try {
    const response = await apiClient.get(`/instructor/exams/${examId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get exam detail error:", error);
    throw error.response?.data || { message: "Không thể tải chi tiết bài thi" };
  }
};

// Alias for compatibility
export const getExamDetailApi = getExamByIdApi;

// Tạo exam mới
export const createExamApi = async (examData) => {
  try {
    const response = await apiClient.post("/instructor/exams", examData);
    return response.data;
  } catch (error) {
    console.error("Create exam error:", error);
    throw error.response?.data || { message: "Không thể tạo bài thi" };
  }
};

// Cập nhật exam
export const updateExamApi = async (examId, examData) => {
  try {
    const response = await apiClient.put(`/instructor/exams/${examId}`, examData);
    return response.data;
  } catch (error) {
    console.error("Update exam error:", error);
    throw error.response?.data || { message: "Không thể cập nhật bài thi" };
  }
};

// Xóa exam
export const deleteExamApi = async (examId) => {
  try {
    const response = await apiClient.delete(`/instructor/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error("Delete exam error:", error);
    throw error.response?.data || { message: "Không thể xóa bài thi" };
  }
};

// Lưu trữ exam
export const archiveExamApi = async (examId) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/archive`);
    return response.data;
  } catch (error) {
    console.error("Archive exam error:", error);
    throw error.response?.data || { message: "Không thể lưu trữ bài thi" };
  }
};

// Lấy danh sách exam đã lưu trữ
export const getArchivedExamsApi = async () => {
  try {
    const response = await apiClient.get("/instructor/exams/archived");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get archived exams error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài thi đã lưu trữ" };
  }
};

// ==================== CLASS MANAGEMENT ====================

// Lấy danh sách lớp học theo khóa học
export const getClassesByCourseApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/instructor/courses/${courseId}/classes`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get classes by course error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách lớp học" };
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
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get section detail error:", error);
    throw error.response?.data || { message: "Không thể tải chi tiết phần thi" };
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

// Alias for compatibility
export const createExamSectionApi = createSectionApi;

export const updateSectionApi = async (examId, sectionId, sectionData) => {
  try {
    const response = await apiClient.put(`/instructor/exams/${examId}/sections/${sectionId}`, sectionData);
    return response.data;
  } catch (error) {
    console.error("Update section error:", error);
    throw error.response?.data || { message: "Không thể cập nhật phần thi" };
  }
};

// Alias for compatibility
export const updateExamSectionApi = updateSectionApi;

export const deleteSectionApi = async (examId, sectionId) => {
  try {
    const response = await apiClient.delete(`/instructor/exams/${examId}/sections/${sectionId}`);
    return response.data;
  } catch (error) {
    console.error("Delete section error:", error);
    throw error.response?.data || { message: "Không thể xóa phần thi" };
  }
};

// Alias for compatibility
export const deleteExamSectionApi = deleteSectionApi;

// ==================== QUESTION BANK ====================

// Lấy danh sách câu hỏi
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

// Lấy chi tiết câu hỏi (CORRECTED: getQuestionByIdApi)
export const getQuestionByIdApi = async (questionId) => {
  try {
    const response = await apiClient.get(`/instructor/questions/${questionId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get question detail error:", error);
    throw error.response?.data || { message: "Không thể tải chi tiết câu hỏi" };
  }
};

// Alias for compatibility
export const getQuestionDetailApi = getQuestionByIdApi;

// Tạo câu hỏi mới
export const createQuestionApi = async (questionData) => {
  try {
    const response = await apiClient.post("/instructor/questions", questionData);
    return response.data;
  } catch (error) {
    console.error("Create question error:", error);
    throw error.response?.data || { message: "Không thể tạo câu hỏi" };
  }
};

// Cập nhật câu hỏi
export const updateQuestionApi = async (questionId, questionData) => {
  try {
    const response = await apiClient.put(`/instructor/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error("Update question error:", error);
    throw error.response?.data || { message: "Không thể cập nhật câu hỏi" };
  }
};

// Xóa câu hỏi
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

export const addQuestionsToSectionApi = async (examId, sectionId, questionIds) => {
  try {
    const response = await apiClient.post(
      `/instructor/exams/${examId}/sections/${sectionId}/questions`,
      { questionIds }
    );
    return response.data;
  } catch (error) {
    console.error("Add questions to section error:", error);
    throw error.response?.data || { message: "Không thể thêm câu hỏi vào phần thi" };
  }
};


export const removeQuestionFromSectionApi = async (examId, sectionId, questionId) => {
  try {
    const response = await apiClient.delete(
      `/instructor/exams/${examId}/sections/${sectionId}/questions/${questionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Remove question from section error:", error);
    throw error.response?.data || { message: "Không thể xóa câu hỏi khỏi phần thi" };
  }
};

export const updateQuestionOrderApi = async (examId, sectionId, questionId, orderIndex) => {
  try {
    const response = await apiClient.put(
      `/instructor/exams/${examId}/sections/${sectionId}/questions/${questionId}/order`,
      { orderIndex }
    );
    return response.data;
  } catch (error) {
    console.error("Update question order error:", error);
    throw error.response?.data || { message: "Không thể cập nhật thứ tự câu hỏi" };
  }
};

// ==================== GRADING ====================

// Lấy danh sách kết quả thi
export const getExamResultsApi = async (examId, classId) => {
  try {
    const response = await apiClient.get(`/instructor/exams/${examId}/classes/${classId}/results`);
    return response.data;
  } catch (error) {
    console.error("Get exam results error:", error);
    throw error.response?.data || { message: "Không thể tải kết quả thi" };
  }
};

// Lấy bài thi của learner để chấm
export const getLearnerSubmissionApi = async (examId, learnerId) => {
  try {
    const response = await apiClient.get(`/instructor/exams/${examId}/learners/${learnerId}/submission`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get learner submission error:", error);
    throw error.response?.data || { message: "Không thể tải bài làm của học viên" };
  }
};

// Chấm bài tự động
export const autoGradeExamApi = async (examId, learnerId) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/learners/${learnerId}/auto-grade`);
    return response.data;
  } catch (error) {
    console.error("Auto grade exam error:", error);
    throw error.response?.data || { message: "Không thể chấm bài tự động" };
  }
};

// Chấm bài thủ công
export const manualGradeExamApi = async (examId, learnerId, score, feedback) => {
  try {
    const response = await apiClient.post(
      `/instructor/exams/${examId}/learners/${learnerId}/manual-grade`,
      { score, feedback }
    );
    return response.data;
  } catch (error) {
    console.error("Manual grade exam error:", error);
    throw error.response?.data || { message: "Không thể chấm bài" };
  }
};
// Khôi phục exam từ lưu trữ
export const unarchiveExamApi = async (examId) => {
  try {
    const response = await apiClient.post(`/instructor/exams/${examId}/unarchive`);
    return response.data;
  } catch (error) {
    console.error("Unarchive exam error:", error);
    throw error.response?.data || { message: "Không thể khôi phục bài thi" };
  }
};

// ==================== VALIDATION HELPERS (FRONTEND) ====================

export const validateExamData = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "Tiêu đề là bắt buộc";
  }

  if (!data.courseId) {
    errors.courseId = "Khóa học là bắt buộc";
  }

  if (!data.description?.trim()) {
    errors.description = "Mô tả là bắt buộc";
  }

  if (!data.startTime) {
    errors.startTime = "Thời gian bắt đầu là bắt buộc";
  }

  if (!data.endTime) {
    errors.endTime = "Thời gian kết thúc là bắt buộc";
  }

  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      errors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
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

  if (data.orderIndex === undefined || data.orderIndex < 0) {
    errors.orderIndex = "OrderIndex phải >= 0";
  }

  // parentSectionId là optional, không cần validate

  return {
    isValid: Object.keys(errors).length === 0,
    errors
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

  const validTypes = ["multiple_choice", "true_false", "fill_in_blank", "matching", "essay", "speaking"];
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
        const hasCorrect = data.options.some(o => o.isCorrect === true);
        if (!hasCorrect) {
          errors.options = "Phải có ít nhất 1 đáp án đúng";
        }
      }
      break;
    case "true_false":
      if (!["true", "false"].includes(String(data.correctAnswer).toLowerCase())) {
        errors.correctAnswer = "Đáp án đúng phải là 'true' hoặc 'false'";
      }
      break;
    case "fill_in_blank":
      if (!data.correctAnswer?.trim()) {
        errors.correctAnswer = "Đáp án đúng là bắt buộc";
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const flattenSections = (sections) => {
  const result = [];
  
  const flatten = (sectionList, parentId = null) => {
    for (const section of sectionList) {
      result.push({
        ...section,
        ParentSectionId: parentId
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
  
  // Create a map of all sections
  flatSections.forEach(section => {
    sectionMap.set(section.SectionId, {
      ...section,
      childSections: []
    });
  });
  
  // Build hierarchy
  flatSections.forEach(section => {
    const sectionNode = sectionMap.get(section.SectionId);
    
    if (section.ParentSectionId === null || section.ParentSectionId === undefined) {
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
      // Add questions from direct questions
      if (section.directQuestions && section.directQuestions.length > 0) {
        section.directQuestions.forEach(q => questionIds.push(q.QuestionID));
      }
      
      // Add questions from child sections
      if (section.childSections && section.childSections.length > 0) {
        section.childSections.forEach(child => {
          if (child.questions && child.questions.length > 0) {
            child.questions.forEach(q => questionIds.push(q.QuestionID));
          }
        });
      }
      
      // Recursively process child sections
      if (section.childSections && section.childSections.length > 0) {
        extractIds(section.childSections);
      }
    }
  };
  
  extractIds(sections);
  return [...new Set(questionIds)]; // Remove duplicates
};


export const getTotalQuestions = (sections) => {
  return getAllQuestionIds(sections).length;
};

export const formatExamDataForApi = (formData) => {
  return {
    CourseID: formData.courseId,
    Title: formData.title,
    Description: formData.description,
    StartTime: formData.startTime,
    EndTime: formData.endTime,
    Status: formData.status || 'Pending',
    isRandomQuestion: formData.isRandomQuestion ? 1 : 0,
    isRandomAnswer: formData.isRandomAnswer ? 1 : 0,
    sections: formData.sections || [],
    classIds: formData.classIds || []
  };
};

export const formatSectionDataForApi = (formData) => {
  return {
    type: formData.type,
    orderIndex: formData.orderIndex,
    parentSectionId: formData.parentSectionId || null
  };
};


export const SECTION_TYPES = [
  { value: "Listening", label: "Listening" },
  { value: "Speaking", label: "Speaking" },
  { value: "Reading", label: "Reading" },
  { value: "Writing", label: "Writing" }
];

export const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True/False" },
  { value: "fill_in_blank", label: "Fill in the Blank" },
  { value: "matching", label: "Matching" },
  { value: "essay", label: "Essay" },
  { value: "speaking", label: "Speaking" }
];

export const QUESTION_LEVELS = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" }
];


export const EXAM_STATUSES = [
  { value: "Pending", label: "Pending" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Archived", label: "Archived" }
];