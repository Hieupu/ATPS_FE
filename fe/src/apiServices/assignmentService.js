// assignmentService.js
import apiClient from "./apiClient";

/** =========================
 *  Assignments (Instructor)
 *  ========================= */

// Lấy danh sách tất cả bài tập của giảng viên
export const getAssignmentsApi = async () => {
  try {
    const response = await apiClient.get("/instructor/assignments");
    return response.data;
  } catch (error) {
    console.error("Get assignments error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài tập" };
  }
};

// (Tùy BE có route hay chưa) Lấy chi tiết một bài tập
export const getAssignmentByIdApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/instructor/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Get assignment error:", error);
    throw error.response?.data || { message: "Không thể tải thông tin bài tập" };
  }
};

// Tạo bài tập mới
export const createAssignmentApi = async (assignmentData) => {
  try {
    const response = await apiClient.post("/instructor/assignments", assignmentData);
    return response.data;
  } catch (error) {
    console.error("Create assignment error:", error);
    throw error.response?.data || { message: "Không thể tạo bài tập" };
  }
};

// Cập nhật bài tập
export const updateAssignmentApi = async (assignmentId, assignmentData) => {
  try {
    const response = await apiClient.put(`/instructor/assignments/${assignmentId}`, assignmentData);
    return response.data;
  } catch (error) {
    console.error("Update assignment error:", error);
    throw error.response?.data || { message: "Không thể cập nhật bài tập" };
  }
};

/** =========================
 *  Status / Soft Delete
 *  ========================= */

// Đổi trạng thái bài tập (active | inactive | deleted)
export const patchAssignmentStatusApi = async (assignmentId, status) => {
  try {
    const response = await apiClient.patch(`/instructor/assignments/${assignmentId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Patch assignment status error:", error);
    throw error.response?.data || { message: "Không thể cập nhật trạng thái bài tập" };
  }
};

// Xóa mềm (giữ tương thích ngược cho code cũ từng gọi DELETE)
export const deleteAssignmentApi = async (assignmentId) => {
  // Thực chất gọi PATCH status = "inactive"
  return patchAssignmentStatusApi(assignmentId, "inactive");
};

/** =========================
 *  Submissions (Instructor)
 *  ========================= */

// Lấy danh sách submissions của một bài tập (cho giảng viên)
export const getAssignmentSubmissionsApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/instructor/assignments/${assignmentId}/submissions`);
    return response.data;
  } catch (error) {
    console.error("Get submissions error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài nộp" };
  }
};

// Chấm điểm một submission
export const gradeSubmissionApi = async (submissionId, gradeData) => {
  try {
    const response = await apiClient.post(`/instructor/submissions/${submissionId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    console.error("Grade submission error:", error);
    throw error.response?.data || { message: "Không thể chấm điểm" };
  }
};

/** =========================
 *  Student-side helpers
 *  ========================= */

// Lấy bài tập theo Unit (cho học viên)
export const getAssignmentsByUnitApi = async (unitId) => {
  try {
    const response = await apiClient.get(`/instructor/units/${unitId}/assignments`);
    return response.data;
  } catch (error) {
    console.error("Get unit assignments error:", error);
    throw error.response?.data || { message: "Không thể tải bài tập của unit" };
  }
};

// Nộp bài tập (cho học viên)
export const submitAssignmentApi = async (assignmentId, submissionData) => {
  try {
    const response = await apiClient.post(`/instructor/assignments/${assignmentId}/submit`, submissionData);
    return response.data;
  } catch (error) {
    console.error("Submit assignment error:", error);
    throw error.response?.data || { message: "Không thể nộp bài tập" };
  }
};

// Lấy submission của học viên cho một bài tập
export const getMySubmissionApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/instructor/assignments/${assignmentId}/my-submission`);
    return response.data;
  } catch (error) {
    console.error("Get my submission error:", error);
    throw error.response?.data || { message: "Không thể tải bài nộp của bạn" };
  }
};
