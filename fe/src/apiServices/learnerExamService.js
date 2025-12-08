import apiClient from "./apiClient";

// ==================== EXAM INSTANCE APIs ====================
// Backend route: GET /api/exams/instances
export const getAllExamInstancesApi = async () => {
  try {
    const res = await apiClient.get("/exams/instances");
    return res.data.data || [];
  } catch (err) {
    console.error("Get exam instances error:", err);
    throw err.response?.data || { message: "Không thể tải danh sách phiên thi" };
  }
};

// ==================== EXAM DETAIL (TO DO) ====================
// Backend route: GET /api/exams/instances/:instanceId
export const getExamToDoApi = async (instanceId) => {
  try {
    const res = await apiClient.get(`/exams/instances/${instanceId}`);
    return res.data.data;
  } catch (err) {
    console.error("Get exam to do error:", err);
    throw err.response?.data || { message: "Không thể tải đề thi" };
  }
};

// ==================== SAVE ANSWER (AUTO-SAVE) ====================
// Backend route: POST /api/exams/instances/:instanceId/answers
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

// ==================== SUBMIT EXAM ====================
// Backend route: POST /api/exams/instances/:instanceId/submit
export const submitExamApi = async (instanceId, answers) => {
  try {
    const res = await apiClient.post(`/exams/instances/${instanceId}/submit`, {
      answers: answers || []
    });
    return res.data;
  } catch (err) {
    console.error("Submit exam error:", err);
    throw err.response?.data || { message: "Không thể nộp bài" };
  }
};

// ==================== EXAM RESULT ====================
// Backend route: GET /api/exams/instances/:instanceId/result
export const getExamResultApi = async (instanceId) => {
  try {
    const res = await apiClient.get(`/exams/instances/${instanceId}/result`);
    return res.data.data;
  } catch (err) {
    console.error("Get exam result error:", err);
    throw err.response?.data || { message: "Không thể tải kết quả bài thi" };
  }
};

// ==================== EXAM HISTORY ====================
// Backend route: GET /api/exams/results/history
export const getExamHistoryApi = async () => {
  try {
    const res = await apiClient.get(`/exams/results/history`);
    return res.data.data || [];
  } catch (err) {
    console.error("Get exam history error:", err);
    throw err.response?.data || { message: "Không thể tải lịch sử bài thi" };
  }
};

// ==================== RETRY EXAM ====================
// Backend route: POST /api/exams/instances/:instanceId/retry
export const retryExamApi = async (instanceId) => {
  try {
    const res = await apiClient.post(`/exams/instances/${instanceId}/retry`);
    return res.data.data;
  } catch (err) {
    console.error("Retry exam error:", err);
    throw err.response?.data || { message: "Không thể reset bài thi" };
  }
};
