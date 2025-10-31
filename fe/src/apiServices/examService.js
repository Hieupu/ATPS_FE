import apiClient from "./apiClient";

export const getExamsByCourseApi = async (courseId) => {
  const res = await apiClient.get(`/exams/course/${courseId}`);
  return res.data; // { exams }
};

export const getExamQuestionsApi = async (examId) => {
  const res = await apiClient.get(`/exams/${examId}/questions`);
  return res.data; // { questions }
};

export const submitExamApi = async (examId, answers) => {
  const res = await apiClient.post(`/exams/${examId}/submit`, { answers });
  return res.data; // { message, result }
};

export const getMyLatestExamResultApi = async (examId) => {
  const res = await apiClient.get(`/exams/${examId}/result/latest`);
  return res.data; // { result }
};