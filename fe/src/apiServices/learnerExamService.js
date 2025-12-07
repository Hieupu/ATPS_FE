import apiClient from "./apiClient";

// ==================== EXAM LIST APIs ====================

/**
 * Lấy tất cả bài thi của learner với filter tabs
 * Filters: 'all' | 'ongoing' | 'upcoming' | 'completed'
 */
export const getAllExamsApi = async (status = 'all') => {
  try {
    const params = {};
    if (status && status !== 'all') params.status = status;
    
    const response = await apiClient.get("/learner/exams", { params });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get all exams error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài thi" };
  }
};

/**
 * Lấy danh sách bài thi theo course
 */
export const getExamsByCourseApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/learner/exams/course/${courseId}`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get exams by course error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài thi" };
  }
};

// ==================== EXAM DETAIL APIs ====================

/**
 * Lấy thông tin cơ bản của exam (không bao gồm questions)
 */
export const getExamDetailApi = async (examId) => {
  try {
    const response = await apiClient.get(`/learner/exams/${examId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get exam detail error:", error);
    throw error.response?.data || { message: "Không thể tải chi tiết bài thi" };
  }
};

/**
 * Lấy cấu trúc bài thi với sections và questions (để làm bài)
 * Returns: { exam, structure, savedAnswers }
 */
export const getExamStructureApi = async (examId) => {
  try {
    const response = await apiClient.get(`/learner/exams/${examId}/structure`);
    return response.data;
  } catch (error) {
    console.error("Get exam structure error:", error);
    throw error.response?.data || { message: "Không thể tải cấu trúc bài thi" };
  }
};

// ==================== ANSWER MANAGEMENT APIs ====================

/**
 * Lưu một câu trả lời (auto-save)
 */
export const saveAnswerApi = async (examId, examquestionId, answer) => {
  try {
    const response = await apiClient.post(`/learner/exams/${examId}/answers`, {
      examquestionId,
      answer
    });
    return response.data;
  } catch (error) {
    console.error("Save answer error:", error);
    throw error.response?.data || { message: "Không thể lưu câu trả lời" };
  }
};

/**
 * Lưu nhiều câu trả lời cùng lúc (batch)
 */
export const saveAnswersBatchApi = async (examId, answers) => {
  try {
    const response = await apiClient.post(`/learner/exams/${examId}/answers/batch`, {
      answers
    });
    return response.data;
  } catch (error) {
    console.error("Save answers batch error:", error);
    throw error.response?.data || { message: "Không thể lưu câu trả lời" };
  }
};

// ==================== SUBMIT API ====================

/**
 * Nộp bài thi (không cần truyền answers - đã auto-save rồi)
 */
export const submitExamApi = async (examId) => {
  try {
    const response = await apiClient.post(`/learner/exams/${examId}/submit`);
    return response.data;
  } catch (error) {
    console.error("Submit exam error:", error);
    throw error.response?.data || { message: "Không thể nộp bài thi" };
  }
};

// ==================== RESULT APIs ====================

/**
 * Lấy kết quả bài thi
 */
