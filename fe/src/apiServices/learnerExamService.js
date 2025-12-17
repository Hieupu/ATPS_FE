import apiClient from "./apiClient";

export const getAllExamInstancesApi = async () => {
  try {
    const res = await apiClient.get("/exams/instances");
    return res.data.data || [];
  } catch (err) {
    console.error("Get exam instances error:", err);
    throw err.response?.data || { message: "Không thể tải danh sách phiên thi" };
  }
};

export const getExamToDoApi = async (instanceId) => {
  try {
    const res = await apiClient.get(`/exams/instances/${instanceId}`);
    return res.data.data;
  } catch (err) {
    console.error("Get exam to do error:", err);
    throw err.response?.data || { message: "Không thể tải đề thi" };
  }
};

export const saveAnswerApi = async (instanceId, answers) => {
  try {
    const res = await apiClient.post(`/exams/instances/${instanceId}/answers`, {
      answers: Array.isArray(answers) ? answers : [answers]
    });
    return res.data;
  } catch (err) {
    console.error("Save answer error:", err);
    throw err.response?.data || { message: "Không thể lưu câu trả lời" };
  }
};

export const submitExamApi = async (instanceId, payload = {}) => {
  try {
    const requestBody = {
      answers: payload.answers || []
    };
    if (payload.durationSec !== undefined) {
      requestBody.durationSec = payload.durationSec;
    }
    if (payload.content) {
      requestBody.content = payload.content;
    }
    if (payload.assets && Array.isArray(payload.assets)) {
      requestBody.assets = payload.assets;
    }
    const res = await apiClient.post(
      `/exams/instances/${instanceId}/submit`,
      requestBody
    );

    return res.data;
  } catch (err) {
    console.error("Submit exam error:", err);
    throw err.response?.data || { message: "Không thể nộp bài" };
  }
};

export const getExamResultApi = async (instanceId) => {
  try {
    const res = await apiClient.get(`/exams/instances/${instanceId}/result`);
    return res.data.data;
  } catch (err) {
    console.error("Get exam result error:", err);
    throw err.response?.data || { message: "Không thể tải kết quả bài thi" };
  }
};

export const getExamReviewApi = async (instanceId) => {
  try {
    const res = await apiClient.get(`/exams/instances/${instanceId}/review`);
    return res.data.data;
  } catch (err) {
    console.error("Get exam review error:", err);
    throw err.response?.data || { message: "Không thể tải review bài thi" };
  }
};

export const getExamHistoryApi = async () => {
  try {
    const res = await apiClient.get(`/exams/results/history`);
    return res.data.data || [];
  } catch (err) {
    console.error("Get exam history error:", err);
    throw err.response?.data || { message: "Không thể tải lịch sử bài thi" };
  }
};

export const retryExamApi = async (instanceId) => {
  try {
    const res = await apiClient.post(`/exams/instances/${instanceId}/retry`);
    return res.data.data;
  } catch (err) {
    console.error("Retry exam error:", err);
    throw err.response?.data || { message: "Không thể reset bài thi" };
  }
};

export const formatDuration = (seconds) => {
  if (!seconds) return "00:00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

export const formatDurationText = (seconds) => {
  if (!seconds) return "0 giây";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0) parts.push(`${minutes} phút`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} giây`);
  
  return parts.join(' ');
};

export const hasRemainingAttempts = (examInstance) => {
  if (!examInstance) return false;
  
  const { usedAttempt = 0, attempt = 1 } = examInstance;
  return usedAttempt < attempt;
};

export const getRemainingAttempts = (examInstance) => {
  if (!examInstance) return 0;
  
  const { usedAttempt = 0, attempt = 1 } = examInstance;
  return Math.max(0, attempt - usedAttempt);
};

export const buildSubmitPayload = (answers, startTime, options = {}) => {
  const endTime = Date.now();
  const durationSec = Math.floor((endTime - startTime) / 1000);
  const validAnswers = answers.filter(ans => {
    return ans.examQuestionId && ans.answer !== undefined;
  }).map(ans => ({
    examQuestionId: parseInt(ans.examQuestionId),
    answer: String(ans.answer)
  }));
  const payload = {
    answers: validAnswers,
    durationSec
  };
  if (options.metadata) {
    payload.content = {
      totalQuestionsAttempted: options.metadata.totalQuestionsAttempted || validAnswers.length,
      submittedFrom: 'web'

    };
  }
  if (options.assets && Array.isArray(options.assets)) {
    payload.assets = options.assets;
  }
  return payload;
};

export const calculateAccuracy = (correctAnswers, totalQuestions) => {
  if (totalQuestions === 0) return 0;
  return ((correctAnswers / totalQuestions) * 100).toFixed(2);
};


export const getSubmissionStatusColor = (status) => {
  const colors = {
    'submitted': 'success',      
    'late': 'warning',            
    'not_submitted': 'default',   
    'on-time': 'success',         
    'graded': 'info',             
    'returned': 'secondary'       
  };
  return colors[status] || 'default'; 
};

export const getSubmissionStatusText = (status) => {
  const texts = {
    'submitted': 'Đã nộp',
    'late': 'Nộp muộn',
    'not_submitted': 'Chưa nộp',
    'on-time': 'Đúng hạn',        
    'graded': 'Đã chấm',         
    'returned': 'Đã trả bài'     
  };
  return texts[status] || status;
};

export default {
  getAllExamInstancesApi,
  getExamToDoApi,
  saveAnswerApi,
  submitExamApi,
  getExamResultApi,
  getExamReviewApi, 
  getExamHistoryApi,
  retryExamApi,
  
  formatDuration,
  formatDurationText,
  hasRemainingAttempts,
  getRemainingAttempts,
  buildSubmitPayload, 
  calculateAccuracy,
  getSubmissionStatusColor,
  getSubmissionStatusText
};