export const getExamResultApi = async (examId) => {
  try {
    const response = await apiClient.get(`/learner/exams/${examId}/result`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Get exam result error:", error);
    throw error.response?.data || { message: "Không thể tải kết quả bài thi" };
  }
};

/**
 * Lấy chi tiết câu trả lời để review sau khi nộp
 * Returns: Array of sections with questions
 */
export const getDetailedAnswersApi = async (examId) => {
  try {
    const response = await apiClient.get(`/learner/exams/${examId}/answers/review`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Get detailed answers error:", error);
    throw error.response?.data || { message: "Không thể tải chi tiết câu trả lời" };
  }
};

// ==================== BACKWARD COMPATIBILITY ====================

/**
 * @deprecated Use getExamStructureApi instead
 * Kept for backward compatibility with old code
 */
export const getExamQuestionsApi = async (examId) => {
  console.warn('⚠️ getExamQuestionsApi is deprecated. Use getExamStructureApi instead.');
  try {
    const res = await getExamStructureApi(examId);
    // Flatten structure to simple questions array
    const questions = [];
    res.structure?.forEach(parent => {
      parent.childSections?.forEach(child => {
        questions.push(...(child.questions || []));
      });
      questions.push(...(parent.directQuestions || []));
    });
    return { questions };
  } catch (error) {
    throw error;
  }
};

/**
 * @deprecated Use getExamResultApi instead
 */
export const getMyLatestExamResultApi = async (examId) => {
  console.warn('⚠️ getMyLatestExamResultApi is deprecated. Use getExamResultApi instead.');
  return await getExamResultApi(examId);
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Flatten hierarchical structure thành mảng questions
 */
export const flattenExamQuestions = (structure) => {
  const questions = [];
  
  const extractQuestions = (sectionList) => {
    for (const section of sectionList) {
      // Add direct questions của parent
      if (section.directQuestions && section.directQuestions.length > 0) {
        questions.push(...section.directQuestions);
      }
      
      // Add questions từ child sections
      if (section.childSections && section.childSections.length > 0) {
        section.childSections.forEach(child => {
          if (child.questions && child.questions.length > 0) {
            questions.push(...child.questions);
          }
        });
      }
      
      // Recursive cho nested sections
      if (section.childSections && section.childSections.length > 0) {
        extractQuestions(section.childSections);
      }
    }
  };
  
  extractQuestions(structure);
  return questions;
};

/**
 * Đếm tổng số câu hỏi trong structure
 */
export const getTotalQuestions = (structure) => {
  return flattenExamQuestions(structure).length;
};

/**
 * Đếm số câu đã trả lời
 */
export const getAnsweredCount = (savedAnswers) => {
  if (!savedAnswers) return 0;
  return Object.keys(savedAnswers).filter(key => {
    const answer = savedAnswers[key];
    return answer !== null && answer !== undefined && answer !== '';
  }).length;
};

/**
 * Kiểm tra bài thi có sẵn sàng làm không
 */
export const isExamAvailable = (exam) => {
  if (!exam) return false;
  return exam.availabilityStatus === 'available' && !exam.isSubmitted;
};

/**
 * Kiểm tra bài thi đã nộp chưa
 */
export const isExamSubmitted = (exam) => {
  if (!exam) return false;
  return exam.isSubmitted === true;
};

/**
 * Format thời gian còn lại (seconds → mm:ss)
 */
export const formatTimeRemaining = (seconds) => {
  if (!seconds || seconds <= 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format điểm (thêm % và làm tròn)
 */
export const formatScore = (score) => {
  if (score === null || score === undefined) return 'Chưa chấm';
  return `${Number(score).toFixed(1)}%`;
};

/**
 * Validate answer trước khi save
 */
export const validateAnswer = (question, answer) => {
  if (!answer || answer.trim() === '') {
    return { valid: false, message: 'Câu trả lời không được để trống' };
  }
  
  if (question.Type === 'multiple_choice') {
    const validOptions = question.options?.map(opt => opt.OptionText) || [];
    if (!validOptions.includes(answer)) {
      return { valid: false, message: 'Đáp án không hợp lệ' };
    }
  }
  
  return { valid: true };
};

// ==================== CONSTANTS ====================

export const EXAM_STATUS_LABELS = {
  'available': 'Có thể làm bài',
  'not_started': 'Chưa đến giờ',
  'expired': 'Đã hết hạn',
  'submitted': 'Đã nộp bài'
};

export const EXAM_STATUS_COLORS = {
  'available': 'success',
  'not_started': 'warning',
  'expired': 'error',
  'submitted': 'info'
};

export const TAB_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'ongoing', label: 'Đang mở' },
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'completed', label: 'Đã hoàn thành' }
];

export const QUESTION_TYPE_LABELS = {
  'multiple_choice': 'Trắc nghiệm',
  'true_false': 'Đúng/Sai',
  'fill_in_blank': 'Điền vào chỗ trống',
  'matching': 'Nối câu',
  'essay': 'Tự luận',
  'speaking': 'Speaking'
};